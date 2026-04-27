import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to MongoDB
const connectDatabse = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedServiceCenter = async () => {
  try {
    // Check if ServiceCenter user already exists
    const serviceCenterExists = await User.findOne({ role: 'ServiceCenter' });

    if (serviceCenterExists) {
      console.log('ServiceCenter user already exists!');
      console.log(`Email: ${serviceCenterExists.email}`);
      process.exit();
    }

    // Create ServiceCenter user with plain password (model will hash it)
    const serviceCenterUser = await User.create({
      name: 'Service Desk',
      email: 'service@vsm.com',
      password: 'ServiceCenter@123',
      role: 'ServiceCenter',
      phone: '0000000000',
      address: 'Service Center',
    });

    console.log('✓ ServiceCenter User Seeded Successfully!');
    console.log(`  Name: ${serviceCenterUser.name}`);
    console.log(`  Email: ${serviceCenterUser.email}`);
    console.log(`  Role: ${serviceCenterUser.role}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run seeder
connectDatabse();
setTimeout(() => seedServiceCenter(), 1000);
