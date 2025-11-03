import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import Train from '../models/Train';
import Order from '../models/Order';
import { reserveOnOrder } from './inventoryService';
import TicketSale from '../models/TicketSale';

interface CreateOrderParams {
  user_id: number;
  train_id: number;
  date: string; // YYYY-MM-DD
  from: string;
  to: string;
  seat_type: 'business' | 'first' | 'second';
  count?: number;
  passengers?: Array<{ name: string; id_card: string }>;
  passenger_name?: string;
  passenger_id_card?: string;
}

const genOrderNo = () => 'OD' + Date.now().toString(36).toUpperCase();

export const createUserOrder = async (params: CreateOrderParams) => {
  const { user_id, train_id, date, seat_type, passengers, passenger_name, passenger_id_card } = params;
  if (!user_id) throw new Error('未登录');
  if (!train_id || !date || !seat_type) throw new Error('参数不完整');

  const inferred = Array.isArray(passengers) ? passengers.length : 0;
  const count = (params.count != null ? params.count : inferred) || 1;
  if (count <= 0 || count > 9) throw new Error('购票数量范围为 1-9');

  const train = await Train.findByPk(train_id);
  if (!train || train.status !== 1) throw new Error('车次不可售');

  let price = 0;
  if (seat_type === 'business') price = Number(train.price_business);
  if (seat_type === 'first') price = Number(train.price_first);
  if (seat_type === 'second') price = Number(train.price_second);
  if (price <= 0) throw new Error('该座位类型不可售');

  return sequelize.transaction(async (t: Transaction) => {
    // 扣减库存（先检查再增 sold）
    await reserveOnOrder(train_id, date, seat_type, count);

    const firstPassengerName = passengers && passengers.length ? passengers[0].name : (passenger_name || null);
    const firstPassengerId = passengers && passengers.length ? passengers[0].id_card : (passenger_id_card || null);

    const order = await Order.create({
      order_number: genOrderNo(),
      user_id,
      train_id,
      train_number: train.train_number,
      travel_date: date,
      seat_type,
      ticket_count: count,
      passenger_name: firstPassengerName,
      passenger_id_card: firstPassengerId,
      ticket_price: price.toFixed(2),
      total_amount: (price * count).toFixed(2),
      order_status: 'paid',
      payment_time: new Date(),
    }, { transaction: t });

    // 写入售票记录（联动统计）
    await TicketSale.create({
      sale_date: date,
      train_id,
      train_number: train.train_number,
      destination: params.to,
      seat_type,
      ticket_count: count,
      actual_amount: (price * count).toFixed(2),
      order_id: order.id,
    } as any, { transaction: t });

    return order;
  });
};


