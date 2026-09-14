import express from 'express';
import { createPayment, getAllPayments, getPaymentById, updatePayment } from '../../controllers/admin/paymentController.js';
import { createPaymentValidation, updatePaymentValidation } from '../../validations/admin/paymentValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.post('/', validate(createPaymentValidation), createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', validate(updatePaymentValidation), updatePayment);


export default router;
