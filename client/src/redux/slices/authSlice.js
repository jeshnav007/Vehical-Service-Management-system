import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth } from '../../config/firebase.js';
import axiosInstance from '../../services/axiosInstance.js';
import { USERS_URL } from '../../utils/constants.js';

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const { email, password } = userData;

    // 1. Authenticate with Firebase Authentication client SDK
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const token = await userCredential.user.getIdToken();

    // 2. Fetch or sync user profile with backend API using Firebase ID token
    const response = await axiosInstance.post(
      `${USERS_URL}/login`,
      { token },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const userPayload = {
      ...response.data,
      token,
    };

    localStorage.setItem('userInfo', JSON.stringify(userPayload));
    return userPayload;
  } catch (error) {
    let message = error.response?.data?.message || error.message;
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      message = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please try again later.';
    }
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const { name, email, password, phone } = userData;

    // 1. Create user account in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name) {
      try {
        await updateFirebaseProfile(userCredential.user, { displayName: name });
      } catch (e) {
        // Continue even if display name update fails
      }
    }

    const token = await userCredential.user.getIdToken();

    // 2. Create user profile in Express backend / Cloud Firestore
    const response = await axiosInstance.post(
      `${USERS_URL}`,
      { name, email: email.trim(), phone },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const userPayload = {
      ...response.data,
      token,
    };

    localStorage.setItem('userInfo', JSON.stringify(userPayload));
    return userPayload;
  } catch (error) {
    let message = error.response?.data?.message || error.message;
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email address already exists.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    }
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await signOut(auth).catch(() => {});
    await axiosInstance.post(`${USERS_URL}/logout`).catch(() => {});
    localStorage.removeItem('userInfo');
  } catch (error) {
    localStorage.removeItem('userInfo');
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`${USERS_URL}/profile`, userData);
    const prevUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const updatedUserInfo = {
      ...prevUserInfo,
      ...response.data,
      token: prevUserInfo.token,
    };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    return updatedUserInfo;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
