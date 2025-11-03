/**
 * 用户角色类型
 */
export type UserRole = 'user' | 'admin';

/**
 * 用户信息
 */
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string;
  user: User;
}

