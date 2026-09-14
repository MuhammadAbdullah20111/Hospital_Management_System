import express from 'express';
import {
    createLabTest,
    getAllLabTests,
    getLabTestById,
    updateLabTest,
    deleteLabTest,
    uploadLabReport
} from '../../controllers/staff/labTestController.js';
import uploadReport from '../../middlewares/uploadReportMiddleware.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-labtest'), createLabTest);
router.get('/', checkPermission('view-labtest'), getAllLabTests);
router.get('/:id', checkPermission('view-labtest'), getLabTestById);
router.put('/:id', checkPermission('edit-labtest'), updateLabTest);
router.post('/:id/upload-report', checkPermission('edit-labtest'), uploadReport.single('report'), uploadLabReport);
router.delete('/:id', checkPermission('delete-labtest'), deleteLabTest);

export default router;
