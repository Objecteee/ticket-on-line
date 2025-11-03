import TicketInventory from '../models/TicketInventory';
import Train from '../models/Train';

export const replenishOnRefund = async (train_id: number, travel_date: string, seat_type: string, count: number) => {
  // upsert 记录并减少 sold_seats（回补库存）
  const inv = await TicketInventory.findOne({ where: { train_id, travel_date, seat_type } });
  if (!inv) {
    // total_seats 可依据 Train 的不同座位字段进行初始化
    const t = await Train.findByPk(train_id);
    let total = 0;
    if (t) {
      if (seat_type === 'business') total = t.total_seats_business;
      else if (seat_type === 'first') total = t.total_seats_first;
      else if (seat_type === 'second') total = t.total_seats_second;
    }
    await TicketInventory.create({ train_id, travel_date, seat_type, total_seats: total, sold_seats: Math.max(0, 0 - count) });
    return true;
  }
  const nextSold = Math.max(0, inv.sold_seats - count);
  await inv.update({ sold_seats: nextSold });
  return true;
};

export const reserveOnOrder = async (train_id: number, travel_date: string, seat_type: string, count: number) => {
  const t = await Train.findByPk(train_id);
  if (!t) throw new Error('车次不存在');
  let total = 0;
  if (seat_type === 'business') total = t.total_seats_business;
  else if (seat_type === 'first') total = t.total_seats_first;
  else if (seat_type === 'second') total = t.total_seats_second;
  const inv = await TicketInventory.findOne({ where: { train_id, travel_date, seat_type } });
  if (!inv) {
    if (count > total) throw new Error('余票不足');
    await TicketInventory.create({ train_id, travel_date, seat_type, total_seats: total, sold_seats: count, locked_seats: 0 });
    return true;
  }
  const available = Math.max(0, inv.total_seats - inv.sold_seats - inv.locked_seats);
  if (available < count) throw new Error('余票不足');
  await inv.update({ sold_seats: inv.sold_seats + count });
  return true;
};


