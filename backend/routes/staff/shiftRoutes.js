import express from 'express';
import {
    createShift,
    getAllShifts,
    getShiftById,
    updateShift,
    deleteShift
} from '../../controllers/staff/shiftController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-shift'), createShift);
router.get('/', checkPermission('view-shift'), getAllShifts);
router.get('/:id', checkPermission('view-shift'), getShiftById);
router.put('/:id', checkPermission('edit-shift'), updateShift);
router.delete('/:id', checkPermission('delete-shift'), deleteShift);

export default router;
