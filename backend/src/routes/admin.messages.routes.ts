import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { query, param, body } from 'express-validator';
import * as ctrl from '../controllers/adminMessageController';

const router = Router();

router.get('/messages', authenticate, requireAdmin, validate([
  query('page').optional().isNumeric().toInt(),
  query('pageSize').optional().isNumeric().toInt(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
] as any), ctrl.list);

router.get('/messages/:messageId', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.getById);

router.post('/messages/:messageId/approve', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.approve);

router.post('/messages/:messageId/reject', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.reject);

router.post('/messages/:messageId/reply', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
  body('reply').isString().notEmpty().isLength({ min: 1, max: 500 }),
] as any), ctrl.reply);

router.delete('/messages/:messageId', authenticate, requireAdmin, validate([
  param('messageId').isInt({ min: 1 }).toInt(),
] as any), ctrl.remove);

export default router;

