import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { getProfile, updateProfile } from '../controllers/publicProfileController';

const router = Router();

router.get('/', authenticate, getProfile);

router.put('/', authenticate, validate([
  body('username').optional().isLength({ min: 3, max: 20 }),
  body('email').optional().isEmail(),
  body('phone').optional().isString().isLength({ min: 6, max: 20 }),
] as any), updateProfile);

export default router;


