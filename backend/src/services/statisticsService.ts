import { Op, fn, col, literal } from 'sequelize';
import TicketSale from '../models/TicketSale';
import Refund from '../models/Refund';
import Order from '../models/Order';
import User from '../models/User';

export interface DateRange { startDate?: string; endDate?: string; }

export const salesTrend = async ({ startDate, endDate }: DateRange) => {
  const where: any = {};
  if (startDate && endDate) where.sale_date = { [Op.between]: [startDate, endDate] };
  const rows = await TicketSale.findAll({
    where,
    attributes: [
      [col('sale_date'), 'date'],
      [fn('SUM', col('ticket_count')), 'salesCount'],
      [fn('SUM', col('actual_amount')), 'salesAmount'],
    ],
    group: ['sale_date'],
    order: [['sale_date', 'ASC']],
  });
  return rows;
};

export const refundTrend = async ({ startDate, endDate }: DateRange) => {
  const where: any = {};
  if (startDate && endDate) where.created_at = { [Op.between]: [startDate, endDate] };
  const rows = await Refund.findAll({
    where,
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('COUNT', col('id')), 'refundCount'],
      [fn('SUM', col('refund_amount')), 'refundAmount'],
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
  });
  return rows;
};

export const topTrains = async ({ startDate, endDate }: DateRange, limit = 10) => {
  const where: any = {};
  if (startDate && endDate) where.sale_date = { [Op.between]: [startDate, endDate] };
  const rows = await TicketSale.findAll({
    where,
    attributes: [
      [col('train_number'), 'train_number'],
      [fn('SUM', col('ticket_count')), 'count'],
      [fn('SUM', col('actual_amount')), 'amount'],
    ],
    group: ['train_number'],
    order: [literal('count DESC')],
    limit,
  });
  return rows;
};

export const destinationShare = async ({ startDate, endDate }: DateRange, limit = 10) => {
  const where: any = {};
  if (startDate && endDate) where.sale_date = { [Op.between]: [startDate, endDate] };
  const rows = await TicketSale.findAll({
    where,
    attributes: [
      [col('destination'), 'destination'],
      [fn('SUM', col('ticket_count')), 'count'],
    ],
    group: ['destination'],
    order: [literal('count DESC')],
    limit,
  });
  return rows;
};

export const summaryCounts = async ({ startDate, endDate }: DateRange) => {
  const saleWhere: any = {};
  if (startDate && endDate) saleWhere.sale_date = { [Op.between]: [startDate, endDate] };
  const refundWhere: any = {};
  if (startDate && endDate) refundWhere.created_at = { [Op.between]: [startDate, endDate] };

  const [users, orders, refunds, salesAmountRow] = await Promise.all([
    User.count(),
    Order.count(),
    Refund.count({ where: refundWhere }),
    TicketSale.findAll({ where: saleWhere, attributes: [[fn('SUM', col('actual_amount')), 'amount']] }),
  ]);

  const salesAmount = (() => {
    const r = salesAmountRow?.[0] as any;
    if (!r) return 0;
    const v = r.get?.('amount') ?? r.amount;
    return Number(v || 0);
  })();

  return { users, orders, refunds, salesAmount };
};


