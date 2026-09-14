import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../../controllers/admin/departmentController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createDepartment);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
