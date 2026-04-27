import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Appointment from '../models/appointmentModel.js';
import ServiceRecord from '../models/serviceRecordModel.js';

dotenv.config();
connectDB();

const runMigration = async () => {
  try {
    console.log('Initiating Database Backup Operations...');
    
    // 1. Data Backup via raw Mongo aggregates mapping directly into cloned collections
    await Appointment.aggregate([{ $match: {} }, { $out: "appointments_legacy_backup" }]);
    await ServiceRecord.aggregate([{ $match: {} }, { $out: "servicerecords_legacy_backup" }]);
    console.log('✔ Backups secured structurally: [appointments_legacy_backup, servicerecords_legacy_backup]');

    console.log('\nMigrating Appointment Legacy Schema constraints...');
    // Map: Pending -> Booked
    let res = await Appointment.updateMany({ status: 'Pending' }, { $set: { status: 'Booked' } });
    console.log(`- Converted ${res.modifiedCount} Pending -> Booked`);
    // Map: Confirmed -> Vehicle Received
    res = await Appointment.updateMany({ status: 'Confirmed' }, { $set: { status: 'Vehicle Received' } });
    console.log(`- Converted ${res.modifiedCount} Confirmed -> Vehicle Received`);
    // Map: In Progress -> Repair In Progress
    res = await Appointment.updateMany({ status: 'In Progress' }, { $set: { status: 'Repair In Progress' } });
    console.log(`- Converted ${res.modifiedCount} In Progress -> Repair In Progress`);
    // Fallback: Cancelled -> Completed (Since the new Enum entirely removes cancellations)
    res = await Appointment.updateMany({ status: 'Cancelled' }, { $set: { status: 'Completed' } });
    console.log(`- Converted ${res.modifiedCount} Cancelled -> Completed (Constraint fallback)`);

    console.log('\nMigrating ServiceRecord Legacy Schema constraints...');
    // Map: Pending -> Booked
    res = await ServiceRecord.updateMany({ status: 'Pending' }, { $set: { status: 'Booked' } });
    console.log(`- Converted ${res.modifiedCount} Pending -> Booked`);
    // Map: Diagnosing -> Inspection Completed
    res = await ServiceRecord.updateMany({ status: 'Diagnosing' }, { $set: { status: 'Inspection Completed' } });
    console.log(`- Converted ${res.modifiedCount} Diagnosing -> Inspection Completed`);
    // Map: Repairing -> Repair In Progress
    res = await ServiceRecord.updateMany({ status: 'Repairing' }, { $set: { status: 'Repair In Progress' } });
    console.log(`- Converted ${res.modifiedCount} Repairing -> Repair In Progress`);
    // Map: Testing -> Repair In Progress
    res = await ServiceRecord.updateMany({ status: 'Testing' }, { $set: { status: 'Repair In Progress' } });
    console.log(`- Converted ${res.modifiedCount} Testing -> Repair In Progress (Constraint fallback)`);

    console.log('\n✔ Phase 2 Migration Execution Successful! Legacy data structures overwritten globally.');
    process.exit();
  } catch (error) {
    console.error(`Migration Error: ${error.message}`);
    process.exit(1);
  }
};

runMigration();
