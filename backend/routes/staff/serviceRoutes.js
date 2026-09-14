import express from 'express';
import {
    createService,
    getAllServicesAdmin,
    getServiceById,
    updateService,
    deleteService
} from '../../controllers/staff/serviceController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-service'), createService);
router.get('/', checkPermission('view-service'), getAllServicesAdmin);
router.get('/:id', checkPermission('view-service'), getServiceById);
router.put('/:id', checkPermission('edit-service'), updateService);
router.delete('/:id', checkPermission('delete-service'), deleteService);

export default router;
