import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { listOrders, getOrderById, cancelOrder, refundOrder } from '../services/orderService';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listOrders(req.query as any);
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params as any;
    const data = await getOrderById(Number(orderId));
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params as any;
    const data = await cancelOrder(Number(orderId));
    const response: ApiResponse = { code: 200, message: '订单已取消', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const refund = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params as any;
    const data = await refundOrder(Number(orderId), req.body);
    const response: ApiResponse = { code: 200, message: '退款成功', data };
    res.json(response);
  } catch (e) { next(e); }
};


