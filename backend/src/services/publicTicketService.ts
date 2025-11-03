import { Op } from 'sequelize';
import Train from '../models/Train';
import TicketInventory from '../models/TicketInventory';
import Order from '../models/Order';
import TrainStop from '../models/TrainStop';

export interface TicketSearchParams {
  date: string; // YYYY-MM-DD
  departure?: string;
  arrival?: string;
  train_number?: string;
  seat_type?: 'business' | 'first' | 'second';
}

export const searchTickets = async (params: TicketSearchParams) => {
  const { date, departure, arrival, train_number, seat_type } = params;

  // 如果提供了出发站与到达站，按“同一车次内站点顺序”检索
  if (departure && arrival) {
    // 候选站点
    const fromStops = await TrainStop.findAll({ where: { station_name: { [Op.like]: `%${departure}%` } } });
    const toStops = await TrainStop.findAll({ where: { station_name: { [Op.like]: `%${arrival}%` } } });

    // 构建映射：每个 train_id 的最早 from_order 与合适的 to_order
    const trainIdToFromOrders = new Map<number, TrainStop[]>();
    for (const s of fromStops) {
      const arr = trainIdToFromOrders.get(s.train_id) || [];
      arr.push(s);
      trainIdToFromOrders.set(s.train_id, arr);
    }
    const trainIdToToOrders = new Map<number, TrainStop[]>();
    for (const s of toStops) {
      const arr = trainIdToToOrders.get(s.train_id) || [];
      arr.push(s);
      trainIdToToOrders.set(s.train_id, arr);
    }

    const candidateTrainIds: number[] = [];
    for (const [trainId, fromArr] of trainIdToFromOrders.entries()) {
      const toArr = trainIdToToOrders.get(trainId);
      if (!toArr || toArr.length === 0) continue;
      // 选择一个 from 与最近的更大序号的 to
      const sortedFrom = [...fromArr].sort((a, b) => a.stop_order - b.stop_order);
      const sortedTo = [...toArr].sort((a, b) => a.stop_order - b.stop_order);
      let ok = false;
      for (const f of sortedFrom) {
        const t = sortedTo.find(x => x.stop_order > f.stop_order);
        if (t) { ok = true; break; }
      }
      if (ok) candidateTrainIds.push(trainId);
    }

    if (candidateTrainIds.length === 0) return [];

    const trainWhere: any = { id: { [Op.in]: candidateTrainIds }, status: 1 };
    if (train_number) trainWhere.train_number = { [Op.like]: `%${train_number}%` };
    const trains = await Train.findAll({ where: trainWhere, order: [['departure_time', 'ASC']] });

    const result: any[] = [];
    for (const t of trains) {
      const fromArr = (trainIdToFromOrders.get(t.id) || []).sort((a, b) => a.stop_order - b.stop_order);
      const toArr = (trainIdToToOrders.get(t.id) || []).sort((a, b) => a.stop_order - b.stop_order);
      // 选定配对区段（最靠前的一对）
      let segmentFrom: TrainStop | undefined;
      let segmentTo: TrainStop | undefined;
      for (const f of fromArr) {
        const tt = toArr.find(x => x.stop_order > f.stop_order);
        if (tt) { segmentFrom = f; segmentTo = tt; break; }
      }
      if (!segmentFrom || !segmentTo) continue;

      // 计算起价与是否有票（跨座位聚合）
      const seatTypes: Array<'business' | 'first' | 'second'> = ['business', 'first', 'second'];
      let priceFrom = Number.MAX_SAFE_INTEGER;
      let hasTicket = false;
      for (const st of seatTypes) {
        let total = 0;
        let price = 0;
        if (st === 'business') { total = t.total_seats_business; price = Number(t.price_business); }
        if (st === 'first')    { total = t.total_seats_first;    price = Number(t.price_first); }
        if (st === 'second')   { total = t.total_seats_second;   price = Number(t.price_second); }
        if (total > 0 && price > 0) priceFrom = Math.min(priceFrom, price);

        // 可售数
        let available = 0;
        const inv = await TicketInventory.findOne({ where: { train_id: t.id, travel_date: date, seat_type: st } });
        if (inv) {
          available = Math.max(0, inv.total_seats - inv.sold_seats - inv.locked_seats);
        } else {
          const paid = await Order.sum('ticket_count', { where: { train_id: t.id, travel_date: date, seat_type: st, order_status: { [Op.in]: ['paid', 'completed'] } } }) as number | null;
          available = Math.max(0, total - (paid || 0));
        }
        if (available > 0) hasTicket = true;
      }
      if (priceFrom === Number.MAX_SAFE_INTEGER) priceFrom = 0;

      result.push({
        train_id: t.id,
        train_number: t.train_number,
        departure_station: segmentFrom.station_name,
        arrival_station: segmentTo.station_name,
        departure_time: segmentFrom.departure_time,
        arrival_time: segmentTo.arrival_time,
        vehicle_type: t.vehicle_type,
        price_from: priceFrom.toFixed(2),
        has_ticket: hasTicket,
      });
    }

    return result;
  }

  // 兜底：旧逻辑（不提供双站点时）
  const where: any = { status: 1 };
  if (departure) where.departure_station = { [Op.like]: `%${departure}%` };
  if (arrival) where.arrival_station = { [Op.like]: `%${arrival}%` };
  if (train_number) where.train_number = { [Op.like]: `%${train_number}%` };
  const trains = await Train.findAll({ where, order: [['departure_time', 'ASC']] });

  const result: any[] = [];
  for (const t of trains) {
    // 聚合版本（未提供双站点时）
    const seatTypes: Array<'business' | 'first' | 'second'> = ['business', 'first', 'second'];
    let priceFrom = Number.MAX_SAFE_INTEGER;
    let hasTicket = false;
    for (const st of seatTypes) {
      let total = 0;
      let price = 0;
      if (st === 'business') { total = t.total_seats_business; price = Number(t.price_business); }
      if (st === 'first')    { total = t.total_seats_first;    price = Number(t.price_first); }
      if (st === 'second')   { total = t.total_seats_second;   price = Number(t.price_second); }
      if (total > 0 && price > 0) priceFrom = Math.min(priceFrom, price);

      let available = 0;
      const inv = await TicketInventory.findOne({ where: { train_id: t.id, travel_date: date, seat_type: st } });
      if (inv) {
        available = Math.max(0, inv.total_seats - inv.sold_seats - inv.locked_seats);
      } else {
        const paid = await Order.sum('ticket_count', { where: { train_id: t.id, travel_date: date, seat_type: st, order_status: { [Op.in]: ['paid', 'completed'] } } }) as number | null;
        available = Math.max(0, total - (paid || 0));
      }
      if (available > 0) hasTicket = true;
    }
    if (priceFrom === Number.MAX_SAFE_INTEGER) priceFrom = 0;

    result.push({
      train_id: t.id,
      train_number: t.train_number,
      departure_station: t.departure_station,
      arrival_station: t.arrival_station,
      departure_time: t.departure_time,
      arrival_time: t.arrival_time,
      vehicle_type: t.vehicle_type,
      price_from: priceFrom.toFixed(2),
      has_ticket: hasTicket,
    });
  }
  return result;
};

