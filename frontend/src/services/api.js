import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
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
      // Do NOT auto-logout if Razorpay checkout is currently open.
      // Razorpay adds a div with id="razorpay-container" or an iframe when active.
      const razorpayActive =
        document.getElementById('razorpay-container') ||
        document.querySelector('iframe[src*="razorpay"]') ||
        document.querySelector('.razorpay-container') ||
        document.querySelector('[id^="razorpay"]');

      if (razorpayActive) {
        // Payment flow is active — do not log out. Let the caller handle the error.
        return Promise.reject(error);
      }

      // Also skip auto-logout for payment verification calls (POST .../pay)
      const requestUrl = error.config?.url || '';
      const isPaymentRoute =
        requestUrl.includes('/pay') ||
        requestUrl.includes('/orders') ||
        requestUrl.includes('/payment-callback');

      if (isPaymentRoute) {
        return Promise.reject(error);
      }

      // Token expired or invalidated on a non-payment route — log out
      store.dispatch(logout());

      // Only redirect if not already on auth pages to avoid loops
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
