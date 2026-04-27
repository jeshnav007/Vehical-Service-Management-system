import express from 'express';
import { addVehicle, getMyVehicles } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addVehicle);
router.route('/myvehicles').get(protect, getMyVehicles);

export default router;
