import { Request, Response, NextFunction } from 'express';
import { requestResetCode, resetPasswordByCode } from '../services/passwordService';
import { ApiResponse } from '../types';

export const forgot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.body as any;
    const data = await requestResetCode(identifier);
    res.json({ code: 200, message: '验证码已生成（开发环境直接返回）', data } as ApiResponse);
  } catch (e) { next(e); }
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, code, new_password } = req.body as any;
    await resetPasswordByCode(identifier, code, new_password);
    res.json({ code: 200, message: '密码已重置' } as ApiResponse);
  } catch (e) { next(e); }
};


