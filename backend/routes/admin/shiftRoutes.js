import express from 'express';
import { createShift, getAllShifts, getShiftById, updateShift, deleteShift } from '../../controllers/admin/shiftController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { createShiftValidation, updateShiftValidation } from '../../validations/admin/shiftValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createShiftValidation), createShift);
router.get('/', getAllShifts);
router.get('/:id', getShiftById);
router.put('/:id', validate(updateShiftValidation), updateShift);
router.delete('/:id', deleteShift);

export default router;
