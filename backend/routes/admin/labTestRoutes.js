import express from 'express';
import { createLabTest, getAllLabTests, getLabTestById, updateLabTest, deleteLabTest } from '../../controllers/admin/labTestController.js';
import { createLabTestValidation, updateLabTestValidation } from '../../validations/admin/labTestValidation.js';
import { validate } from '../../middlewares/validate.js';

const router = express.Router();

router.post('/', validate(createLabTestValidation), createLabTest);
router.get('/', getAllLabTests);
router.get('/:id', getLabTestById);
router.put('/:id', validate(updateLabTestValidation), updateLabTest);
router.delete('/:id', deleteLabTest);

export default router;
