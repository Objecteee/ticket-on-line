import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { listTrains, createTrain, updateTrain, deleteTrain, getTrainById } from '../services/trainService';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, keyword, status, vehicle_type } = req.query as any;
    const data = await listTrains({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      keyword,
      status: typeof status !== 'undefined' ? Number(status) : undefined,
      vehicle_type,
    });
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainId } = req.params as any;
    const data = await getTrainById(Number(trainId));
    const response: ApiResponse = { code: 200, message: 'ok', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await createTrain(req.body);
    const response: ApiResponse = { code: 200, message: '创建成功', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainId } = req.params as any;
    const data = await updateTrain(Number(trainId), req.body);
    const response: ApiResponse = { code: 200, message: '更新成功', data };
    res.json(response);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainId } = req.params as any;
    await deleteTrain(Number(trainId));
    const response: ApiResponse = { code: 200, message: '删除成功' };
    res.json(response);
  } catch (e) {
    next(e);
  }
};


