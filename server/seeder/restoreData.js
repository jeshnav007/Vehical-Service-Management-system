import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Appointment from '../models/appointmentModel.js';
import ServiceRecord from '../models/serviceRecordModel.js';
import Invoice from '../models/invoiceModel.js';
import Notification from '../models/notificationModel.js';

dotenv.config();

const restoreData = async () => {
  try {
    await connectDB();

    console.log('--- Starting Backend Restoration ---');

    // 1. Ensure Required Users Exist
    console.log('Verifying users...');
    
    let customer = await User.findOne({ role: 'Customer' });
    if (!customer) {
      customer = await User.create({
        name: 'Default Customer',
        email: 'customer@vsm.com',
        password: 'CustomerPassword123!',
        phone: '123-456-7890',
        role: 'Customer',
        address: '123 Main St, Tech City',
      });
      console.log('Created Default Customer: customer@vsm.com');
    }

    let technician = await User.findOne({ role: 'Technician' });
    if (!technician) {
      technician = await User.create({
        name: 'Default Technician',
        email: 'tech@vsm.com',
        password: 'TechPassword123!',
        phone: '987-654-3210',
        role: 'Technician',
      });
      console.log('Created Default Technician: tech@vsm.com');
    }

    let serviceCenter = await User.findOne({ role: 'ServiceCenter' });
    if (!serviceCenter) {
      serviceCenter = await User.create({
        name: 'Default Service Center',
        email: 'servicecenter@vsm.com',
        password: 'ServiceCenterPassword123!',
        phone: '555-010-9999',
        role: 'ServiceCenter',
      });
      console.log('Created Default ServiceCenter: servicecenter@vsm.com');
    }

    // 2. Clear existing related data (optional, but requested "DO NOT duplicate records")
    // Use checks before insert instead.
    
    // 3. Create Vehicle
    let vehicle = await Vehicle.findOne({ user: customer._id });
    if (!vehicle) {
      vehicle = await Vehicle.create({
        user: customer._id,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'VSM-RESTORE-1',
        vin: 'RESTOREVIN123456',
        mileage: 15000,
      });
      console.log('Created Vehicle: Toyota Camry (VSM-RESTORE-1)');
    }

    // 4. Create Appointment
    let appointment = await Appointment.findOne({ vehicle: vehicle._id, status: 'Approved' });
    if (!appointment) {
      appointment = await Appointment.create({
        user: customer._id,
        vehicle: vehicle._id,
        date: new Date(),
        time: '10:00 AM',
        serviceType: 'Maintenance',
        status: 'Approved',
        notes: 'Restoration seed appointment.',
      });
      console.log('Created Appointment (Status: Approved)');
    }

    // 5. Create ServiceRecord
    let serviceRecord = await ServiceRecord.findOne({ appointment: appointment._id });
    if (!serviceRecord) {
      serviceRecord = await ServiceRecord.create({
        vehicle: vehicle._id,
        appointment: appointment._id,
        technician: technician._id,
        serviceType: 'Maintenance',
        description: 'Initial restoration service record.',
        status: 'Completed',
        partsUsed: [
          { name: 'Oil Filter', quantity: 1, price: 15 },
          { name: 'Synthetic Oil', quantity: 5, price: 10 },
        ],
        laborHours: 1.5,
        totalCost: 80, // (15+50) + (1.5 * default rate)
        completedAt: new Date(),
      });
      console.log('Created ServiceRecord (Status: Completed)');
    }

    // 6. Create Invoice
    let invoice = await Invoice.findOne({ serviceRecord: serviceRecord._id });
    if (!invoice) {
        // Calculate amount
        const partsTotal = serviceRecord.partsUsed.reduce((acc, part) => acc + (part.price * part.quantity), 0);
        const laborCost = serviceRecord.laborHours * 100; // Assuming 100/hr fixed rate
        const amount = partsTotal + laborCost;
        const tax = amount * 0.1;
        const totalAmount = amount + tax;

      invoice = await Invoice.create({
        user: customer._id,
        vehicle: vehicle._id,
        serviceRecord: serviceRecord._id,
        amount,
        tax,
        totalAmount,
        paymentStatus: 'Pending',
      });
      console.log('Created Invoice (Payment Status: Pending)');
    }

    // 7. Create Notification
    await Notification.create({
      user: customer._id,
      title: 'Database Restored',
      message: 'Your vehicle service data has been successfully restored.',
      type: 'Alert',
    });
    console.log('Created Restoration Notification');

    console.log('--- Restoration Completed Successfully ---');
    process.exit();
  } catch (error) {
    console.error(`Restoration Failed: ${error.message}`);
    process.exit(1);
  }
};

restoreData();
