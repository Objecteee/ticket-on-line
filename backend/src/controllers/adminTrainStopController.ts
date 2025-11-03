import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { listStops, saveStops } from '../services/trainStopService';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainId } = req.params as any;
    const data = await listStops(Number(trainId));
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const save = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainId } = req.params as any;
    const stops = req.body?.stops || [];
    await saveStops(Number(trainId), stops);
    const response: ApiResponse = { code: 200, message: '保存成功' };
    res.json(response);
  } catch (e) { next(e); }
};


