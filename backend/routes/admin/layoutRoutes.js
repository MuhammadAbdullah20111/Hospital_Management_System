import express from 'express';
import { getLayoutData } from '../../controllers/admin/layoutController.js';

const router = express.Router();

router.get('/', getLayoutData);

export default router;
