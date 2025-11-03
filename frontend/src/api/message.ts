import request from '@/utils/request';
import { PaginationResponse } from '@/types/api';

export type MessageStatus = 'pending' | 'approved' | 'rejected';

export interface Message {
  id: number;
  user_id: number;
  username: string;
  content: string;
  status: MessageStatus;
  reply?: string | null;
  reply_time?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageQuery {
  page?: number;
  pageSize?: number;
  status?: MessageStatus;
}

// 用户接口
export const fetchMessages = (params?: { page?: number; pageSize?: number }) =>
  request.get<PaginationResponse<Message>>('/user/messages', { params });

export const createMessage = (content: string) =>
  request.post('/user/messages', { content });

// 管理员接口
export const fetchAdminMessages = (params?: MessageQuery) =>
  request.get<PaginationResponse<Message>>('/admin/messages', { params });

export const approveMessage = (id: number) =>
  request.post(`/admin/messages/${id}/approve`);

export const rejectMessage = (id: number) =>
  request.post(`/admin/messages/${id}/reject`);

export const replyMessage = (id: number, reply: string) =>
  request.post(`/admin/messages/${id}/reply`, { reply });

export const deleteMessage = (id: number) =>
  request.delete(`/admin/messages/${id}`);

