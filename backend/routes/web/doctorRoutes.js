import express from 'express';
import { getDoctors } from '../../controllers/web/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);

export default router;
