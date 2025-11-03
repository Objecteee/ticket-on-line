import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { query, body } from 'express-validator';
import * as ctrl from '../controllers/publicMessageController';

const router = Router();

router.get('/', authenticate, validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
] as any), ctrl.list);

router.post('/', authenticate, validate([
  body('content').isString().notEmpty().isLength({ min: 1, max: 500 }),
] as any), ctrl.create);

export default router;

