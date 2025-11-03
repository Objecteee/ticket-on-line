import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { query, param, body } from 'express-validator';
import * as ctrl from '../controllers/adminMessageController';

const router = Router();

router.get('/', authenticate, requireAdmin, validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
] as any), ctrl.list);

router.get('/:messageId', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.getById);

router.post('/:messageId/approve', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.approve);

router.post('/:messageId/reject', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.reject);

router.post('/:messageId/reply', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
  body('reply').isString().notEmpty().isLength({ min: 1, max: 500 }),
] as any), ctrl.reply);

router.delete('/:messageId', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.remove);

export default router;

