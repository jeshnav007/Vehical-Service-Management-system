import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { VEHICLES_URL } from '../../utils/constants.js';

export const addVehicle = createAsyncThunk('vehicles/add', async (vehicleData, thunkAPI) => {
  try {
    const response = await axiosInstance.post(VEHICLES_URL, vehicleData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMyVehicles = createAsyncThunk('vehicles/getMy', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`${VEHICLES_URL}/myvehicles`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addVehicle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addVehicle.fulfilled, (state, action) => { state.loading = false; state.vehicles.push(action.payload); })
      .addCase(addVehicle.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(getMyVehicles.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyVehicles.fulfilled, (state, action) => { state.loading = false; state.vehicles = action.payload; })
      .addCase(getMyVehicles.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default vehicleSlice.reducer;
