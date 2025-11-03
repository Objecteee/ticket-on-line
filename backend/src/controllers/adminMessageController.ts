import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { listMessages, getMessageById, approveMessage, rejectMessage, replyMessage, deleteMessage } from '../services/messageService';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize, status } = req.query as any;
    const data = await listMessages({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      status,
    });
    res.json({ code: 200, message: 'ok', data } as ApiResponse);
  } catch (e) { next(e); }
};

export const getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.messageId);
    const msg = await getMessageById(id);
    res.json({ code: 200, message: 'ok', data: msg } as ApiResponse);
  } catch (e) { next(e); }
};

export const approve = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.messageId);
    const msg = await approveMessage(id);
    res.json({ code: 200, message: '已审核通过', data: msg } as ApiResponse);
  } catch (e) { next(e); }
};

export const reject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.messageId);
    const msg = await rejectMessage(id);
    res.json({ code: 200, message: '已拒绝', data: msg } as ApiResponse);
  } catch (e) { next(e); }
};

export const reply = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.messageId);
    const { reply } = req.body || {};
    const msg = await replyMessage(id, reply);
    res.json({ code: 200, message: '已回复', data: msg } as ApiResponse);
  } catch (e) { next(e); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.messageId);
    await deleteMessage(id);
    res.json({ code: 200, message: '已删除' } as ApiResponse);
  } catch (e) { next(e); }
};

