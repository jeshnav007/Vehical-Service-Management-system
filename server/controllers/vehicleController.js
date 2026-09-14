import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';

// @desc    Register new vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, licensePlate, vin, mileage } = req.body;

  if (!licensePlate) {
    res.status(400);
    throw new Error('License plate is required');
  }

  const normalizedPlate = licensePlate.toUpperCase().trim();

  // Check if vehicle with this license plate already exists
  const existingSnapshot = await db.collection('vehicles')
    .where('licensePlate', '==', normalizedPlate)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    res.status(400);
    throw new Error('Vehicle with this license plate already exists');
  }

  const newVehicle = {
    user: req.user._id,
    make,
    model,
    year: Number(year) || new Date().getFullYear(),
    licensePlate: normalizedPlate,
    vin: vin || '',
    mileage: Number(mileage) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('vehicles').add(newVehicle);
  const createdDoc = await docRef.get();

  res.status(201).json(docWithId(createdDoc));
});

// @desc    Get user vehicles
// @route   GET /api/vehicles/myvehicles
// @access  Private
const getMyVehicles = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('vehicles')
    .where('user', '==', req.user._id)
    .get();

  res.status(200).json(docsWithId(snapshot));
});

export { addVehicle, getMyVehicles };
