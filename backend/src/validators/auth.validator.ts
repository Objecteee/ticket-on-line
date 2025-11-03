/**
 * 认证相关数据验证
 */
import { body, ValidationChain } from 'express-validator';

/**
 * 注册验证规则
 */
export const registerValidator: ValidationChain[] = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 })
    .withMessage('密码长度应在6-20个字符之间'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号码'),
];

/**
 * 登录验证规则
 */
export const loginValidator: ValidationChain[] = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('密码不能为空'),
];

