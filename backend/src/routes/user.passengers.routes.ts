import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/publicPassengerController';

const router = Router();

router.get('/', authenticate, ctrl.list);

router.post('/', authenticate, validate([
  body('name').isString().notEmpty(),
  body('id_card').isString().notEmpty(),
  body('phone').optional().isString(),
] as any), ctrl.create);

router.put('/:passengerId', authenticate, validate([
  param('passengerId').isInt({ min: 1 }).toInt(),
  body('name').optional().isString(),
  body('id_card').optional().isString(),
  body('phone').optional().isString(),
] as any), ctrl.update);

router.delete('/:passengerId', authenticate, validate([ param('passengerId').isInt({ min: 1 }).toInt() ] as any), ctrl.remove);

router.post('/:passengerId/default', authenticate, validate([ param('passengerId').isInt({ min: 1 }).toInt() ] as any), ctrl.setDefault);

router.post('/default/clear', authenticate, ctrl.clearDefault);

export default router;


