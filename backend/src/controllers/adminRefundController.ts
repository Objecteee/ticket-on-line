import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import Refund from '../models/Refund';
import { Op } from 'sequelize';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, startDate, endDate, train_number, destination } = req.query as any;
    const where: any = {};
    if (startDate && endDate) where.created_at = { [Op.between]: [startDate, endDate] };
    if (train_number) where.train_number = { [Op.like]: `%${train_number}%` };
    if (destination) where.destination = { [Op.like]: `%${destination}%` };
    const offset = (Number(page) - 1) * Number(pageSize);
    const { rows, count } = await Refund.findAndCountAll({ where, order: [['created_at', 'DESC']], limit: Number(pageSize), offset });
    const response: ApiResponse = { code: 200, message: 'ok', data: { list: rows, total: count, page: Number(page), pageSize: Number(pageSize) } };
    res.json(response);
  } catch (e) { next(e); }
};

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refundId } = req.params as any;
    const data = await Refund.findByPk(Number(refundId));
    if (!data) throw new Error('退票记录不存在');
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};


