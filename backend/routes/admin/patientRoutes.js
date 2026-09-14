import express from 'express';
import { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient, getNextMrNumber } from '../../controllers/admin/patientController.js';
import { createPatientValidation, updatePatientValidation } from '../../validations/admin/patientValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.get('/next-mr-number', getNextMrNumber);
router.post('/', validate(createPatientValidation), createPatient);
router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.put('/:id', validate(updatePatientValidation), updatePatient);
router.delete('/:id', deletePatient);

export default router;
