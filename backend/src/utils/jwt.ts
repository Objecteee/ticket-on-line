/**
 * JWT工具函数
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JWTPayload } from '../types';

/**
 * 生成JWT Token
 */
export const generateToken = (payload: JWTPayload): string => {
  const secret = jwtConfig.secret;
  if (!secret) {
    throw new Error('JWT_SECRET未配置');
  }

  // 兼容 @types/jsonwebtoken 对 expiresIn 的严格类型（StringValue | number）
  const expiresInOption = jwtConfig.expiresIn as unknown as SignOptions['expiresIn'];

  const options: SignOptions = {
    expiresIn: expiresInOption,
  };

  return jwt.sign(payload, secret, options);
};

/**
 * 验证JWT Token
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = jwtConfig.secret;
  if (!secret) {
    throw new Error('JWT_SECRET未配置');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Token无效或已过期');
  }
};

/**
 * 从请求头提取Token
 */
export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  return null;
};