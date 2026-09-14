import asyncHandler from 'express-async-handler';
import { auth, db } from '../config/firebase.js';

// Helper to batch delete documents from a query snapshot
const batchDeleteQuery = async (query) => {
  const snapshot = await query.get();
  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

// @desc    Get dashboard metrics globally
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  try {
    const [
      allUsersSnap,
      vehiclesSnap,
      allApptsSnap,
      completedServicesSnap,
      allServicesSnap,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('vehicles').get(),
      db.collection('appointments').get(),
      db.collection('serviceRecords').where('status', '==', 'Completed').get(),
      db.collection('serviceRecords').get(),
    ]);

    const allUsers = allUsersSnap.docs.map(doc => doc.data());
    const activeUsers = allUsers.filter(u => u.isActive !== false).length;
    const lifetimeUsers = allUsersSnap.size;
    const activeVehicles = vehiclesSnap.size;
    
    const allAppts = allApptsSnap.docs.map(doc => doc.data());
    const activeAppointments = allAppts.filter(a => a.status !== 'Cancelled').length;
    
    const completedServices = completedServicesSnap.size;
    const pendingServices = Math.max(0, allServicesSnap.size - completedServices);

    res.status(200).json({
      totalUsers: activeUsers,
      lifetimeUsers,
      totalVehicles: activeVehicles,
      totalAppointments: activeAppointments,
      completedServices,
      pendingServices,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500);
    throw new Error('Failed to retrieve system metrics');
  }
});

// @desc    Cascade Delete User and all related data
// @route   DELETE /api/admin/users/:id/full-delete
// @access  Private/Admin
const fullDeleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    res.status(404);
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  if (userData.role === 'Admin') {
    res.status(400);
    throw new Error('Safety Block: admin records cannot be hard-deleted via this API.');
  }

  // 1. Gather vehicle IDs belonging to this user
  const vehiclesSnap = await db.collection('vehicles').where('user', '==', userId).get();
  const vehicleIds = vehiclesSnap.docs.map(d => d.id);

  // 2. Cascade delete all linked records
  try {
    // Delete user's notifications
    await batchDeleteQuery(db.collection('notifications').where('user', '==', userId));

    // Delete user's appointments
    await batchDeleteQuery(db.collection('appointments').where('user', '==', userId));

    // Delete user's invoices
    await batchDeleteQuery(db.collection('invoices').where('user', '==', userId));

    // Delete service records where user was technician
    await batchDeleteQuery(db.collection('serviceRecords').where('technician', '==', userId));

    // Delete records linked to vehicles
    for (const vId of vehicleIds) {
      await batchDeleteQuery(db.collection('appointments').where('vehicle', '==', vId));
      await batchDeleteQuery(db.collection('serviceRecords').where('vehicle', '==', vId));
      await batchDeleteQuery(db.collection('invoices').where('vehicle', '==', vId));
    }

    // Delete vehicles
    const vBatch = db.batch();
    vehiclesSnap.docs.forEach(d => vBatch.delete(d.ref));
    await vBatch.commit();

    // Delete user doc
    await userRef.delete();

    // Delete user from Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (authErr) {
      console.warn('Firebase Auth user delete notice:', authErr.message);
    }

    res.status(200).json({
      message: 'User and all associated data purged successfully from the system Registry.',
    });
  } catch (err) {
    console.error('Cascading delete error:', err);
    res.status(500);
    throw new Error(`Failed to complete cascading deletion: ${err.message}`);
  }
});

export { getAdminStats, fullDeleteUser };
