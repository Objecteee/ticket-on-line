import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as controller from '../controllers/adminRefundController';
import { query, param } from 'express-validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/refunds', validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('train_number').optional().isString(),
  query('destination').optional().isString(),
] as any), controller.list);

router.get('/refunds/:refundId', validate([param('refundId').isInt({ min: 1 })] as any), controller.detail);

export default router;


