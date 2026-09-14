import express from 'express';
import { getPublicServices } from '../../controllers/web/serviceController.js';

const router = express.Router();

router.get('/', getPublicServices);

export default router;
