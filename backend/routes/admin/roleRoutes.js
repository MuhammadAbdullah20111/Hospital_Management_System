import express from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole, getRoleDependencies } from '../../controllers/admin/roleController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';
import { createRoleValidation, updateRoleValidation } from '../../validations/admin/roleValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createRoleValidation), checkPermission('create-role'), createRole);
router.get('/', checkPermission('view-role'), getAllRoles);
router.get('/:id', checkPermission('view-role'), getRoleById);
router.get('/:id/dependencies', checkPermission('view-role'), getRoleDependencies);
router.put('/:id', validate(updateRoleValidation), checkPermission('edit-role'), updateRole);
router.delete('/:id', checkPermission('delete-role'), deleteRole);

export default router;
