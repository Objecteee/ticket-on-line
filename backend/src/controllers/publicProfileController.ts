import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import User from '../models/User';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const u = await User.findByPk(req.user.userId);
    if (!u) return res.status(404).json({ code: 404, message: '用户不存在' } as ApiResponse);
    const data = {
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      updated_at: u.updated_at,
    };
    res.json({ code: 200, message: 'ok', data } as ApiResponse);
  } catch (e) { next(e); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ code: 401, message: '未登录' } as ApiResponse);
    const { username, email, phone } = req.body || {};
    const u = await User.findByPk(req.user.userId);
    if (!u) return res.status(404).json({ code: 404, message: '用户不存在' } as ApiResponse);
    // 唯一性校验
    if (username && username !== u.username) {
      const existed = await User.findOne({ where: { username } });
      if (existed) return res.status(400).json({ code: 400, message: '用户名已被占用' } as ApiResponse);
    }
    if (email && email !== u.email) {
      const existed = await User.findOne({ where: { email } });
      if (existed) return res.status(400).json({ code: 400, message: '邮箱已被占用' } as ApiResponse);
    }
    if (phone && phone !== u.phone) {
      const existed = await User.findOne({ where: { phone } });
      if (existed) return res.status(400).json({ code: 400, message: '手机号已被占用' } as ApiResponse);
    }
    await u.update({ username: username ?? u.username, email: email ?? u.email, phone: phone ?? u.phone });
    res.json({ code: 200, message: '保存成功' } as ApiResponse);
  } catch (e) { next(e); }
};


