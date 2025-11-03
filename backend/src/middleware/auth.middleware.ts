/**
 * 认证中间件
 */
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { extractToken, verifyToken } from '../utils/jwt';
import { ApiResponse } from '../types';

/**
 * JWT认证中间件
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    const token = extractToken(authHeader);

    if (!token) {
      const response: ApiResponse = {
        code: 401,
        message: '未提供认证令牌，请先登录',
      };
      res.status(401).json(response);
      return;
    }

    // 验证Token
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    const response: ApiResponse = {
      code: 401,
      message: error.message || '认证令牌无效或已过期',
    };
    res.status(401).json(response);
  }
};

