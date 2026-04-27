import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';
import { ROLES } from './roles.js';

dotenv.config();
connectDB();

const seedStaffToServiceCenter = async () => {
  try {
    const result = await User.updateMany(
      { role: 'Staff' },
      { $set: { role: ROLES.SERVICE_CENTER } }
    );
    console.log(`Migration Complete: Converted ${result.modifiedCount} legacy Staff entries.`);

    const userExists = await User.findOne({ email: 'service@vsm.com' });
    if (!userExists) {
      await User.create({
        name: 'Master Service Center',
        email: 'service@vsm.com',
        password: 'ServicePassword123!',
        phone: '111-222-3333',
        role: ROLES.SERVICE_CENTER,
      });
      console.log('Fixed ServiceCenter Profile generated exclusively: service@vsm.com');
    } else {
      console.log('Central ServiceCenter instance already physically configured.');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedStaffToServiceCenter();
