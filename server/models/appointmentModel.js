import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['Maintenance', 'Diagnostic', 'Repair'],
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Technician Assigned", "Repair In Progress", "Completed", "Rejected", "Cancelled"],
      default: 'Pending Approval',
    },
    rejectionReason: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    rejectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
