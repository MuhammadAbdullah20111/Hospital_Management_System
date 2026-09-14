import express from 'express';
import { getHomeData } from '../../controllers/staff/homeController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', checkPermission('view-dashboard'), getHomeData);

export default router;
