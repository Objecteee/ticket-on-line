/**
 * 管理员 - 用户管理控制器
 */
import { Request, Response, NextFunction } from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  setUserStatus,
  setUserRole,
  resetUserPassword,
  getUserById,
} from '../services/userService';
import { ApiResponse } from '../types';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, keyword, role, status, sortBy, order } = req.query as any;
    const data = await listUsers({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      keyword,
      role,
      status: typeof status !== 'undefined' ? Number(status) : undefined,
      sortBy,
      order,
    });
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as any;
    const data = await getUserById(Number(userId));
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, email, phone, role, status } = req.body;
    const data = await createUser({ username, password, email, phone, role, status });
    const response: ApiResponse = { code: 200, message: '创建成功', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as any;
    const { email, phone, status, role } = req.body;
    const data = await updateUser(Number(userId), { email, phone, status, role });
    const response: ApiResponse = { code: 200, message: '更新成功', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as any;
    const { status } = req.body as any;
    const data = await setUserStatus(Number(userId), Number(status));
    const response: ApiResponse = { code: 200, message: '状态已更新', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as any;
    const { role } = req.body as any;
    const data = await setUserRole(Number(userId), role);
    const response: ApiResponse = { code: 200, message: '角色已更新', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as any;
    const { password } = req.body as any;
    await resetUserPassword(Number(userId), password);
    const response: ApiResponse = { code: 200, message: '密码已重置' };
    res.json(response);
  } catch (e) {
    next(e);
  }
};


