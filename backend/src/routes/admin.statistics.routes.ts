import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import * as controller from '../controllers/adminStatisticsController';
import { validate } from '../middleware/validation.middleware';
import { query } from 'express-validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/statistics/trend', validate([
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
] as any), controller.trend);

router.get('/statistics/top', validate([
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
] as any), controller.top);

router.get('/statistics/summary', validate([
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
] as any), controller.summary);

export default router;


