import { Response, NextFunction } from 'express';
import { ApiResponse, AuthRequest } from '../types';
import { createUserOrder } from '../services/publicOrderService';

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { train_id, date, from, to, seat_type, count, passengers, passenger_name, passenger_id_card } = req.body || {};
    const data = await createUserOrder({
      user_id: req.user.userId,
      train_id: Number(train_id),
      date,
      from,
      to,
      seat_type,
      count: count ? Number(count) : undefined,
      passengers,
      passenger_name,
      passenger_id_card,
    });
    res.json({ code: 200, message: '下单成功', data } as ApiResponse);
  } catch (e) { next(e); }
};


