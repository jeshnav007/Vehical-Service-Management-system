import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

// Helper to populate vehicle, appointment, and technician
const populateServiceRecord = async (record) => {
  if (!record) return null;
  const rec = { ...record };

  // Populate vehicle
  if (rec.vehicle && typeof rec.vehicle === 'string') {
    const vDoc = await db.collection('vehicles').doc(rec.vehicle).get();
    if (vDoc.exists) {
      rec.vehicle = docWithId(vDoc);
    }
  }

  // Populate technician
  if (rec.technician && typeof rec.technician === 'string') {
    const tDoc = await db.collection('users').doc(rec.technician).get();
    if (tDoc.exists) {
      const tData = tDoc.data();
      rec.technician = {
        _id: tDoc.id,
        id: tDoc.id,
        name: tData.name || '',
        email: tData.email || '',
        phone: tData.phone || '',
      };
    }
  }

  // Populate appointment
  if (rec.appointment && typeof rec.appointment === 'string') {
    const aDoc = await db.collection('appointments').doc(rec.appointment).get();
    if (aDoc.exists) {
      const aData = aDoc.data();
      let userObj = aData.user;
      if (typeof aData.user === 'string') {
        const uDoc = await db.collection('users').doc(aData.user).get();
        if (uDoc.exists) {
          const uData = uDoc.data();
          userObj = {
            _id: uDoc.id,
            id: uDoc.id,
            name: uData.name || '',
            email: uData.email || '',
            phone: uData.phone || '',
          };
        }
      }
      rec.appointment = {
        _id: aDoc.id,
        id: aDoc.id,
        ...aData,
        user: userObj,
      };
    }
  }

  return rec;
};

// @desc    Create a new service record
// @route   POST /api/servicerecords
// @access  Private/Staff
const createServiceRecord = asyncHandler(async (req, res) => {
  const { vehicle, appointment, technician, serviceType, description } = req.body;

  if (!vehicle || !serviceType) {
    res.status(400);
    throw new Error('Vehicle and service type are required');
  }

  const newRecord = {
    vehicle,
    appointment: appointment || null,
    technician: technician || null,
    serviceType,
    description: description || '',
    status: 'Technician Assigned',
    invoiceGenerated: false,
    isPaid: false,
    partsUsed: [],
    laborHours: 0,
    totalCost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (appointment) {
    const apptRef = db.collection('appointments').doc(appointment);
    const apptDoc = await apptRef.get();

    if (!apptDoc.exists) {
      res.status(404);
      throw new Error('Appointment bound schema failed.');
    }

    const apptData = apptDoc.data();

    // STRICT VALIDATION
    if (apptData.status !== 'Approved') {
      res.status(400);
      throw new Error('Technicians can ONLY be explicitly assigned after system approval state passes.');
    }

    await apptRef.update({
      status: 'Technician Assigned',
      updatedAt: new Date().toISOString(),
    });

    await createNotification(
      apptData.user,
      'Mechanic Assigned',
      `A Master Technician has formally been assigned to your vehicle globally!`,
      'Info'
    );
  }

  const docRef = await db.collection('serviceRecords').add(newRecord);
  const createdDoc = await docRef.get();

  res.status(201).json(docWithId(createdDoc));
});

// @desc    Update service record status
// @route   PUT /api/servicerecords/:id/status
// @access  Private/Technician
const updateServiceRecordStatus = asyncHandler(async (req, res) => {
  const { status, partsUsed, laborHours } = req.body;
  const recordRef = db.collection('serviceRecords').doc(req.params.id);
  const recordDoc = await recordRef.get();

  if (!recordDoc.exists) {
    res.status(404);
    throw new Error('Service record not found');
  }

  const record = recordDoc.data();

  const validStatuses = [
    'Pending Approval',
    'Approved',
    'Technician Assigned',
    'Repair In Progress',
    'Completed',
    'Rejected',
    'Cancelled',
  ];

  if (status && !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updates = {
    updatedAt: new Date().toISOString(),
  };

  if (status) updates.status = status;
  if (partsUsed) updates.partsUsed = partsUsed;
  if (laborHours !== undefined) updates.laborHours = Number(laborHours) || 0;

  if (status === 'Completed') {
    updates.completedAt = new Date().toISOString();
  }

  await recordRef.update(updates);

  // Sync Appointment status to match ServiceRecord
  if (record.appointment && status) {
    const apptRef = db.collection('appointments').doc(record.appointment);
    const apptDoc = await apptRef.get();
    if (apptDoc.exists) {
      await apptRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Trigger Notification to vehicle owner
  if (status && record.vehicle) {
    try {
      const vDoc = await db.collection('vehicles').doc(record.vehicle).get();
      if (vDoc.exists && vDoc.data().user) {
        await createNotification(
          vDoc.data().user,
          'Repair Status Updated',
          `Your vehicle service is now marked as: ${status}`,
          status === 'Completed' ? 'Alert' : 'Info'
        );
      }
    } catch (e) {
      console.error('Notification trigger error:', e.message);
    }
  }

  const updatedDoc = await recordRef.get();
  res.status(200).json(docWithId(updatedDoc));
});

// @desc    Get technician's assigned service records
// @route   GET /api/servicerecords/myjobs
// @access  Private/Technician
const getMyTasks = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('serviceRecords')
    .where('technician', '==', req.user._id)
    .get();

  const records = docsWithId(snapshot);
  const populated = await Promise.all(records.map(populateServiceRecord));

  res.status(200).json(populated);
});

// @desc    Get all service records
// @route   GET /api/servicerecords
// @access  Private/Admin/Staff
const getServiceRecords = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('serviceRecords').get();
  const records = docsWithId(snapshot);
  const populated = await Promise.all(records.map(populateServiceRecord));

  res.status(200).json(populated);
});

// @desc    Delete service record
// @route   DELETE /api/servicerecords/:id
// @access  Private/Admin
const deleteServiceRecord = asyncHandler(async (req, res) => {
  const recordRef = db.collection('serviceRecords').doc(req.params.id);
  const recordDoc = await recordRef.get();

  if (recordDoc.exists) {
    await recordRef.delete();
    res.status(200).json({ message: 'Service record removed' });
  } else {
    res.status(404);
    throw new Error('Service record not found');
  }
});

// @desc    Get user's service records via their vehicles
// @route   GET /api/servicerecords/myservices
// @access  Private
const getMyServiceRecords = asyncHandler(async (req, res) => {
  // 1. Get user's vehicles
  const vehiclesSnapshot = await db.collection('vehicles')
    .where('user', '==', req.user._id)
    .get();

  if (vehiclesSnapshot.empty) {
    return res.status(200).json([]);
  }

  const vehicleIds = vehiclesSnapshot.docs.map(doc => doc.id);

  // Firestore 'in' query supports up to 30 items
  let records = [];
  for (let i = 0; i < vehicleIds.length; i += 30) {
    const chunk = vehicleIds.slice(i, i + 30);
    const chunkSnapshot = await db.collection('serviceRecords')
      .where('vehicle', 'in', chunk)
      .get();
    records = records.concat(docsWithId(chunkSnapshot));
  }

  // Sort descending by createdAt
  records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const populated = await Promise.all(records.map(populateServiceRecord));
  res.status(200).json(populated);
});

export {
  createServiceRecord,
  updateServiceRecordStatus,
  getMyTasks,
  getServiceRecords,
  deleteServiceRecord,
  getMyServiceRecords,
};
