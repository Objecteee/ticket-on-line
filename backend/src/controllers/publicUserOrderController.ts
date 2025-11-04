import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { listOrders, getOrderById, cancelOrder, refundOrder, payOrder } from '../services/orderService';

export const listMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { page, pageSize, order_status } = req.query as any;
    const data = await listOrders({ page: Number(page) || 1, pageSize: Number(pageSize) || 10, user_id: req.user.userId, order_status });
    res.json({ code: 200, message: 'ok', data } as ApiResponse);
  } catch (e) { next(e); }
};

export const getMyOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const orderId = Number(req.params.orderId);
    const order = await getOrderById(orderId);
    if (order.user_id !== req.user.userId) return res.status(403).json({ code: 403, message: '无权查看该订单' } as ApiResponse);
    res.json({ code: 200, message: 'ok', data: order } as ApiResponse);
  } catch (e) { next(e); }
};

export const cancelMyOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const orderId = Number(req.params.orderId);
    const order = await getOrderById(orderId);
    if (order.user_id !== req.user.userId) return res.status(403).json({ code: 403, message: '无权操作该订单' } as ApiResponse);
    const updated = await cancelOrder(orderId);
    res.json({ code: 200, message: '已取消', data: updated } as ApiResponse);
  } catch (e) { next(e); }
};

export const payMyOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const orderId = Number(req.params.orderId);
    const order = await getOrderById(orderId);
    if (order.user_id !== req.user.userId) return res.status(403).json({ code: 403, message: '无权操作该订单' } as ApiResponse);
    const updated = await payOrder(orderId);
    res.json({ code: 200, message: '支付成功', data: updated } as ApiResponse);
  } catch (e) { next(e); }
};

export const refundMyOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const orderId = Number(req.params.orderId);
    const order = await getOrderById(orderId);
    if (order.user_id !== req.user.userId) return res.status(403).json({ code: 403, message: '无权操作该订单' } as ApiResponse);
    const { service_fee_rate = 5, refund_reason } = req.body || {};
    const updated = await refundOrder(orderId, { service_fee_rate: Number(service_fee_rate), refund_reason } as any);
    res.json({ code: 200, message: '已退款', data: updated } as ApiResponse);
  } catch (e) { next(e); }
};


