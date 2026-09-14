import express from 'express';
import { getLayoutData } from '../../controllers/staff/layoutController.js';
import { authenticate } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getLayoutData);

export default router;
