import express from 'express';
import { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff } from '../../controllers/admin/staffController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { createStaffValidation, updateStaffValidation } from '../../validations/admin/staffValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createStaffValidation), createStaff);
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.put('/:id', validate(updateStaffValidation), updateStaff);
router.delete('/:id', deleteStaff);

export default router;
