import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  withCredentials: true,
});

// Attach Bearer token from Redux state on every request
// (reliable fallback when cross-origin cookies are blocked)
api.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth?.userInfo?.token) {
      config.headers.Authorization = `Bearer ${auth.userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Pages where a 401 should NEVER trigger auto-logout
const PROTECTED_PAGES = [
  '/cart',
  '/shipping',
  '/placeorder',
  '/order',
  '/profile',
  '/my-orders',
];

// API routes where a 401 should NEVER trigger auto-logout
const PROTECTED_API_ROUTES = [
  '/orders',
  '/pay',
  '/payment-callback',
  '/webhook',
  '/retry-pay',
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const currentPage = window.location.pathname;

      // Skip auto-logout if on a checkout/order page
      const onProtectedPage = PROTECTED_PAGES.some((p) => currentPage.startsWith(p));

      // Skip auto-logout if the failing request is payment/order related
      const isProtectedRoute = PROTECTED_API_ROUTES.some((r) => requestUrl.includes(r));

      // Skip auto-logout if Razorpay modal is open
      const razorpayOpen =
        !!document.getElementById('razorpay-container') ||
        !!document.querySelector('iframe[src*="razorpay"]') ||
        !!document.querySelector('[id^="razorpay"]');

      if (onProtectedPage || isProtectedRoute || razorpayOpen) {
        // Let the calling component handle this error — do NOT log out
        return Promise.reject(error);
      }

      // Safe to auto-logout: token genuinely expired on a non-sensitive page
      store.dispatch(logout());
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
