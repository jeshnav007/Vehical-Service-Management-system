import asyncHandler from 'express-async-handler';
import ServiceRecord from '../models/serviceRecordModel.js';
import Appointment from '../models/appointmentModel.js';
import Vehicle from '../models/vehicleModel.js';
import { createNotification } from './notificationController.js';

// @desc    Create a new service record
// @route   POST /api/servicerecords
// @access  Private/Staff
const createServiceRecord = asyncHandler(async (req, res) => {
  const { vehicle, appointment, technician, serviceType, description } = req.body;

  const record = await ServiceRecord.create({
    vehicle,
    appointment,
    technician,
    serviceType,
    description,
  });

  if (appointment) {
    const appt = await Appointment.findById(appointment);
    if (!appt) {
      res.status(404);
      throw new Error('Appointment bound schema failed.');
    }
    
    // STRICT VALIDATION
    if (appt.status !== 'Approved') {
      res.status(400);
      throw new Error('Technicians can ONLY be explicitly assigned after system approval state passes.');
    }

    appt.status = 'Technician Assigned';
    await appt.save();
    
    await createNotification(
      appt.user,
      'Mechanic Assigned',
      `A Master Technician has formally been assigned to your vehicle globally!`,
      'Info'
    );
  }

  res.status(201).json(record);
});

// @desc    Update service record status
// @route   PUT /api/servicerecords/:id/status
// @access  Private/Technician
const updateServiceRecordStatus = asyncHandler(async (req, res) => {
  const { status, partsUsed, laborHours } = req.body;
  const record = await ServiceRecord.findById(req.params.id);

  if (record) {
    // CRITICAL: Validate status update
    const validStatuses = ["Pending Approval", "Approved", "Technician Assigned", "Repair In Progress", "Completed", "Rejected", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    console.log(`🔷 UPDATING SERVICE RECORD ${req.params.id}`);
    console.log(`   Current status: ${record.status}`);
    console.log(`   New status: ${status || record.status}`);

    record.status = status || record.status;
    if (partsUsed) record.partsUsed = partsUsed;
    if (laborHours) record.laborHours = laborHours;

    if (status === 'Completed') {
      record.completedAt = Date.now();
      console.log(`✅ SERVICE MARKED AS COMPLETED`);
    }

    const updatedRecord = await record.save();

    // ⭐ CRITICAL: Sync Appointment status to match ServiceRecord
    if (record.appointment && status) {
      const appt = await Appointment.findById(record.appointment);
      if (appt) {
        console.log(`   Updating appointment ${record.appointment}:`);
        console.log(`   Old appointment status: ${appt.status}`);
        appt.status = status;
        await appt.save();
        console.log(`   New appointment status: ${appt.status}`);
      }
    }

    // Trigger Notification natively looking up the Vehicle Owner
    if (status) {
      const vData = await Vehicle.findById(record.vehicle);
      if (vData) {
        await createNotification(
          vData.user,
          'Repair Status Updated',
          `Your vehicle service is now marked as: ${status}`,
          status === 'Completed' ? 'Alert' : 'Info'
        );
      }
    }

    res.status(200).json(updatedRecord);
  } else {
    res.status(404);
    throw new Error('Service record not found');
  }
});

// @desc    Get technician's assigned service records
// @route   GET /api/servicerecords/myjobs
// @access  Private/Technician
const getMyTasks = asyncHandler(async (req, res) => {
  const records = await ServiceRecord.find({ technician: req.user._id })
    .populate('vehicle', 'make model licensePlate')
    .populate({
      path: 'appointment',
      populate: { path: 'user', select: 'name email phone' }
    });
  res.status(200).json(records);
});

// @desc    Get all service records
// @route   GET /api/servicerecords
// @access  Private/Admin/Staff
const getServiceRecords = asyncHandler(async (req, res) => {
  const records = await ServiceRecord.find({})
    .populate('vehicle', 'make model licensePlate')
    .populate('technician', 'name');
  res.status(200).json(records);
});

// @desc    Delete service record
// @route   DELETE /api/servicerecords/:id
// @access  Private/Admin
const deleteServiceRecord = asyncHandler(async (req, res) => {
  const record = await ServiceRecord.findById(req.params.id);
  if (record) {
    await record.deleteOne();
    res.status(200).json({ message: 'Service record removed' });
  } else {
    res.status(404);
    throw new Error('Service record not found');
  }
});

// @desc    Get user's service records securely via vehicle possession maps
// @route   GET /api/servicerecords/myservices
// @access  Private
const getMyServiceRecords = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.user._id });
  const vehicleIds = vehicles.map(v => v._id);
  
  const records = await ServiceRecord.find({ vehicle: { $in: vehicleIds } })
    .populate('vehicle', 'make model licensePlate')
    .sort('-createdAt');
    
  res.status(200).json(records);
});

export { createServiceRecord, updateServiceRecordStatus, getMyTasks, getServiceRecords, deleteServiceRecord, getMyServiceRecords };
