import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

// Helper to populate vehicle and user on appointment objects
const populateAppointment = async (appointment) => {
  if (!appointment) return null;
  const appt = { ...appointment };

  // Populate vehicle
  if (appt.vehicle && typeof appt.vehicle === 'string') {
    const vDoc = await db.collection('vehicles').doc(appt.vehicle).get();
    if (vDoc.exists) {
      appt.vehicle = docWithId(vDoc);
    }
  }

  // Populate user
  if (appt.user && typeof appt.user === 'string') {
    const uDoc = await db.collection('users').doc(appt.user).get();
    if (uDoc.exists) {
      const uData = uDoc.data();
      appt.user = {
        _id: uDoc.id,
        id: uDoc.id,
        name: uData.name || '',
        email: uData.email || '',
        phone: uData.phone || '',
      };
    }
  }

  return appt;
};

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { vehicle, date, time, serviceType, notes } = req.body;

  if (!vehicle || !date || !serviceType) {
    res.status(400);
    throw new Error('Please provide vehicle, date, and service type');
  }

  const newAppt = {
    user: req.user._id,
    vehicle,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    time: time || '10:00 AM',
    serviceType,
    notes: notes || '',
    status: 'Pending Approval',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('appointments').add(newAppt);
  const createdDoc = await docRef.get();

  res.status(201).json(docWithId(createdDoc));
});

// @desc    Approve an appointment
// @route   PUT /api/appointments/:id/approve
// @access  Private/ServiceCenter
const approveAppointment = asyncHandler(async (req, res) => {
  const apptRef = db.collection('appointments').doc(req.params.id);
  const apptDoc = await apptRef.get();

  if (!apptDoc.exists) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const apptData = apptDoc.data();

  if (apptData.status !== 'Pending Approval') {
    res.status(400);
    throw new Error(`Cannot approve appointment in '${apptData.status}' state`);
  }

  const updates = {
    status: 'Approved',
    updatedAt: new Date().toISOString(),
  };

  await apptRef.update(updates);

  await createNotification(
    apptData.user,
    'Appointment Approved',
    `Your upcoming ${apptData.serviceType} service request has been formalized and approved.`,
    'Info'
  );

  const updatedDoc = await apptRef.get();
  const populated = await populateAppointment(docWithId(updatedDoc));

  res.status(200).json(populated);
});

// @desc    Get logged in user's appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('appointments')
    .where('user', '==', req.user._id)
    .get();

  const appointments = docsWithId(snapshot);
  const populated = await Promise.all(appointments.map(populateAppointment));

  res.status(200).json(populated);
});

// @desc    Get all appointments (Admin/Staff)
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('appointments').get();
  const appointments = docsWithId(snapshot);
  const populated = await Promise.all(appointments.map(populateAppointment));

  res.status(200).json(populated);
});

// @desc    Reject an appointment
// @route   PUT /api/appointments/:id/reject
// @access  Private/ServiceCenter
const rejectAppointment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const apptRef = db.collection('appointments').doc(req.params.id);
  const apptDoc = await apptRef.get();

  if (!apptDoc.exists) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const apptData = apptDoc.data();

  const allowedForRejection = ['Pending Approval', 'Approved'];
  if (!allowedForRejection.includes(apptData.status)) {
    res.status(400);
    throw new Error(`Rejection blocked: Appointment is already in '${apptData.status}' state`);
  }

  const updates = {
    status: 'Rejected',
    rejectionReason: rejectionReason || 'No reason provided',
    rejectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await apptRef.update(updates);

  await createNotification(
    apptData.user,
    'Appointment Rejected',
    `Your service request for ${apptData.serviceType} has been rejected. Reason: ${updates.rejectionReason}`,
    'Alert'
  );

  const updatedDoc = await apptRef.get();
  res.status(200).json(docWithId(updatedDoc));
});

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const apptRef = db.collection('appointments').doc(req.params.id);
  const apptDoc = await apptRef.get();

  if (!apptDoc.exists) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const apptData = apptDoc.data();

  if (apptData.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to cancel this appointment');
  }

  const allowedStatuses = ['Pending Approval', 'Approved', 'Technician Assigned'];
  if (!allowedStatuses.includes(apptData.status)) {
    res.status(400);
    throw new Error(`Cancellation blocked: Repair has already started or appointment is in '${apptData.status}' status.`);
  }

  const updates = {
    status: 'Cancelled',
    cancellationReason: cancellationReason || 'Cancelled by customer',
    cancelledAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await apptRef.update(updates);

  // Notify Service Center staff
  try {
    const staffSnapshot = await db.collection('users').where('role', '==', 'ServiceCenter').limit(1).get();
    if (!staffSnapshot.empty) {
      await createNotification(
        staffSnapshot.docs[0].id,
        'Appointment Cancelled',
        `Customer cancelled appointment #${apptDoc.id.slice(-6)}`,
        'Alert'
      );
    }
  } catch (err) {
    console.error('Failed to notify staff:', err.message);
  }

  const updatedDoc = await apptRef.get();
  res.status(200).json(docWithId(updatedDoc));
});

export {
  createAppointment,
  approveAppointment,
  getMyAppointments,
  getAppointments,
  rejectAppointment,
  cancelAppointment,
};
