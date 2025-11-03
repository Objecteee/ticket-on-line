/**
 * 认证相关API接口
 */
import request from '@/utils/request';
import { ApiResponse } from '@/types/api';
import { LoginParams, RegisterParams, LoginResponse } from '@/types/user';

/**
 * 用户注册
 */
export const register = (data: RegisterParams): Promise<ApiResponse<{ userId: number; username: string }>> => {
  return request.post('/auth/register', data);
};

/**
 * 用户登录
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request.post('/auth/login', data);
};

/**
 * 用户登出（可选，主要用于清理服务端session）
 */
export const logout = (): Promise<ApiResponse> => {
  return request.post('/auth/logout');
};

