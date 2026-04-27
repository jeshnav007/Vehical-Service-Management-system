import express from 'express';
import { getAdminStats, fullDeleteUser } from '../controllers/adminController.js';
import { restoreUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/users/:id/restore').put(protect, admin, restoreUser);
router.route('/users/:id/full-delete').delete(protect, admin, fullDeleteUser);

export default router;
