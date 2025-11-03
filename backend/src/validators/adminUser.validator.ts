/**
 * 管理员 - 用户管理验证器
 */
import { body, param, query } from 'express-validator';

export const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('keyword').optional().isString().trim(),
  query('role').optional().isIn(['user', 'admin']),
  query('status').optional().isInt({ min: 0, max: 1 }).toInt(),
  query('sortBy').optional().isIn(['created_at', 'username', 'status', 'role']),
  query('order').optional().isIn(['asc', 'desc']),
];

export const idParamValidator = [
  param('userId').isInt({ min: 1 }).withMessage('用户ID无效'),
];

export const createValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度应在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度应在6-20个字符之间'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('role').optional().isIn(['user', 'admin']).withMessage('角色无效'),
  body('status').optional().isIn([0, 1]).withMessage('状态无效'),
];

export const updateValidator = [
  ...idParamValidator,
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('status').optional().isIn([0, 1]).withMessage('状态无效'),
  body('role').optional().isIn(['user', 'admin']).withMessage('角色无效'),
];

export const updateStatusValidator = [
  ...idParamValidator,
  body('status').isIn([0, 1]).withMessage('状态无效'),
];

export const updateRoleValidator = [
  ...idParamValidator,
  body('role').isIn(['user', 'admin']).withMessage('角色无效'),
];

export const resetPasswordValidator = [
  ...idParamValidator,
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度应在6-20个字符之间'),
];


