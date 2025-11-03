import { body, param, query } from 'express-validator';

export const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('train_number').optional().isString(),
  query('destination').optional().isString(),
];

export const idParamValidator = [param('saleId').isInt({ min: 1 }).withMessage('售票ID无效')];

export const createValidator = [
  body('sale_date').isISO8601().withMessage('日期格式无效'),
  body('train_id').isInt({ min: 1 }).toInt(),
  body('train_number').notEmpty(),
  body('destination').notEmpty(),
  body('seat_type').isIn(['business', 'first', 'second']).withMessage('座位类型应为 business/first/second'),
  body('ticket_count').isInt({ min: 1 }).toInt(),
  body('actual_amount').matches(/^\d+(\.\d{1,2})?$/),
  body('order_id').optional().isInt({ min: 1 }).toInt(),
];

export const updateValidator = [
  ...idParamValidator,
  body('sale_date').optional().isISO8601(),
  body('train_id').optional().isInt({ min: 1 }).toInt(),
  body('ticket_count').optional().isInt({ min: 1 }).toInt(),
  body('actual_amount').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('order_id').optional().isInt({ min: 1 }).toInt(),
  body('seat_type').optional().isIn(['business', 'first', 'second']).withMessage('座位类型应为 business/first/second'),
];

export const statsValidator = [
  query('groupBy').isIn(['date', 'train', 'destination']).withMessage('groupBy 无效'),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];


