import express from 'express';
import {
  createAppointment,
  approveAppointment,
  getMyAppointments,
  getAppointments,
  rejectAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, serviceCenter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createAppointment).get(protect, serviceCenter, getAppointments);
router.route('/myappointments').get(protect, getMyAppointments);
router.route('/:id/approve').put(protect, serviceCenter, approveAppointment);
router.route('/:id/reject').put(protect, serviceCenter, rejectAppointment);
router.route('/:id/cancel').put(protect, cancelAppointment);

export default router;
