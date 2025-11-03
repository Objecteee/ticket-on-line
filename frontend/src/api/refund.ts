import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';

export interface Refund {
  id: number;
  order_id: number;
  train_id: number;
  departure_time: string;
  train_number: string;
  seat_type: string;
  destination: string;
  route?: string;
  vehicle_type?: string;
  ticket_price: string;
  ticket_count: number;
  service_fee_rate: string;
  service_fee: string;
  refund_amount: string;
  refund_reason?: string;
}

export interface RefundQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  train_number?: string;
  destination?: string;
}

export const fetchRefunds = (params: RefundQuery) =>
  request.get<PaginationResponse<Refund>>('/admin/refunds', { params });

export const fetchRefundDetail = (refundId: number) =>
  request.get<Refund>(`/admin/refunds/${refundId}`);


