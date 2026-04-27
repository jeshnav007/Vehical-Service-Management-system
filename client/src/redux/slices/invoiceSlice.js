import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { INVOICES_URL } from '../../utils/constants.js';

export const createInvoice = createAsyncThunk('invoices/create', async (data, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const response = await axiosInstance.post(INVOICES_URL, data, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getInvoices = createAsyncThunk('invoices/getAll', async (_, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const response = await axiosInstance.get(INVOICES_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMyInvoices = createAsyncThunk('invoices/getMy', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`${INVOICES_URL}/myinvoices`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const payInvoice = createAsyncThunk('invoices/pay', async (id, thunkAPI) => {
  try {
    const { auth: { userInfo } } = thunkAPI.getState();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axiosInstance.put(`${INVOICES_URL}/${id}/pay`, {}, config);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInvoice.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createInvoice.fulfilled, (state, action) => { state.loading = false; state.invoices.push(action.payload); })
      .addCase(createInvoice.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(getInvoices.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getInvoices.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload; })
      .addCase(getInvoices.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(getMyInvoices.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getMyInvoices.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload; })
      .addCase(getMyInvoices.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(payInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Map UI logic dynamically rewriting target without refetch payload
        state.invoices = state.invoices.map(inv => inv._id === action.payload._id ? action.payload : inv);
      })
      .addCase(payInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default invoiceSlice.reducer;
