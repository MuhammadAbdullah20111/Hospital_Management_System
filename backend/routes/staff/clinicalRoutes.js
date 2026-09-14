import express from 'express';
import { createPrescription, getPatientHistory, getPrescriptionByAppointmentId } from '../../controllers/staff/clinicalController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/prescription', createPrescription);
router.get('/patient-history/:patientId', getPatientHistory);
router.get('/prescription/appointment/:appointmentId', getPrescriptionByAppointmentId);

export default router;
