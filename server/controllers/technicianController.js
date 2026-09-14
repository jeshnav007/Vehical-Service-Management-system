import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Private/Staff
const getTechnicians = asyncHandler(async (req, res) => {
  // First, check technicians collection
  const techSnapshot = await db.collection('technicians').get();
  let technicians = docsWithId(techSnapshot);

  // If technicians collection has entries, populate their user details
  if (technicians.length > 0) {
    const populated = await Promise.all(
      technicians.map(async (tech) => {
        let userObj = null;
        if (tech.user) {
          const uDoc = await db.collection('users').doc(tech.user).get();
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
        return {
          ...tech,
          user: userObj,
        };
      })
    );
    return res.status(200).json(populated);
  }

  // Fallback: fetch users directly with role 'Technician'
  const userSnapshot = await db.collection('users')
    .where('role', '==', 'Technician')
    .where('isActive', '!=', false)
    .get();

  const userTechs = docsWithId(userSnapshot).map(u => ({
    _id: u._id,
    id: u._id,
    user: {
      _id: u._id,
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
    },
    specialization: ['General Service'],
    availabilityStatus: 'Available',
    rating: 5,
    numReviews: 0,
  }));

  res.status(200).json(userTechs);
});

export { getTechnicians };
