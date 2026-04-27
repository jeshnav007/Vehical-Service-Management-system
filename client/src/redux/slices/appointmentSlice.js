import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { APPOINTMENTS_URL } from '../../utils/constants.js';

export const createAppointment = createAsyncThunk('appointments/create', async (data, thunkAPI) => {
  try {
    const response = await axiosInstance.post(APPOINTMENTS_URL, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMyAppointments = createAsyncThunk('appointments/getMy', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`${APPOINTMENTS_URL}/myappointments`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getAppointments = createAsyncThunk('appointments/getAll', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(APPOINTMENTS_URL);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const approveAppointment = createAsyncThunk('appointments/approve', async (id, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axiosInstance.put(`${APPOINTMENTS_URL}/${id}/approve`, {}, config);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const rejectAppointment = createAsyncThunk('appointments/reject', async ({ id, rejectionReason }, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axiosInstance.put(`${APPOINTMENTS_URL}/${id}/reject`, { rejectionReason }, config);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const cancelAppointment = createAsyncThunk('appointments/cancel', async ({ id, cancellationReason }, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axiosInstance.put(`${APPOINTMENTS_URL}/${id}/cancel`, { cancellationReason }, config);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    manuallyUpdateAppointmentStatus: (state, action) => {
      const { id, status } = action.payload;
      state.appointments = state.appointments.map(a => 
        a._id === id ? { ...a, status } : a
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createAppointment.fulfilled, (state, action) => { state.loading = false; state.appointments.push(action.payload); })
      .addCase(createAppointment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(getMyAppointments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyAppointments.fulfilled, (state, action) => { state.loading = false; state.appointments = action.payload; })
      .addCase(getMyAppointments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(getAppointments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAppointments.fulfilled, (state, action) => { state.loading = false; state.appointments = action.payload; })
      .addCase(getAppointments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(approveAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(approveAppointment.fulfilled, (state, action) => { 
        state.loading = false; 
        state.appointments = state.appointments.map(appt => appt._id === action.payload._id ? action.payload : appt);
      })
      .addCase(approveAppointment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(rejectAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(rejectAppointment.fulfilled, (state, action) => { 
        state.loading = false; 
        state.appointments = state.appointments.map(appt => appt._id === action.payload._id ? action.payload : appt);
      })
      .addCase(rejectAppointment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(cancelAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cancelAppointment.fulfilled, (state, action) => { 
        state.loading = false; 
        state.appointments = state.appointments.map(appt => appt._id === action.payload._id ? action.payload : appt);
      })
      .addCase(cancelAppointment.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { manuallyUpdateAppointmentStatus } = appointmentSlice.actions;

export default appointmentSlice.reducer;
