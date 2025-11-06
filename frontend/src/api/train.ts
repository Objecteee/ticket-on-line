import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';

export interface Train {
  id: number;
  train_number: string;
  departure_station: string;
  arrival_station: string;
  intermediate_stations?: string | null;
  departure_time: string;
  arrival_time: string;
  vehicle_type?: string | null;
  total_seats_business: number;
  total_seats_first: number;
  total_seats_second: number;
  price_business: string;
  price_first: string;
  price_second: string;
  status: number;
}

export interface TrainQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 0 | 1;
  vehicle_type?: string;
}

export const fetchTrains = (params: TrainQuery) =>
  request.get<PaginationResponse<Train>>('/admin/trains', { params });

export const createTrain = (data: Partial<Train>) =>
  request.post<Train>('/admin/trains', data);

export const updateTrain = (trainId: number, data: Partial<Train>) =>
  request.put<Train>(`/admin/trains/${trainId}`, data);

export const deleteTrain = (trainId: number) =>
  request.delete(`/admin/trains/${trainId}`);


