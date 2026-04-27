import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice.js';
import vehicleReducer from './slices/vehicleSlice.js';
import appointmentReducer from './slices/appointmentSlice.js';
import serviceRecordReducer from './slices/serviceRecordSlice.js';
import invoiceReducer from './slices/invoiceSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    appointments: appointmentReducer,
    serviceRecords: serviceRecordReducer,
    invoices: invoiceReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
