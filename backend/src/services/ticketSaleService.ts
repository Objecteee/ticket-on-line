import { Op, fn, col, literal } from 'sequelize';
import TicketSale from '../models/TicketSale';
import Train from '../models/Train';

export interface TicketSaleListParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  train_number?: string;
  destination?: string;
}

export const listTicketSales = async (params: TicketSaleListParams) => {
  const { page = 1, pageSize = 10, startDate, endDate, train_number, destination } = params;
  const where: any = {};
  if (startDate && endDate) where.sale_date = { [Op.between]: [startDate, endDate] };
  if (train_number) where.train_number = { [Op.like]: `%${train_number}%` };
  if (destination) where.destination = { [Op.like]: `%${destination}%` };

  const offset = (page - 1) * pageSize;
  const { rows, count } = await TicketSale.findAndCountAll({
    where,
    order: [['sale_date', 'DESC']],
    limit: pageSize,
    offset,
  });
  return { list: rows, total: count, page, pageSize };
};

export interface CreateTicketSaleParams {
  sale_date: string;
  train_id: number;
  train_number: string;
  destination: string;
  seat_type: string;
  ticket_count: number;
  actual_amount: string;
  order_id?: number;
}

export const createTicketSale = async (data: CreateTicketSaleParams) => {
  // 强校验：车次匹配、目的地匹配、金额正确
  const train = await Train.findByPk(data.train_id);
  if (!train) throw new Error('车次不存在');
  if (train.train_number !== data.train_number) throw new Error('车次号与车次ID不匹配');
  if (data.destination && train.arrival_station && data.destination !== train.arrival_station) {
    throw new Error('到站名与车次终点站不一致');
  }
  const seat = (data.seat_type || '').toLowerCase();
  let unit = '0.00';
  if (seat === 'business') unit = String(train.price_business);
  else if (seat === 'first') unit = String(train.price_first);
  else if (seat === 'second') unit = String(train.price_second);
  else throw new Error('座位类型无效，应为 business|first|second');

  const expected = (parseFloat(unit) * data.ticket_count).toFixed(2);
  if (parseFloat(expected) !== parseFloat(data.actual_amount)) {
    throw new Error('实收金额与票价*数量不一致');
  }

  return TicketSale.create(data as any);
};

export const updateTicketSale = async (id: number, data: Partial<CreateTicketSaleParams>) => {
  const sale = await TicketSale.findByPk(id);
  if (!sale) throw new Error('售票记录不存在');
  // 若更新涉及关键字段，做相同校验
  const merged = { ...sale.get({ plain: true }), ...data } as CreateTicketSaleParams;
  const train = await Train.findByPk(merged.train_id);
  if (!train) throw new Error('车次不存在');
  if (train.train_number !== merged.train_number) throw new Error('车次号与车次ID不匹配');
  if (merged.destination && train.arrival_station && merged.destination !== train.arrival_station) {
    throw new Error('到站名与车次终点站不一致');
  }
  const seat = (merged.seat_type || '').toLowerCase();
  let unit = '0.00';
  if (seat === 'business') unit = String(train.price_business);
  else if (seat === 'first') unit = String(train.price_first);
  else if (seat === 'second') unit = String(train.price_second);
  else throw new Error('座位类型无效，应为 business|first|second');
  const expected = (parseFloat(unit) * merged.ticket_count).toFixed(2);
  if (parseFloat(expected) !== parseFloat(String(merged.actual_amount))) {
    throw new Error('实收金额与票价*数量不一致');
  }

  await sale.update(data as any);
  return sale;
};

export const deleteTicketSale = async (id: number) => {
  const sale = await TicketSale.findByPk(id);
  if (!sale) throw new Error('售票记录不存在');
  await sale.destroy();
  return true;
};

export type TicketSaleGroupBy = 'date' | 'train' | 'destination';

export const statsTicketSales = async (
  groupBy: TicketSaleGroupBy,
  startDate?: string,
  endDate?: string
) => {
  const where: any = {};
  if (startDate && endDate) where.sale_date = { [Op.between]: [startDate, endDate] };

  let attributes: any;
  if (groupBy === 'date') {
    attributes = [
      [col('sale_date'), 'key'],
      [fn('SUM', col('ticket_count')), 'count'],
      [fn('SUM', col('actual_amount')), 'amount'],
    ];
  } else if (groupBy === 'train') {
    attributes = [
      [col('train_number'), 'key'],
      [fn('SUM', col('ticket_count')), 'count'],
      [fn('SUM', col('actual_amount')), 'amount'],
    ];
  } else {
    attributes = [
      [col('destination'), 'key'],
      [fn('SUM', col('ticket_count')), 'count'],
      [fn('SUM', col('actual_amount')), 'amount'],
    ];
  }

  const group = groupBy === 'date' ? ['sale_date'] : groupBy === 'train' ? ['train_number'] : ['destination'];

  const rows = await TicketSale.findAll({ where, attributes, group, order: literal('count DESC') });
  return rows;
};

export const exportTicketSalesCsv = async (params: TicketSaleListParams) => {
  const { list } = await listTicketSales({ ...params, page: 1, pageSize: 100000 });
  const header = [
    'sale_date',
    'train_number',
    'destination',
    'seat_type',
    'ticket_count',
    'actual_amount',
  ];
  const lines = [header.join(',')];
  for (const s of list) {
    lines.push(
      [
        s.sale_date,
        s.train_number,
        s.destination,
        s.seat_type,
        s.ticket_count,
        s.actual_amount,
      ].join(',')
    );
  }
  return lines.join('\n');
};


