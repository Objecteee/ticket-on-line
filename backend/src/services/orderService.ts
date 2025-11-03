import { Op } from 'sequelize';
import Order, { OrderStatus } from '../models/Order';
import Refund from '../models/Refund';
import TicketSale from '../models/TicketSale';
import { replenishOnRefund } from './inventoryService';

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  order_number?: string;
  user_id?: number;
  train_number?: string;
  order_status?: OrderStatus;
  travel_date_start?: string;
  travel_date_end?: string;
}

export const listOrders = async (params: OrderListParams) => {
  const { page = 1, pageSize = 10, order_number, user_id, train_number, order_status, travel_date_start, travel_date_end } = params;
  const where: any = {};
  if (order_number) where.order_number = { [Op.like]: `%${order_number}%` };
  if (user_id) where.user_id = user_id;
  if (train_number) where.train_number = { [Op.like]: `%${train_number}%` };
  if (order_status) where.order_status = order_status;
  if (travel_date_start && travel_date_end) where.travel_date = { [Op.between]: [travel_date_start, travel_date_end] };

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Order.findAndCountAll({ where, order: [['created_at', 'DESC']], limit: pageSize, offset });
  return { list: rows, total: count, page, pageSize };
};

export const getOrderById = async (id: number) => {
  const order = await Order.findByPk(id);
  if (!order) throw new Error('订单不存在');
  return order;
};

export const cancelOrder = async (id: number) => {
  const order = await Order.findByPk(id);
  if (!order) throw new Error('订单不存在');
  if (order.order_status === 'cancelled' || order.order_status === 'refunded') return order;
  await order.update({ order_status: 'cancelled' });

  // 回补库存
  try {
    await replenishOnRefund(order.train_id, order.travel_date, order.seat_type, order.ticket_count);
  } catch {
    // 忽略库存回补失败
  }

  // 生成负向售票记录（抵消原销量）
  try {
    const originalSale = await TicketSale.findOne({ where: { order_id: order.id } });
    const dest = originalSale?.destination || '';
    const negativeAmount = (-1 * parseFloat(order.total_amount as unknown as string)).toFixed(2);
    await TicketSale.create({
      sale_date: order.travel_date,
      train_id: order.train_id,
      train_number: order.train_number,
      destination: dest,
      seat_type: order.seat_type,
      ticket_count: -order.ticket_count,
      actual_amount: negativeAmount,
      order_id: order.id,
    } as any);
  } catch {
    // 忽略失败，不阻断取消流程
  }
  return order;
};

export interface RefundOrderParams {
  service_fee_rate: number; // 百分比
  refund_reason?: string;
  destination?: string;
  route?: string;
  vehicle_type?: string;
}

export const refundOrder = async (id: number, params: RefundOrderParams) => {
  const order = await Order.findByPk(id);
  if (!order) throw new Error('订单不存在');
  if (order.order_status === 'refunded') return order;

  const rate = Math.max(0, params.service_fee_rate || 0);
  const total = parseFloat(order.total_amount as unknown as string);
  const service_fee = (total * rate) / 100;
  const refund_amount = total - service_fee;

  await Refund.create({
    order_id: order.id,
    train_id: order.train_id,
    departure_time: new Date(order.travel_date + 'T00:00:00Z'),
    train_number: order.train_number,
    seat_type: order.seat_type,
    destination: params.destination || '',
    route: params.route || null,
    vehicle_type: params.vehicle_type || null,
    ticket_price: order.ticket_price,
    ticket_count: order.ticket_count,
    service_fee_rate: rate.toFixed(2),
    service_fee: service_fee.toFixed(2),
    refund_amount: refund_amount.toFixed(2),
    refund_reason: params.refund_reason || null,
  } as any);

  await order.update({ order_status: 'refunded' });

  // 库存回补（仅当座位类型在约定范围内）
  try {
    await replenishOnRefund(order.train_id, order.travel_date, order.seat_type, order.ticket_count);
  } catch {
    // 忽略库存回补失败，不影响退款主流程；可补日志
  }

  // 生成负向售票记录用于统计抵消（按退款额回冲：总额-手续费）
  try {
    const originalSale = await TicketSale.findOne({ where: { order_id: order.id } });
    const dest = params.destination || originalSale?.destination || '';
    const negativeAmount = (-1 * refund_amount).toFixed(2);
    await TicketSale.create({
      sale_date: order.travel_date,
      train_id: order.train_id,
      train_number: order.train_number,
      destination: dest,
      seat_type: order.seat_type,
      ticket_count: -order.ticket_count,
      actual_amount: negativeAmount,
      order_id: order.id,
    } as any);
  } catch {
    // 保底不阻断退款流程
  }

  return order;
};


