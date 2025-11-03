import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import * as controller from '../controllers/publicOrderController';

const router = Router();

router.post('/', authenticate, validate([
  body('train_id').isInt({ min: 1 }).toInt(),
  body('date').isISO8601(),
  body('from').isString(),
  body('to').isString(),
  body('seat_type').isIn(['business','first','second']),
  body('count').optional().isInt({ min: 1, max: 9 }).toInt(),
  body('passengers').optional().isArray(),
  body('passengers.*.name').optional().isString(),
  body('passengers.*.id_card').optional().isString(),
  body('passenger_name').optional().isString(),
  body('passenger_id_card').optional().isString(),
] as any), controller.create);

export default router;


