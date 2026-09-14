import express from 'express';
import {
  createService,
  getAllServicesAdmin,
  getServiceById,
  updateService,
  deleteService,
} from '../../controllers/admin/serviceController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { createServiceValidation, updateServiceValidation } from '../../validations/admin/serviceValidation.js';
import { validate } from '../../middlewares/validate.js';
import uploadService from '../../middlewares/uploadServiceMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', uploadService.single('image'), validate(createServiceValidation), createService);
router.get('/', getAllServicesAdmin);
router.get('/:id', getServiceById);
router.put('/:id', uploadService.single('image'), validate(updateServiceValidation), updateService);
router.delete('/:id', deleteService);

export default router;
