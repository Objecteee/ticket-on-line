import request from '@/utils/request';

export interface TicketSearchParams {
  date: string;
  departure?: string;
  arrival?: string;
  train_number?: string;
}

export interface TicketItem {
  train_id: number;
  train_number: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  vehicle_type?: string;
  price_from: string; // 起价
  has_ticket: boolean; // 是否有票（任一座位可售）
}

export const searchTickets = (params: TicketSearchParams) =>
  request.get<TicketItem[]>('/tickets/search', { params });


