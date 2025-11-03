import request from '@/utils/request';

export const fetchTrend = (params: { startDate?: string; endDate?: string }) =>
  request.get<{ sales: any[]; refunds: any[] }>('/admin/statistics/trend', { params });

export const fetchTop = (params: { startDate?: string; endDate?: string; limit?: number }) =>
  request.get<{ trains: any[]; destinations: any[] }>('/admin/statistics/top', { params });

export const fetchSummary = (params: { startDate?: string; endDate?: string }) =>
  request.get<{ users: number; orders: number; refunds: number; salesAmount: number }>('/admin/statistics/summary', { params });


