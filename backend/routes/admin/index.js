import express from 'express';
import authRoutes from './authRoutes.js';
import staffRoutes from './staffRoutes.js';
import shiftRoutes from './shiftRoutes.js';
import roleRoutes from './roleRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import patientRoutes from './patientRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import labTestRoutes from './labTestRoutes.js';
import financeRoutes from './financeRoutes.js';
import testRoutes from './testRoutes.js';
import wardRoutes from './wardRoutes.js';
import roomRoutes from './roomRoutes.js';
import bedRoutes from './bedRoutes.js';
import inpatientRoutes from './inpatientRoutes.js';
import layoutRoutes from './layoutRoutes.js';
import homeRoutes from './homeRoutes.js';

import attendanceRoutes from './attendanceRoutes.js';
import reportRoutes from './reportRoutes.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { authorize } from '../../middlewares/authorizeMiddleware.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use(authenticate);

// Routes with robust checkPermission granular authorization
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/finance', financeRoutes);
router.use('/wards', wardRoutes);
router.use('/rooms', roomRoutes);
router.use('/beds', bedRoutes);
router.use('/reports', reportRoutes);

// Routes relying on legacy authorize middleware
router.use(authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'LAB_TECHNICIAN']));

router.use('/staff', staffRoutes);
router.use('/shifts', shiftRoutes);
router.use('/services', serviceRoutes);
router.use('/departments', departmentRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/tests', testRoutes);
router.use('/inpatient', inpatientRoutes);
router.use('/layout', layoutRoutes);
router.use('/home', homeRoutes);

router.use('/attendance', attendanceRoutes);

export default router;
