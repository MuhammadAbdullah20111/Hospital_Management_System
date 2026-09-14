import express from 'express';
import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment
} from '../../controllers/staff/paymentController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-finance'), createPayment);
router.get('/', checkPermission('view-finance'), getAllPayments);
router.get('/:id', checkPermission('view-finance'), getPaymentById);
router.put('/:id', checkPermission('edit-finance'), updatePayment);


export default router;
