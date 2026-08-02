import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses Vercel environment variable in production
  withCredentials: true, // Important for sending/receiving HTTP-Only cookies
});

// Request interceptor to attach token from Redux state (fallback for blocked third-party cookies)
api.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth && auth.userInfo && auth.userInfo.token) {
      config.headers.Authorization = `Bearer ${auth.userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler for Token Expiration / Invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or Invalidated (e.g., password changed on another device)
      store.dispatch(logout());
      
      // Only redirect if not already on login page to avoid loops
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
