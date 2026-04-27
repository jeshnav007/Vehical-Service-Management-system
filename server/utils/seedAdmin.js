import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@vsm.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@vsm.com',
      password: 'AdminPassword123!',
      role: 'Admin',
      phone: '0000000000',
      address: 'VSM Headquarters',
    });

    console.log(`Admin User Seeded Successfully: ${adminUser.email}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
