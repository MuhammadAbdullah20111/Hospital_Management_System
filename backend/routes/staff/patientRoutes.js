import express from 'express';
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getNextMrNumber
} from '../../controllers/staff/patientController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/next-mr-number', checkPermission('create-patient'), getNextMrNumber);
router.post('/', checkPermission('create-patient'), createPatient);
router.get('/', checkPermission('view-patient'), getAllPatients);
router.get('/:id', checkPermission('view-patient'), getPatientById);
router.put('/:id', checkPermission('edit-patient'), updatePatient);
router.delete('/:id', checkPermission('delete-patient'), deletePatient);

export default router;
