import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as controller from '../controllers/adminTrainController';
import { listValidator, idParamValidator, createValidator, updateValidator } from '../validators/train.validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/trains', validate(listValidator), controller.list);
router.get('/trains/:trainId', validate(idParamValidator), controller.detail);
router.post('/trains', validate(createValidator), controller.create);
router.put('/trains/:trainId', validate(updateValidator), controller.update);
router.delete('/trains/:trainId', validate(idParamValidator), controller.remove);

export default router;


