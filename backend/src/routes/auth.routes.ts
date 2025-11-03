/**
 * 认证路由
 */
import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { validate } from '../middleware/validation.middleware';
import { registerValidator, loginValidator } from '../validators/auth.validator';

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

export default router;

