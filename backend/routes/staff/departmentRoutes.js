import express from 'express';
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from '../../controllers/staff/departmentController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', checkPermission('create-department'), createDepartment);
router.get('/', checkPermission('view-department'), getAllDepartments);
router.get('/:id', checkPermission('view-department'), getDepartmentById);
router.put('/:id', checkPermission('edit-department'), updateDepartment);
router.delete('/:id', checkPermission('delete-department'), deleteDepartment);

export default router;
