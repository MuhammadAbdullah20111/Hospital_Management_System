import express from 'express';
import {
  createWard,
  getAllWards,
  getWardById,
  updateWard,
  deleteWard,
} from '../../controllers/admin/wardController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-ward'), createWard);
router.get('/', checkPermission('view-ward'), getAllWards);
router.get('/:id', checkPermission('view-ward'), getWardById);
router.put('/:id', checkPermission('edit-ward'), updateWard);
router.delete('/:id', checkPermission('delete-ward'), deleteWard);

export default router;
