import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import TrainStop from '../models/TrainStop';

export const listStops = async (train_id: number) => {
  return TrainStop.findAll({ where: { train_id }, order: [['stop_order', 'ASC']] });
};

export const saveStops = async (train_id: number, stops: Array<{ station_name: string; stop_order: number; arrival_time: string; departure_time: string }>) => {
  return sequelize.transaction(async (t: Transaction) => {
    await TrainStop.destroy({ where: { train_id }, transaction: t });
    if (!stops || stops.length === 0) return true;
    // 规范顺序
    const rows = stops
      .filter(s => s.station_name && s.arrival_time && s.departure_time)
      .sort((a, b) => a.stop_order - b.stop_order)
      .map(s => ({ ...s, train_id }));
    if (rows.length) await TrainStop.bulkCreate(rows as any, { transaction: t });
    return true;
  });
};


