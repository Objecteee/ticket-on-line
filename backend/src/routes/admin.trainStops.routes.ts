import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import * as ctrl from '../controllers/adminTrainStopController';

const router = Router();

router.get('/trains/:trainId/stops', authenticate, requireAdmin, ctrl.list);
router.put('/trains/:trainId/stops', authenticate, requireAdmin, ctrl.save);

export default router;


