/**
 * 认证路由
 */
import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { forgot, reset } from '../controllers/passwordController';
import { validate } from '../middleware/validation.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { body } from 'express-validator';

const router = Router();

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', validate(registerValidator), register);

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', validate(loginValidator), login);

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', logout);

// 找回/重置密码
router.post('/forgot', validate([
  body('identifier').isString().notEmpty(),
] as any), forgot);

router.post('/reset', validate([
  body('identifier').isString().notEmpty(),
  body('code').isLength({ min: 4, max: 10 }),
  body('new_password').isLength({ min: 6 }),
] as any), reset);

export default router;

