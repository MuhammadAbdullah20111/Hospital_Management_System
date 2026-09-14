import express from 'express';
import {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} from '../../controllers/staff/appointmentController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-appointment'), createAppointment);
router.get('/', checkPermission('view-appointment'), getAllAppointments);
router.get('/:id', checkPermission('view-appointment'), getAppointmentById);
router.put('/:id', checkPermission('edit-appointment'), updateAppointment);
router.delete('/:id', checkPermission('delete-appointment'), deleteAppointment);

export default router;
