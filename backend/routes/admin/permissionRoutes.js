import express from 'express';
import { getAllPermissions } from '../../controllers/admin/permissionController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', checkPermission('view-role'), getAllPermissions);

export default router;
