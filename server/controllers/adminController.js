import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Appointment from '../models/appointmentModel.js';
import ServiceRecord from '../models/serviceRecordModel.js';
import Invoice from '../models/invoiceModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Get dashboard metrics globally aggregating database payloads
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  // Active statistics for better operational overview
  const activeUsers = await User.countDocuments({ isActive: { $ne: false } });
  const activeVehicles = await Vehicle.countDocuments({}); // Vehicles don't have isActive, they belong to users
  const activeAppointments = await Appointment.countDocuments({ status: { $ne: 'Cancelled' } });
  
  // Lifetime / Archive stats
  const lifetimeUsers = await User.countDocuments({});
  
  const completedServices = await ServiceRecord.countDocuments({ status: 'Completed' });
  const pendingServices = await ServiceRecord.countDocuments({ status: { $ne: 'Completed' } });

  res.status(200).json({
    totalUsers: activeUsers, // Dashboard labels often just say "Total Users"
    lifetimeUsers,
    totalVehicles: activeVehicles,
    totalAppointments: activeAppointments,
    completedServices,
    pendingServices
  });
});

// @desc    Cascade Delete User and all related data
// @route   DELETE /api/admin/users/:id/full-delete
// @access  Private/Admin
const fullDeleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'Admin') {
    res.status(400);
    throw new Error('Safety Block: admin records cannot be hard-deleted via this API.');
  }

  // 1. Gather all vehicle IDs belonging to this user
  const vehicles = await Vehicle.find({ user: userId });
  const vehicleIds = vehicles.map(v => v._id);

  // 2. Multi-collection cascading cleanup
  await Promise.all([
    // Delete Invoices (linked to user or their vehicles)
    Invoice.deleteMany({ $or: [{ user: userId }, { vehicle: { $in: vehicleIds } }] }),

    // Delete Service Records (linked to their vehicles or if THEY were the technician)
    ServiceRecord.deleteMany({ $or: [{ vehicle: { $in: vehicleIds } }, { technician: userId }] }),

    // Delete Appointments
    Appointment.deleteMany({ $or: [{ user: userId }, { vehicle: { $in: vehicleIds } }] }),

    // Delete Notifications
    Notification.deleteMany({ user: userId }),

    // Delete Vehicles
    Vehicle.deleteMany({ user: userId }),

    // Finally, Delete the User
    User.findByIdAndDelete(userId)
  ]);

  res.status(200).json({ 
    message: 'User and all associated data purged successfully from the system Registry.' 
  });
});

export { getAdminStats, fullDeleteUser };
