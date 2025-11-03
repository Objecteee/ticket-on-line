import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';
import type { Order, OrderStatus } from './order';

export interface UserOrderQuery {
  page?: number;
  pageSize?: number;
  order_status?: OrderStatus;
}

export const fetchMyOrders = (params: UserOrderQuery) =>
  request.get<PaginationResponse<Order>>('/user/orders', { params });

export const fetchMyOrderDetail = (orderId: number) =>
  request.get<Order>(`/user/orders/${orderId}`);

export const cancelMyOrder = (orderId: number) =>
  request.post(`/user/orders/${orderId}/cancel`);

export const refundMyOrder = (orderId: number, data: { service_fee_rate?: number; refund_reason?: string }) =>
  request.post(`/user/orders/${orderId}/refund`, data);


