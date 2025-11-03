import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import * as controller from '../controllers/adminTicketSaleController';
import { listValidator, idParamValidator, createValidator, updateValidator, statsValidator } from '../validators/ticketSale.validator';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/ticket-sales', validate(listValidator), controller.list);
router.post('/ticket-sales', validate(createValidator), controller.create);
router.put('/ticket-sales/:saleId', validate(updateValidator), controller.update);
router.delete('/ticket-sales/:saleId', validate(idParamValidator), controller.remove);
router.get('/ticket-sales/stats', validate(statsValidator), controller.stats);
router.get('/ticket-sales/export/csv', validate(listValidator), controller.exportCsv);

export default router;


