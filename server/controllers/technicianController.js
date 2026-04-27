import asyncHandler from 'express-async-handler';
import Technician from '../models/technicianModel.js';

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Private/Staff
const getTechnicians = asyncHandler(async (req, res) => {
  const technicians = await Technician.find({}).populate('user', 'name email phone');
  res.status(200).json(technicians);
});

export { getTechnicians };
