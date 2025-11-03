import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { listMessages, createMessage } from '../services/messageService';

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { page, pageSize } = req.query as any;
    // 用户只能看到已审核通过的留言，或者自己的留言（包括待审核/已拒绝的）
    const data = await listMessages({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      status: 'approved',
    });
    // 如果有自己的留言，也获取并合并
    const myMessages = await listMessages({
      page: 1,
      pageSize: 100,
      user_id: req.user.userId,
    });
    // 合并已通过的和其他状态的自己的留言
    const allMessages = [
      ...data.list,
      ...myMessages.list.filter(m => m.status !== 'approved'),
    ];
    // 去重并排序
    const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    res.json({ code: 200, message: 'ok', data: { list: uniqueMessages, total: uniqueMessages.length, page: Number(page) || 1, pageSize: Number(pageSize) || 10 } } as ApiResponse);
  } catch (e) { next(e); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { content } = req.body || {};
    const msg = await createMessage(req.user.userId, req.user.username, content);
    res.json({ code: 200, message: '留言已提交，等待审核', data: msg } as ApiResponse);
  } catch (e) { next(e); }
};

