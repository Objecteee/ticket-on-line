import { Router } from 'express';
import * as controller from '../controllers/publicTicketController';
import { validate } from '../middleware/validation.middleware';
import { query } from 'express-validator';

const router = Router();

router.get('/search', validate([
  query('date').isISO8601().withMessage('date 必须为 YYYY-MM-DD'),
  query('departure').optional().isString(),
  query('arrival').optional().isString(),
  query('train_number').optional().isString(),
  query('seat_type').optional().isIn(['business', 'first', 'second']),
] as any), controller.search);

router.get('/detail', validate([
  query('train_id').isInt({ min: 1 }).toInt(),
  query('date').isISO8601(),
  query('from').isString(),
  query('to').isString(),
] as any), controller.detail);

export default router;


