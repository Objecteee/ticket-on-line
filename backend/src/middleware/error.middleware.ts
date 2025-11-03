/**
 * 错误处理中间件
 */
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // 默认错误响应
  const response: ApiResponse = {
    code: 500,
    message: err.message || '服务器内部错误',
  };

  // 根据错误类型调整状态码
  if (err.message.includes('已存在') || err.message.includes('已被注册')) {
    response.code = 409; // Conflict
  } else if (err.message.includes('未找到') || err.message.includes('不存在')) {
    response.code = 404; // Not Found
  } else if (err.message.includes('密码') || err.message.includes('用户名')) {
    response.code = 400; // Bad Request
  }

  res.status(response.code).json(response);
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    code: 404,
    message: `路由 ${req.method} ${req.path} 不存在`,
  };
  res.status(404).json(response);
};

