import { param, query, body } from 'express-validator';

export const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('order_number').optional().isString(),
  query('user_id').optional().isInt({ min: 1 }).toInt(),
  query('train_number').optional().isString(),
  query('order_status').optional().isIn(['pending', 'paid', 'completed', 'refunded', 'cancelled']),
  query('travel_date_start').optional().isISO8601(),
  query('travel_date_end').optional().isISO8601(),
];

export const idParamValidator = [param('orderId').isInt({ min: 1 }).withMessage('订单ID无效')];

export const refundValidator = [
  ...idParamValidator,
  body('service_fee_rate').isFloat({ min: 0, max: 100 }).withMessage('手续费率应在0-100之间'),
  body('refund_reason').optional().isString(),
  body('destination').optional().isString(),
  body('route').optional().isString(),
  body('vehicle_type').optional().isString(),
];


