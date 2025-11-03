import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';

export interface TicketSale {
  id: number;
  sale_date: string;
  train_id: number;
  train_number: string;
  destination: string;
  seat_type: string;
  ticket_count: number;
  actual_amount: string;
  order_id?: number;
}

export interface TicketSaleQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  train_number?: string;
  destination?: string;
}

export const fetchTicketSales = (params: TicketSaleQuery) =>
  request.get<PaginationResponse<TicketSale>>('/admin/ticket-sales', { params });

export const createTicketSale = (data: Partial<TicketSale>) =>
  request.post('/admin/ticket-sales', data);

export const updateTicketSale = (id: number, data: Partial<TicketSale>) =>
  request.put(`/admin/ticket-sales/${id}`, data);

export const deleteTicketSale = (id: number) =>
  request.delete(`/admin/ticket-sales/${id}`);

export const exportTicketSalesCsv = (params: TicketSaleQuery) =>
  request.get<string>('/admin/ticket-sales/export/csv', { params, responseType: 'text' as any });


