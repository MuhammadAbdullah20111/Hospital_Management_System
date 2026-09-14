import express from 'express';
import authRoutes from './authRoutes.js';
import layoutRoutes from './layoutRoutes.js';
import patientRoutes from './patientRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import labTestRoutes from './labTestRoutes.js';
import homeRoutes from './homeRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import shiftRoutes from './shiftRoutes.js';
import staffRoutes from './staffRoutes.js';
import clinicalRoutes from './clinicalRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/layout', layoutRoutes);
router.use('/patient', patientRoutes);
router.use('/appointment', appointmentRoutes);
router.use('/payment', paymentRoutes);
router.use('/lab-test', labTestRoutes);
router.use('/home', homeRoutes);
router.use('/department', departmentRoutes);
router.use('/service', serviceRoutes);
router.use('/shift', shiftRoutes);
router.use('/staff', staffRoutes);
router.use('/clinical', clinicalRoutes);

export default router;
