import express from 'express';
import serviceRoutes from './serviceRoutes.js';

import doctorRoutes from './doctorRoutes.js';

const router = express.Router();

router.use('/services', serviceRoutes);

router.use('/doctors', doctorRoutes);

export default router;
