import request from '@/utils/request';

export interface TrainStopDTO {
  station_name: string;
  stop_order: number;
  arrival_time: string; // HH:mm:ss
  departure_time: string; // HH:mm:ss
}

export const getTrainStops = (trainId: number) => {
  return request.get(`/admin/trains/${trainId}/stops`);
};

export const saveTrainStops = (trainId: number, stops: TrainStopDTO[]) => {
  return request.put(`/admin/trains/${trainId}/stops`, { stops });
};


