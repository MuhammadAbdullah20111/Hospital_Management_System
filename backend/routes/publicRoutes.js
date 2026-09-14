import express from 'express';
import { getPublicServices } from '../controllers/web/serviceController.js';
import contactRoutes from './web/contactRoutes.js';
import hl7Routes from './api/hl7Routes.js';

const router = express.Router();

router.get('/services', getPublicServices);

// Contact form submission (no auth required)
router.use('/contact', contactRoutes);

// Mount HL7 routes under /api/hl7
router.use('/hl7', hl7Routes);

export default router;
