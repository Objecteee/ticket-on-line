/**
 * 通用类型定义
 */

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 用户角色
 */
export type UserRole = 'user' | 'admin';

/**
 * 用户信息（不含密码）
 */
export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * JWT载荷
 */
export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
}

/**
 * 请求扩展（Express Request with user）
 */
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

