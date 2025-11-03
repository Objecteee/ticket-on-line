import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { salesTrend, refundTrend, topTrains, destinationShare, summaryCounts } from '../services/statisticsService';

export const trend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as any;
    const sales = await salesTrend({ startDate, endDate });
    const refunds = await refundTrend({ startDate, endDate });
    const response: ApiResponse = { code: 200, message: 'ok', data: { sales, refunds } };
    res.json(response);
  } catch (e) { next(e); }
};

export const top = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, limit } = req.query as any;
    const trains = await topTrains({ startDate, endDate }, limit ? Number(limit) : 10);
    const dests = await destinationShare({ startDate, endDate }, limit ? Number(limit) : 10);
    const response: ApiResponse = { code: 200, message: 'ok', data: { trains, destinations: dests } };
    res.json(response);
  } catch (e) { next(e); }
};

export const summary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as any;
    const data = await summaryCounts({ startDate, endDate });
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};


