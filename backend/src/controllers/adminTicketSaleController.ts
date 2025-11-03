import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import {
  listTicketSales,
  createTicketSale,
  updateTicketSale,
  deleteTicketSale,
  statsTicketSales,
  exportTicketSalesCsv,
} from '../services/ticketSaleService';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listTicketSales(req.query as any);
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createTicketSale(req.body);
    const response: ApiResponse = { code: 200, message: '创建成功', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params as any;
    const data = await updateTicketSale(Number(saleId), req.body);
    const response: ApiResponse = { code: 200, message: '更新成功', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saleId } = req.params as any;
    await deleteTicketSale(Number(saleId));
    const response: ApiResponse = { code: 200, message: '删除成功' };
    res.json(response);
  } catch (e) { next(e); }
};

export const stats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupBy, startDate, endDate } = req.query as any;
    const data = await statsTicketSales(groupBy, startDate, endDate);
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) { next(e); }
};

export const exportCsv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await exportTicketSalesCsv(req.query as any);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ticket_sales.csv"');
    res.status(200).send(csv);
  } catch (e) { next(e); }
};


