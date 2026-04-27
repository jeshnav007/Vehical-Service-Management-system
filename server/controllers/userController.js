import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isActive === false) {
      res.status(401);
      throw new Error('Account has been deactivated. Please contact support.');
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
  });

  if (user) {
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
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
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
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
  // Support ?isActive=false to fetch deactivated users for admin panel
  const filter = {};
  if (req.query.isActive === 'false') {
    filter.isActive = false;
  } else {
    // Legacy support: match true OR undefined (new field default logic)
    filter.isActive = { $ne: false };
  }

  const users = await User.find(filter).select('-password');
  res.status(200).json(users);
});

// @desc    Register a new Technician
// @route   POST /api/users/create-technician
// @access  Private/Admin
const createTechnician = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'Technician',
  });

  if (user) {
    res.status(201).json({
       _id: user._id, 
       name: user.name, 
       email: user.email, 
       role: user.role 
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'Admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    
    // Perform Soft Delete
    user.isActive = false;
    await user.save();
    
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
  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = true;
    await user.save();
    res.status(200).json({ message: 'User account restored successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user technicians strictly
// @route   GET /api/users/technicians
// @access  Private/ServiceCenter
const getTechnicianUsers = asyncHandler(async (req, res) => {
  const technicians = await User.find({ role: 'Technician', isActive: { $ne: false } }).select('-password');
  res.status(200).json(technicians);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // If email is being changed, check if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already taken');
      }
      user.email = req.body.email;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    // Security: Prevent Role Modification
    if (req.body.role && req.body.role !== user.role) {
      res.status(400);
      throw new Error('Unauthorized role modification attempt');
    }

    // Handle Password Update with Security Enhancement
    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error('Current password is required to set a new password');
      }

      const isMatch = await user.matchPassword(req.body.oldPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error('Incorrect current password');
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, createTechnician, deleteUser, restoreUser, getTechnicianUsers };
