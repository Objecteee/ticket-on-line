import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as controller from '../controllers/adminOrderController';
import { listValidator, idParamValidator, refundValidator } from '../validators/order.validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/orders', validate(listValidator), controller.list);
router.get('/orders/:orderId', validate(idParamValidator), controller.detail);
router.post('/orders/:orderId/cancel', validate(idParamValidator), controller.cancel);
router.post('/orders/:orderId/refund', validate(refundValidator), controller.refund);

export default router;


