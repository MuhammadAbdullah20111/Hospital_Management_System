import express from 'express';
import { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment } from '../../controllers/admin/appointmentController.js';
import { createAppointmentValidation, updateAppointmentValidation } from '../../validations/admin/appointmentValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.post('/', validate(createAppointmentValidation), createAppointment);
router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', validate(updateAppointmentValidation), updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
