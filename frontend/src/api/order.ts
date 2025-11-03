import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  train_id: number;
  train_number: string;
  travel_date: string;
  seat_type: string;
  ticket_count: number;
  passenger_name?: string;
  passenger_id_card?: string;
  ticket_price: string;
  total_amount: string;
  order_status: OrderStatus;
  payment_time?: string;
}

export interface OrderQuery {
  page?: number;
  pageSize?: number;
  order_number?: string;
  user_id?: number;
  train_number?: string;
  order_status?: OrderStatus;
  travel_date_start?: string;
  travel_date_end?: string;
}

export const fetchOrders = (params: OrderQuery) =>
  request.get<PaginationResponse<Order>>('/admin/orders', { params });

export const fetchOrderDetail = (orderId: number) =>
  request.get<Order>(`/admin/orders/${orderId}`);

export const cancelOrder = (orderId: number) =>
  request.post(`/admin/orders/${orderId}/cancel`);

export const refundOrder = (orderId: number, data: { service_fee_rate: number; refund_reason?: string; destination?: string; route?: string; vehicle_type?: string; }) =>
  request.post(`/admin/orders/${orderId}/refund`, data);

// 用户下单（公开订单接口）
export const createOrder = (data: {
  train_id: number;
  date: string;
  from: string;
  to: string;
  seat_type: 'business' | 'first' | 'second';
  count?: number;
  passengers?: Array<{ name: string; id_card: string }>;
  passenger_name?: string;
  passenger_id_card?: string;
}) => request.post('/orders', data);


