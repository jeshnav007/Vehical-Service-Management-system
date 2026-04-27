import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoiceModel.js';
import ServiceRecord from '../models/serviceRecordModel.js';
import User from '../models/userModel.js';
import { createNotification } from './notificationController.js';

// @desc    Get all global invoices
// @route   GET /api/invoices
// @access  Private/ServiceCenter
const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({})
    .populate('vehicle')
    .populate('serviceRecord')
    .populate('user', 'name');
  
  console.log(`📋 FETCHED ${invoices.length} INVOICES FOR SERVICE CENTER`);
  res.status(200).json(invoices);
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private/Staff
const createInvoice = asyncHandler(async (req, res) => {
  const { serviceRecord } = req.body;

  console.log(`🔷 CREATING INVOICE FOR SERVICE RECORD: ${serviceRecord}`);

  if (!serviceRecord) {
    res.status(400);
    throw new Error('serviceRecord ID is required');
  }

  const record = await ServiceRecord.findById(serviceRecord)
    .populate('vehicle')
    .populate({ path: 'appointment', select: 'user' });

  if (!record) {
    res.status(404);
    throw new Error('Service Record not found');
  }

  console.log(`   Service Record Status: ${record.status}`);
  console.log(`   Expected Status: Completed`);

  // ⭐ CRITICAL: Status enforcement
  if (record.status !== 'Completed') {
    res.status(400);
    throw new Error(`Cannot generate invoice. Service is not completed. Current status: "${record.status}"`);
  }

  // ⭐ CRITICAL: Duplicate & Payment prevention
  if (record.invoiceGenerated) {
    res.status(400);
    throw new Error('Invoice already generated for this service.');
  }

  if (record.isPaid) {
    res.status(400);
    throw new Error('This service has already been paid for.');
  }

  const existingInvoice = await Invoice.findOne({ serviceRecord: record._id });
  if (existingInvoice) {
    // Sync the flag if it was somehow missed but doc exists
    record.invoiceGenerated = true;
    await record.save();
    res.status(400);
    throw new Error('Invoice already strictly exists in system registry.');
  }

  // ✅ Calculate totals properly
  const partsTotal = record.partsUsed && record.partsUsed.length > 0
    ? record.partsUsed.reduce((acc, part) => acc + (part.price * part.quantity), 0)
    : 0;

  const FIXED_RATE = 100; // $100/hr
  const laborCost = (record.laborHours || 0) * FIXED_RATE;
  
  const amount = partsTotal + laborCost;
  const tax = amount * 0.10; // 10% tax rate
  const totalAmount = amount + tax;

  console.log(`   Parts Total: $${partsTotal.toFixed(2)}`);
  console.log(`   Labor Cost ($${FIXED_RATE}/hr × ${record.laborHours} hrs): $${laborCost.toFixed(2)}`);
  console.log(`   Subtotal: $${amount.toFixed(2)}`);
  console.log(`   Tax (10%): $${tax.toFixed(2)}`);
  console.log(`   TOTAL: $${totalAmount.toFixed(2)}`);

  const invoice = await Invoice.create({
    user: record.appointment ? record.appointment.user : null,
    vehicle: record.vehicle._id || record.vehicle,
    serviceRecord: record._id,
    amount,
    tax,
    totalAmount,
  });

  console.log(`✅ INVOICE CREATED: ${invoice._id}`);

  // ⭐ Sync state back to ServiceRecord
  record.invoiceGenerated = true;
  await record.save();

  if (invoice.user) {
    await createNotification(
      invoice.user,
      'Invoice Generated',
      `Your final invoice of $${totalAmount.toFixed(2)} is ready for payment.`,
      'Alert'
    );
  }

  // Return fully populated invoice for frontend to use immediately
  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('vehicle', 'make model')
    .populate('serviceRecord');

  res.status(201).json(populatedInvoice);
});

// @desc    Get user invoices
// @route   GET /api/invoices/myinvoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate('vehicle', 'make model')
    .populate('serviceRecord');
  
  console.log(`📋 FETCHED ${invoices.length} INVOICES FOR USER ${req.user._id}`);
  res.status(200).json(invoices);
});

// @desc    Mark invoice as paid
// @route   PUT /api/invoices/:id/pay
// @access  Private
const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    if (invoice.paymentStatus === 'Paid') {
      res.status(400);
      throw new Error('Invoice is already marked as paid');
    }

    invoice.paymentStatus = 'Paid';
    invoice.paymentDate = Date.now();

    const updatedInvoice = await invoice.save();
    
    // ⭐ Sync state back to ServiceRecord
    const record = await ServiceRecord.findById(invoice.serviceRecord);
    if (record) {
      record.isPaid = true;
      await record.save();
    }

    // Notification Hook for CUSTOMER
    await createNotification(
      invoice.user,
      'Payment Processed',
      `Thank you! Payment for invoice #${invoice._id.toString().substring(0,6)} securely tracked.`,
      'Info'
    );

    // Notification Hook for SERVICE CENTER (Staff)
    const staff = await User.find({ role: 'ServiceCenter' });
    await Promise.all(staff.map(member => 
      createNotification(
        member._id,
        'Payment Received',
        `Invoice #${invoice._id.toString().substring(0,6)} for ${invoice.vehicle?.make || 'Vehicle'} has been settled.`,
        'Success'
      )
    ));

    console.log(`💰 PAYMENT RECEIVED for Invoice ${invoice._id}`);

    res.status(200).json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

export { createInvoice, getAllInvoices, getMyInvoices, markInvoiceAsPaid };
