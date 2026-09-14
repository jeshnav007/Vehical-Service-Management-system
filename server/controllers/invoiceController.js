import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

// Helper to populate invoice vehicle, serviceRecord, and user
const populateInvoice = async (invoice) => {
  if (!invoice) return null;
  const inv = { ...invoice };

  if (inv.vehicle && typeof inv.vehicle === 'string') {
    const vDoc = await db.collection('vehicles').doc(inv.vehicle).get();
    if (vDoc.exists) {
      inv.vehicle = docWithId(vDoc);
    }
  }

  if (inv.serviceRecord && typeof inv.serviceRecord === 'string') {
    const sDoc = await db.collection('serviceRecords').doc(inv.serviceRecord).get();
    if (sDoc.exists) {
      inv.serviceRecord = docWithId(sDoc);
    }
  }

  if (inv.user && typeof inv.user === 'string') {
    const uDoc = await db.collection('users').doc(inv.user).get();
    if (uDoc.exists) {
      const uData = uDoc.data();
      inv.user = {
        _id: uDoc.id,
        id: uDoc.id,
        name: uData.name || '',
        email: uData.email || '',
      };
    }
  }

  return inv;
};

// @desc    Get all global invoices
// @route   GET /api/invoices
// @access  Private/ServiceCenter
const getAllInvoices = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('invoices').get();
  const invoices = docsWithId(snapshot);
  const populated = await Promise.all(invoices.map(populateInvoice));

  res.status(200).json(populated);
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private/Staff
const createInvoice = asyncHandler(async (req, res) => {
  const { serviceRecord } = req.body;

  if (!serviceRecord) {
    res.status(400);
    throw new Error('serviceRecord ID is required');
  }

  const recordRef = db.collection('serviceRecords').doc(serviceRecord);
  const recordDoc = await recordRef.get();

  if (!recordDoc.exists) {
    res.status(404);
    throw new Error('Service Record not found');
  }

  const record = recordDoc.data();

  // Status enforcement
  if (record.status !== 'Completed') {
    res.status(400);
    throw new Error(`Cannot generate invoice. Service is not completed. Current status: "${record.status}"`);
  }

  if (record.invoiceGenerated) {
    res.status(400);
    throw new Error('Invoice already generated for this service.');
  }

  if (record.isPaid) {
    res.status(400);
    throw new Error('This service has already been paid for.');
  }

  // Duplicate check
  const existingSnapshot = await db.collection('invoices')
    .where('serviceRecord', '==', serviceRecord)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    await recordRef.update({ invoiceGenerated: true });
    res.status(400);
    throw new Error('Invoice already strictly exists in system registry.');
  }

  // Calculate totals
  const partsTotal = record.partsUsed && record.partsUsed.length > 0
    ? record.partsUsed.reduce((acc, part) => acc + ((part.price || 0) * (part.quantity || 1)), 0)
    : 0;

  const FIXED_RATE = 100; // $100/hr
  const laborCost = (record.laborHours || 0) * FIXED_RATE;
  const amount = partsTotal + laborCost;
  const tax = amount * 0.10;
  const totalAmount = amount + tax;

  // Find user (owner of vehicle or appointment)
  let targetUser = null;
  if (record.appointment) {
    const aDoc = await db.collection('appointments').doc(record.appointment).get();
    if (aDoc.exists) {
      targetUser = aDoc.data().user;
    }
  }

  if (!targetUser && record.vehicle) {
    const vDoc = await db.collection('vehicles').doc(record.vehicle).get();
    if (vDoc.exists) {
      targetUser = vDoc.data().user;
    }
  }

  const newInvoice = {
    user: targetUser || null,
    vehicle: record.vehicle || null,
    serviceRecord: serviceRecord,
    amount,
    tax,
    totalAmount,
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const invoiceDocRef = await db.collection('invoices').add(newInvoice);

  // Sync state back to ServiceRecord
  await recordRef.update({
    invoiceGenerated: true,
    updatedAt: new Date().toISOString(),
  });

  if (targetUser) {
    await createNotification(
      targetUser,
      'Invoice Generated',
      `Your final invoice of $${totalAmount.toFixed(2)} is ready for payment.`,
      'Alert'
    );
  }

  const createdDoc = await invoiceDocRef.get();
  const populated = await populateInvoice(docWithId(createdDoc));

  res.status(201).json(populated);
});

// @desc    Get user invoices
// @route   GET /api/invoices/myinvoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('invoices')
    .where('user', '==', req.user._id)
    .get();

  const invoices = docsWithId(snapshot);
  const populated = await Promise.all(invoices.map(populateInvoice));

  res.status(200).json(populated);
});

// @desc    Mark invoice as paid
// @route   PUT /api/invoices/:id/pay
// @access  Private
const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const invoiceRef = db.collection('invoices').doc(req.params.id);
  const invoiceDoc = await invoiceRef.get();

  if (!invoiceDoc.exists) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const invoice = invoiceDoc.data();

  if (invoice.paymentStatus === 'Paid') {
    res.status(400);
    throw new Error('Invoice is already marked as paid');
  }

  const updates = {
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await invoiceRef.update(updates);

  // Sync state to ServiceRecord
  if (invoice.serviceRecord) {
    const recordRef = db.collection('serviceRecords').doc(invoice.serviceRecord);
    const recordDoc = await recordRef.get();
    if (recordDoc.exists) {
      await recordRef.update({
        isPaid: true,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Notification for customer
  if (invoice.user) {
    await createNotification(
      invoice.user,
      'Payment Processed',
      `Thank you! Payment for invoice #${invoiceDoc.id.substring(0, 6)} securely tracked.`,
      'Info'
    );
  }

  // Notification for service center staff
  try {
    const staffSnapshot = await db.collection('users').where('role', '==', 'ServiceCenter').get();
    const staffDocs = docsWithId(staffSnapshot);
    await Promise.all(staffDocs.map(member =>
      createNotification(
        member._id,
        'Payment Received',
        `Invoice #${invoiceDoc.id.substring(0, 6)} has been settled.`,
        'Info'
      )
    ));
  } catch (err) {
    console.error('Failed to notify staff of payment:', err.message);
  }

  const updatedDoc = await invoiceRef.get();
  const populated = await populateInvoice(docWithId(updatedDoc));

  res.status(200).json(populated);
});

export { createInvoice, getAllInvoices, getMyInvoices, markInvoiceAsPaid };
