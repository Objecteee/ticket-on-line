import request from '@/utils/request';

export const requestResetCode = (identifier: string) =>
  request.post('/auth/forgot', { identifier });

export const resetPassword = (data: { identifier: string; code: string; new_password: string }) =>
  request.post('/auth/reset', data);

export interface Profile {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export const getProfile = () => request.get<Profile>('/user/profile');
export const updateProfile = (data: { username?: string; email?: string; phone?: string }) => request.put('/user/profile', data);


