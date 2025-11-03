/**
 * 数据验证中间件
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../types';

/**
 * 验证中间件工厂函数
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 执行所有验证规则
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      const response: ApiResponse = {
        code: 400,
        message: errorMessages.join('; '),
      };
      return res.status(400).json(response);
    }

    next();
  };
};

