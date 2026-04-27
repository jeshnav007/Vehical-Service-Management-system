import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { SERVICES_URL } from '../../utils/constants.js';

export const createServiceRecord = createAsyncThunk('serviceRecords/create', async (data, thunkAPI) => {
  try {
    const response = await axiosInstance.post(SERVICES_URL, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateServiceRecordStatus = createAsyncThunk('serviceRecords/updateStatus', async ({ id, data }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`${SERVICES_URL}/${id}/status`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const serviceRecordSlice = createSlice({
  name: 'serviceRecords',
  initialState: {
    records: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createServiceRecord.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createServiceRecord.fulfilled, (state, action) => { state.loading = false; state.records.push(action.payload); })
      .addCase(createServiceRecord.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(updateServiceRecordStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateServiceRecordStatus.fulfilled, (state, action) => { 
        state.loading = false; 
        const index = state.records.findIndex(r => r._id === action.payload._id);
        if(index !== -1) state.records[index] = action.payload;
      })
      .addCase(updateServiceRecordStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default serviceRecordSlice.reducer;
