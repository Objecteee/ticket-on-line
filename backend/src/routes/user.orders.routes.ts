import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { query, param, body } from 'express-validator';
import * as ctrl from '../controllers/publicUserOrderController';

const router = Router();

router.get('/', authenticate, validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('order_status').optional().isIn(['pending','paid','completed','refunded','cancelled']),
] as any), ctrl.listMyOrders);

router.get('/:orderId', authenticate, validate([ param('orderId').isInt({ min: 1 }).toInt() ] as any), ctrl.getMyOrder);

router.post('/:orderId/pay', authenticate, validate([ param('orderId').isInt({ min: 1 }).toInt() ] as any), ctrl.payMyOrder);

router.post('/:orderId/cancel', authenticate, validate([ param('orderId').isInt({ min: 1 }).toInt() ] as any), ctrl.cancelMyOrder);

router.post('/:orderId/refund', authenticate, validate([
  param('orderId').isInt({ min: 1 }).toInt(),
  body('service_fee_rate').optional().isFloat({ min: 0, max: 100 }),
  body('refund_reason').optional().isString(),
] as any), ctrl.refundMyOrder);

export default router;


