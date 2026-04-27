import mongoose from 'mongoose';

const serviceRecordSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle',
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['Maintenance', 'Diagnostic', 'Repair'],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Technician Assigned", "Repair In Progress", "Completed", "Rejected", "Cancelled"],
      default: 'Technician Assigned',
    },
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    partsUsed: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    laborHours: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRecord = mongoose.model('ServiceRecord', serviceRecordSchema);
export default ServiceRecord;
