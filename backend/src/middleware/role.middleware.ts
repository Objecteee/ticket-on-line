/**
 * 权限中间件
 */
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiResponse } from '../types';

/**
 * 要求管理员权限
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    const response: ApiResponse = {
      code: 401,
      message: '未认证',
    };
    res.status(401).json(response);
    return;
  }

  if (req.user.role !== 'admin') {
    const response: ApiResponse = {
      code: 403,
      message: '需要管理员权限',
    };
    res.status(403).json(response);
    return;
  }

  next();
};

