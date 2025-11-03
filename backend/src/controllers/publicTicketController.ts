import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { searchTickets } from '../services/publicTicketService';

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, departure, arrival, train_number, seat_type } = req.query as any;
    if (!date) {
      return res.status(400).json({ code: 400, message: '缺少 date 参数' } as ApiResponse);
    }
    const data = await searchTickets({ date, departure, arrival, train_number, seat_type });
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};


