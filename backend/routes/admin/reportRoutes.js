import express from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';
import { getComprehensiveReport } from '../../controllers/admin/ReportController.js';

const router = express.Router();

router.use(authenticate);

// We assume the user has a "view-reports" permission, or we just allow it for ADMIN role.
// We can use both.
router.get('/', checkPermission('view-reports'), getComprehensiveReport);

export default router;
