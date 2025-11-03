/**
 * 管理员 - 用户管理路由
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as controller from '../controllers/adminUserController';
import {
  listValidator,
  idParamValidator,
  createValidator,
  updateValidator,
  updateStatusValidator,
  updateRoleValidator,
  resetPasswordValidator,
} from '../validators/adminUser.validator';

const router = Router();

// 所有管理员接口都需要认证且具备管理员角色
router.use(authenticate, requireAdmin);

// 列表
router.get('/users', validate(listValidator), controller.list);
// 详情
router.get('/users/:userId', validate(idParamValidator), controller.detail);
// 创建
router.post('/users', validate(createValidator), controller.create);
// 更新
router.put('/users/:userId', validate(updateValidator), controller.update);
// 更新状态
router.patch('/users/:userId/status', validate(updateStatusValidator), controller.updateStatus);
// 更新角色
router.patch('/users/:userId/role', validate(updateRoleValidator), controller.updateRole);
// 重置密码
router.post('/users/:userId/reset-password', validate(resetPasswordValidator), controller.resetPassword);

export default router;