export const getTicketDetail = async (params: { train_id: number; date: string; from: string; to: string }) => {
  const { train_id, date, from, to } = params;
  const train = await Train.findByPk(train_id);
  if (!train || train.status !== 1) throw new Error('车次不存在或不可售');

  const fromStops = await TrainStop.findAll({ where: { train_id, station_name: { [Op.like]: `%${from}%` } }, order: [['stop_order', 'ASC']] });
  const toStops = await TrainStop.findAll({ where: { train_id, station_name: { [Op.like]: `%${to}%` } }, order: [['stop_order', 'ASC']] });
  if (!fromStops.length || !toStops.length) throw new Error('未找到对应区段');
  const pair = (() => {
    for (const f of fromStops) {
      const t = toStops.find(x => x.stop_order > f.stop_order);
      if (t) return { f, t };
    }
    return undefined;
  })();
  if (!pair) throw new Error('区段不合法');

  const seats: Array<{ seat_type: 'business'|'first'|'second'; price: string; available: number }> = [];
  const seatTypes: Array<'business'|'first'|'second'> = ['business','first','second'];
  for (const st of seatTypes) {
    let total = 0; let price = 0;
    if (st === 'business') { total = train.total_seats_business; price = Number(train.price_business); }
    if (st === 'first')    { total = train.total_seats_first;    price = Number(train.price_first); }
    if (st === 'second')   { total = train.total_seats_second;   price = Number(train.price_second); }
    if (total <= 0 || price <= 0) { seats.push({ seat_type: st, price: '0.00', available: 0 }); continue; }

    let available = 0;
    const inv = await TicketInventory.findOne({ where: { train_id, travel_date: date, seat_type: st } });
    if (inv) {
      available = Math.max(0, inv.total_seats - inv.sold_seats - inv.locked_seats);
    } else {
      const paid = await Order.sum('ticket_count', { where: { train_id, travel_date: date, seat_type: st, order_status: { [Op.in]: ['paid', 'completed'] } } }) as number | null;
      available = Math.max(0, total - (paid || 0));
    }
    seats.push({ seat_type: st, price: price.toFixed(2), available });
  }

  return {
    train_id: train.id,
    train_number: train.train_number,
    departure_station: pair.f.station_name,
    arrival_station: pair.t.station_name,
    departure_time: pair.f.departure_time,
    arrival_time: pair.t.arrival_time,
    seats,
  };
};


