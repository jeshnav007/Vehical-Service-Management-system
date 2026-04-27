import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const seedMechanic = async () => {
  try {
    const userExists = await User.findOne({ email: 'mechanic@vsm.com' });
    if (!userExists) {
      await User.create({
        name: 'Master Technician',
        email: 'mechanic@vsm.com',
        password: 'MechanicPassword123!',
        phone: '555-555-5555',
        role: 'Technician',
      });
      console.log('Technician Database Seeded: mechanic@vsm.com');
    } else {
      console.log('Technician already exists');
    }
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedMechanic();
