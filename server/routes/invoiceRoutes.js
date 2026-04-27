import express from 'express';
import { createInvoice, getAllInvoices, getMyInvoices, markInvoiceAsPaid } from '../controllers/invoiceController.js';
import { protect, serviceCenter } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, serviceCenter, createInvoice).get(protect, serviceCenter, getAllInvoices);
router.route('/myinvoices').get(protect, getMyInvoices);
router.route('/:id/pay').put(protect, markInvoiceAsPaid);

export default router;
