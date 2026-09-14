import express from 'express';
import {
  createBed,
  getAllBeds,
  getBedById,
  updateBed,
  deleteBed,
  assignPatient,
  dischargePatient,
  transferPatient,
  updateBedStatus
} from '../../controllers/admin/bedController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-bed'), createBed);
router.get('/', checkPermission('view-bed'), getAllBeds);
router.get('/:id', checkPermission('view-bed'), getBedById);
router.put('/:id', checkPermission('edit-bed'), updateBed);
router.delete('/:id', checkPermission('delete-bed'), deleteBed);

// specialized endpoints
router.post('/assign', checkPermission('edit-bed'), assignPatient);
router.post('/discharge/:assignmentId', checkPermission('edit-bed'), dischargePatient);
router.post('/transfer', checkPermission('edit-bed'), transferPatient);
router.patch('/:id/status', checkPermission('edit-bed'), updateBedStatus);

export default router;
