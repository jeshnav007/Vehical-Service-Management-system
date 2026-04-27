import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  createTechnician,
  deleteUser,
  getTechnicianUsers,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect, admin, serviceCenter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.route('/technicians').get(protect, serviceCenter, getTechnicianUsers);
router.route('/create-technician').post(protect, admin, createTechnician);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;
