import request from '@/utils/request';
import { ApiResponse, PaginationResponse } from '@/types/api';
import { User } from '@/types/user';

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: 'user' | 'admin';
  status?: 0 | 1;
  sortBy?: 'created_at' | 'username' | 'status' | 'role';
  order?: 'asc' | 'desc';
}

export const fetchUsers = (params: UserListQuery) =>
  request.get<PaginationResponse<User>>('/admin/users', { params });

export const fetchUserDetail = (userId: number) =>
  request.get<User>(`/admin/users/${userId}`);

export const createUser = (data: {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
  status?: 0 | 1;
}) => request.post<User>('/admin/users', data);

export const updateUser = (userId: number, data: Partial<Pick<User, 'email' | 'phone' | 'status' | 'role'>>) =>
  request.put<User>(`/admin/users/${userId}`, data);

export const updateUserStatus = (userId: number, status: 0 | 1) =>
  request.patch<User>(`/admin/users/${userId}/status`, { status });

export const updateUserRole = (userId: number, role: 'user' | 'admin') =>
  request.patch<User>(`/admin/users/${userId}/role`, { role });

export const resetUserPassword = (userId: number, password: string) =>
  request.post(`/admin/users/${userId}/reset-password`, { password });

export const deleteUser = (userId: number) =>
  request.delete(`/admin/users/${userId}`);


