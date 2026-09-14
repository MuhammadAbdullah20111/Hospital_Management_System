import express from 'express';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../../controllers/admin/roomController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-room'), createRoom);
router.get('/', checkPermission('view-room'), getAllRooms);
router.get('/:id', checkPermission('view-room'), getRoomById);
router.put('/:id', checkPermission('edit-room'), updateRoom);
router.delete('/:id', checkPermission('delete-room'), deleteRoom);

export default router;
