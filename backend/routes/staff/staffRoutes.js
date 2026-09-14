import express from 'express';
import { getDoctors } from '../../controllers/staff/staffController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/doctors', getDoctors);

export default router;
