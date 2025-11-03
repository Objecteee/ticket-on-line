import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { listPassengers, createPassenger, updatePassenger, deletePassenger, setDefaultPassenger, clearDefaultPassenger } from '../services/passengerService';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const data = await listPassengers(req.user.userId);
    res.json({ code: 200, message: 'ok', data } as ApiResponse);
  } catch (e) { next(e); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { name, id_card, phone } = req.body || {};
    const p = await createPassenger(req.user.userId, { name, id_card, phone });
    res.json({ code: 200, message: '已创建', data: p } as ApiResponse);
  } catch (e) { next(e); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const id = Number(req.params.passengerId);
    const { name, id_card, phone } = req.body || {};
    const p = await updatePassenger(req.user.userId, id, { name, id_card, phone });
    res.json({ code: 200, message: '已更新', data: p } as ApiResponse);
  } catch (e) { next(e); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const id = Number(req.params.passengerId);
    await deletePassenger(req.user.userId, id);
    res.json({ code: 200, message: '已删除' } as ApiResponse);
  } catch (e) { next(e); }
};

export const setDefault = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const id = Number(req.params.passengerId);
    await setDefaultPassenger(req.user.userId, id);
    res.json({ code: 200, message: '已设为默认' } as ApiResponse);
  } catch (e) { next(e); }
};

export const clearDefault = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    await clearDefaultPassenger(req.user.userId);
    res.json({ code: 200, message: '已取消默认' } as ApiResponse);
  } catch (e) { next(e); }
};


