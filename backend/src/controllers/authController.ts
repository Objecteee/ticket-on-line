/**
 * 认证控制器
 */
import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { ApiResponse } from '../types';

/**
 * 用户注册
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, email, phone } = req.body;

    const userInfo = await registerUser(username, password, email, phone);

    const response: ApiResponse = {
      code: 200,
      message: '注册成功',
      data: {
        userId: userInfo.id,
        username: userInfo.username,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;

    const { token, user } = await loginUser(username, password);

    const response: ApiResponse = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * 用户登出（可选功能，主要用于服务端session管理）
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 如果使用服务端session，这里可以清除session
    // 对于JWT，客户端删除token即可，服务端无需操作
    
    const response: ApiResponse = {
      code: 200,
      message: '登出成功',
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

