import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: [
      {
        type: String,
      },
    ],
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'Off'],
      default: 'Available',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Technician = mongoose.model('Technician', technicianSchema);
export default Technician;
