import { Op } from 'sequelize';
import Train from '../models/Train';

export interface TrainListParams {
  page?: number;
  pageSize?: number;
  keyword?: string; // 车次号/站名
  status?: number; // 0/1
  vehicle_type?: string;
}

export const listTrains = async (params: TrainListParams) => {
  const { page = 1, pageSize = 10, keyword, status, vehicle_type } = params;
  const where: any = {};
  if (keyword) {
    where[Op.or] = [
      { train_number: { [Op.like]: `%${keyword}%` } },
      { departure_station: { [Op.like]: `%${keyword}%` } },
      { arrival_station: { [Op.like]: `%${keyword}%` } },
    ];
  }
  if (status === 0 || status === 1) where.status = status;
  if (vehicle_type) where.vehicle_type = vehicle_type;

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Train.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset,
  });
  return { list: rows, total: count, page, pageSize };
};

export interface CreateTrainParams {
  train_number: string;
  departure_station: string;
  arrival_station: string;
  intermediate_stations?: string; // JSON
  departure_time: string; // HH:mm:ss
  arrival_time: string;
  vehicle_type?: string;
  total_seats_business?: number;
  total_seats_first?: number;
  total_seats_second?: number;
  price_business?: string;
  price_first?: string;
  price_second?: string;
  status?: number;
}

export const createTrain = async (data: CreateTrainParams) => {
  const existed = await Train.findOne({ where: { train_number: data.train_number } });
  if (existed) throw new Error('车次号已存在');
  const train = await Train.create(data as any);
  return train;
};

export interface UpdateTrainParams extends Partial<CreateTrainParams> {}

export const updateTrain = async (id: number, data: UpdateTrainParams) => {
  const train = await Train.findByPk(id);
  if (!train) throw new Error('车次不存在');
  if (data.train_number && data.train_number !== train.train_number) {
    const existedNumber = await Train.findOne({ where: { train_number: data.train_number } });
    if (existedNumber) throw new Error('车次号已存在');
  }
  await train.update(data as any);
  return train;
};

export const deleteTrain = async (id: number) => {
  const train = await Train.findByPk(id);
  if (!train) throw new Error('车次不存在');
  await train.destroy();
  return true;
};

export const getTrainById = async (id: number) => {
  const train = await Train.findByPk(id);
  if (!train) throw new Error('车次不存在');
  return train;
};


