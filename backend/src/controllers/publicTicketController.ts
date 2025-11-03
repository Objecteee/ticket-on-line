import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { searchTickets, getTicketDetail } from '../services/publicTicketService';

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

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { train_id, date, from, to } = req.query as any;
    if (!train_id || !date || !from || !to) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' } as ApiResponse);
    }
    const data = await getTicketDetail({ train_id: Number(train_id), date, from, to });
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};


