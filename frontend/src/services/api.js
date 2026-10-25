import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

// In production, always use same-origin relative '/api' unless an explicit external API is configured.
// This guarantees same-origin requests with zero CORS errors and native cookie support on Vercel.
const BASE_URL = import.meta.env.PROD
  ? ((import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('shreeji') && !import.meta.env.VITE_API_URL.includes('[SENSITIVE]'))
      ? import.meta.env.VITE_API_URL
      : '/api')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: BASE_URL,
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
// (user is mid-payment; logging out would destroy the Razorpay session)
const PAYMENT_PAGES = [
  '/placeorder',
  '/order',
];

// API routes that are part of the payment flow — a 401 here should NOT
// auto-logout because the Razorpay modal may be open and logging out
// would destroy the in-progress payment session.
const PAYMENT_API_ROUTES = [
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

      // Skip auto-logout ONLY if Razorpay payment is actively in progress
      const onPaymentPage = PAYMENT_PAGES.some((p) => currentPage.startsWith(p));
      const isPaymentRoute = PAYMENT_API_ROUTES.some((r) => requestUrl.includes(r));
      const razorpayOpen =
        !!document.getElementById('razorpay-container') ||
        !!document.querySelector('iframe[src*="razorpay"]') ||
        !!document.querySelector('[id^="razorpay"]');

      if ((onPaymentPage || isPaymentRoute) && razorpayOpen) {
        // Razorpay modal is open — do NOT log out or redirect
        return Promise.reject(error);
      }

      // Protected routes where session expiry requires redirecting to login
      const PROTECTED_PAGES = [
        '/admin',
        '/profile',
        '/my-orders',
        '/orders',
        '/wishlist',
      ];
      const isProtectedPage = PROTECTED_PAGES.some((p) => currentPage.startsWith(p));

      // Token is expired or invalid — clear session from Redux & localStorage
      store.dispatch(logout());

      // Only redirect to login if user is on an actively protected route
      if (
        isProtectedPage &&
        currentPage !== '/login' &&
        currentPage !== '/register'
      ) {
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPage)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
