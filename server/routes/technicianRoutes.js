import express from 'express';
import { getTechnicians } from '../controllers/technicianController.js';
import { protect, serviceCenter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, serviceCenter, getTechnicians);

export default router;
