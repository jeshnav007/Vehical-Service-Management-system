import asyncHandler from 'express-async-handler';
import Vehicle from '../models/vehicleModel.js';

// @desc    Register new vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, licensePlate, vin, mileage } = req.body;

  const vehicleExists = await Vehicle.findOne({ licensePlate });

  if (vehicleExists) {
    res.status(400);
    throw new Error('Vehicle with this license plate already exists');
  }

  const vehicle = await Vehicle.create({
    user: req.user._id,
    make,
    model,
    year,
    licensePlate,
    vin,
    mileage,
  });

  res.status(201).json(vehicle);
});

// @desc    Get user vehicles
// @route   GET /api/vehicles/myvehicles
// @access  Private
const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.user._id });
  res.status(200).json(vehicles);
});

export { addVehicle, getMyVehicles };
