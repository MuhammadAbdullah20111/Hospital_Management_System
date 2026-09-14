import express from 'express';
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  testConnection,
  syncDevice,
  syncAllDevices,
  getAttendanceLogs,
  getDailySummaries,
  updateDailySummary,
  getMonthlyReport,
  simulatePunch,
  clearSimulationLogs
} from '../../controllers/admin/attendanceController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Biometric Devices configuration
router.post('/devices', createDevice);
router.get('/devices', getAllDevices);
router.get('/devices/:id', getDeviceById);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);
router.post('/devices/:id/test', testConnection);
router.post('/devices/:id/sync', syncDevice);
router.post('/devices/sync-all', syncAllDevices);

// Attendance logs & daily summaries
router.get('/logs', getAttendanceLogs);
router.get('/summaries', getDailySummaries);
router.put('/summaries/:id', updateDailySummary);

// Reports
router.get('/reports/monthly', getMonthlyReport);

// Simulator
router.post('/simulate/punch', simulatePunch);
router.post('/simulate/clear', clearSimulationLogs);

export default router;
