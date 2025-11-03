import { body, param, query } from 'express-validator';

export const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('keyword').optional().isString().trim(),
  query('status').optional().isInt({ min: 0, max: 1 }).toInt(),
  query('vehicle_type').optional().isString().trim(),
];

export const idParamValidator = [param('trainId').isInt({ min: 1 }).withMessage('车次ID无效')];

export const createValidator = [
  body('train_number').trim().notEmpty().withMessage('车次号不能为空').isLength({ max: 20 }),
  body('departure_station').trim().notEmpty().withMessage('始发站不能为空'),
  body('arrival_station').trim().notEmpty().withMessage('终点站不能为空'),
  body('departure_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('发车时间格式应为HH:mm或HH:mm:ss'),
  body('arrival_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('到达时间格式应为HH:mm或HH:mm:ss'),
  body('vehicle_type').optional().isString(),
  body('total_seats_business').optional().isInt({ min: 0 }).toInt(),
  body('total_seats_first').optional().isInt({ min: 0 }).toInt(),
  body('total_seats_second').optional().isInt({ min: 0 }).toInt(),
  body('price_business').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('price_first').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('price_second').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('status').optional().isIn([0, 1]),
];

export const updateValidator = [
  ...idParamValidator,
  body('train_number').optional().isLength({ max: 20 }),
  body('departure_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('arrival_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
  body('total_seats_business').optional().isInt({ min: 0 }).toInt(),
  body('total_seats_first').optional().isInt({ min: 0 }).toInt(),
  body('total_seats_second').optional().isInt({ min: 0 }).toInt(),
  body('price_business').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('price_first').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('price_second').optional().matches(/^\d+(\.\d{1,2})?$/),
  body('status').optional().isIn([0, 1]),
];


