import axios from 'axios';
import { BASE_URL } from '../utils/constants.js';
import { auth } from '../config/firebase.js';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // 1. If Firebase Auth has an active current user, get a fresh ID token
      if (auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${freshToken}`;
        return config;
      }
    } catch (err) {
      // Silent catch to fall back to stored token
    }

    // 2. Fall back to cached token in localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
