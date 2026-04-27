import express from 'express';
import {
  createServiceRecord,
  updateServiceRecordStatus,
  getMyTasks,
  getServiceRecords,
  deleteServiceRecord,
  getMyServiceRecords,
} from '../controllers/serviceRecordController.js';
import { protect, serviceCenter, technician, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, serviceCenter, createServiceRecord).get(protect, serviceCenter, getServiceRecords);
router.route('/myservices').get(protect, getMyServiceRecords);
router.route('/myjobs').get(protect, technician, getMyTasks);
router.route('/:id').delete(protect, admin, deleteServiceRecord);
router.route('/:id/status').put(protect, technician, updateServiceRecordStatus);

export default router;
