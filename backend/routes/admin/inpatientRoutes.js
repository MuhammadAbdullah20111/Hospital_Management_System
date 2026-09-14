import express from 'express';
import { getInpatientSummary, getBedOccupancy } from '../../controllers/admin/inpatientController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getInpatientSummary);
router.get('/occupancy', getBedOccupancy);

export default router;
