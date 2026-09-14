import asyncHandler from 'express-async-handler';
import { auth, db, docWithId, docsWithId } from '../config/firebase.js';

// @desc    Auth user & get profile / verify session
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password, token: bodyToken } = req.body;
  const authHeader = req.headers.authorization;
  const token = bodyToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

  if (token) {
    try {
      const decoded = await auth.verifyIdToken(token);
      const uid = decoded.uid;

      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        res.status(404);
        throw new Error('User profile not found. Please register first.');
      }

      const userData = userDoc.data();
      if (userData.isActive === false) {
        res.status(401);
        throw new Error('Account has been deactivated. Please contact support.');
      }

      return res.status(200).json({
        _id: uid,
        id: uid,
        name: userData.name,
        email: userData.email || decoded.email,
        role: userData.role || 'Customer',
        phone: userData.phone || '',
        token,
      });
    } catch (err) {
      res.status(401);
      throw new Error(err.message || 'Invalid or expired Firebase token');
    }
  }

  // Fallback if client called with email/password directly
  if (email) {
    const usersSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      if (userData.isActive === false) {
        res.status(401);
        throw new Error('Account has been deactivated. Please contact support.');
      }
      return res.status(200).json({
        _id: userDoc.id,
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        message: 'Authenticated via Firebase',
      });
    }
  }

  res.status(400);
  throw new Error('Please provide email or valid Firebase ID token');
});

// @desc    Register a new user / create Firestore profile
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  let uid;
  let token;

  // Check if caller already has Firebase ID token (from frontend client SDK)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = await auth.verifyIdToken(token);
      uid = decoded.uid;
    } catch (e) {
      // Continue to fallback
    }
  }

  // If no UID yet, create user in Firebase Auth via Admin SDK
  if (!uid) {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phone && phone.startsWith('+') ? phone : undefined,
      });
      uid = userRecord.uid;
    } catch (err) {
      res.status(400);
      throw new Error(err.message || 'Failed to create user in Firebase Auth');
    }
  }

  // Check if profile document already exists in Firestore
  const userRef = db.collection('users').doc(uid);
  const existingDoc = await userRef.get();

  if (existingDoc.exists) {
    const existingData = existingDoc.data();
    return res.status(200).json({
      _id: uid,
      id: uid,
      name: existingData.name,
      email: existingData.email,
      role: existingData.role,
      phone: existingData.phone,
      token: token || '',
    });
  }

  // Ensure unique email check in Firestore
  if (email) {
    const emailCheck = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (!emailCheck.empty && emailCheck.docs[0].id !== uid) {
      res.status(400);
      throw new Error('User with this email already exists');
    }
  }

  // Create profile in Firestore
  const newProfile = {
    name: name || 'VSM User',
    email: email ? email.toLowerCase() : '',
    phone: phone || '',
    address: address || '',
    role: 'Customer', // Default role for public registration
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await userRef.set(newProfile);

  res.status(201).json({
    _id: uid,
    id: uid,
    ...newProfile,
    token: token || '',
  });
});

// @desc    Logout user / clear session
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user._id).get();

  if (userDoc.exists) {
    const user = docWithId(userDoc);
    res.status(200).json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  let query = db.collection('users');

  if (req.query.isActive === 'false') {
    query = query.where('isActive', '==', false);
  } else {
    // Default active users
    query = query.where('isActive', '!=', false);
  }

  const snapshot = await query.get();
  const users = docsWithId(snapshot).map((u) => {
    const { password, ...safeUser } = u;
    return safeUser;
  });

  res.status(200).json(users);
});

// @desc    Register a new Technician
// @route   POST /api/users/create-technician
// @access  Private/Admin
const createTechnician = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // 1. Create in Firebase Authentication
  let userRecord;
  try {
    userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
  } catch (authErr) {
    if (authErr.code === 'auth/email-already-exists') {
      res.status(400);
      throw new Error('User with this email already exists in Firebase Auth');
    }
    res.status(400);
    throw new Error(authErr.message || 'Failed to create technician in Firebase Auth');
  }

  const uid = userRecord.uid;

  // 2. Create in Firestore users collection
  const techUser = {
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    role: 'Technician',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.collection('users').doc(uid).set(techUser);

  // 3. Create technician registry entry
  const techDoc = {
    user: uid,
    employeeId: `TECH-${Math.floor(1000 + Math.random() * 9000)}`,
    specialization: ['General Service', 'Maintenance'],
    availabilityStatus: 'Available',
    rating: 5,
    numReviews: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.collection('technicians').doc(uid).set(techDoc);

  res.status(201).json({
    _id: uid,
    id: uid,
    name,
    email,
    role: 'Technician',
  });
});

// @desc    Deactivate user (Soft Delete)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const userRef = db.collection('users').doc(req.params.id);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const user = userDoc.data();
    if (user.role === 'Admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }

    await userRef.update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: 'User deactivated successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Restore deactivated user
// @route   PUT /api/users/:id/restore
// @access  Private/Admin
const restoreUser = asyncHandler(async (req, res) => {
  const userRef = db.collection('users').doc(req.params.id);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    await userRef.update({
      isActive: true,
      updatedAt: new Date().toISOString(),
    });
    res.status(200).json({ message: 'User account restored successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get technician users strictly
// @route   GET /api/users/technicians
// @access  Private/ServiceCenter
const getTechnicianUsers = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('users').get();

  const technicians = docsWithId(snapshot)
    .filter(t => t.isActive !== false && t.role && t.role.toLowerCase() === 'technician')
    .map(t => {
      const { password, ...safeTech } = t;
      return safeTech;
    });

  res.status(200).json(technicians);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const userRef = db.collection('users').doc(req.user._id);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const user = userDoc.data();

    // Security check: Prevent client from modifying their role
    if (req.body.role && req.body.role !== user.role) {
      res.status(400);
      throw new Error('Unauthorized role modification attempt');
    }

    const updates = {
      name: req.body.name || user.name,
      phone: req.body.phone !== undefined ? req.body.phone : user.phone,
      address: req.body.address !== undefined ? req.body.address : user.address,
      updatedAt: new Date().toISOString(),
    };

    // If password update requested, update via Firebase Auth
    if (req.body.password) {
      try {
        await auth.updateUser(req.user._id, { password: req.body.password });
      } catch (err) {
        res.status(400);
        throw new Error(`Password update failed: ${err.message}`);
      }
    }

    await userRef.update(updates);

    const updatedDoc = await userRef.get();
    const updatedUser = docWithId(updatedDoc);

    res.status(200).json({
      _id: updatedUser._id,
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  createTechnician,
  deleteUser,
  restoreUser,
  getTechnicianUsers,
};
