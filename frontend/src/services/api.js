import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';

// In production (Vercel), always use /api — requests are proxied to the backend
// by vercel.json rewrites on the same domain, so CORS never applies.
// In local dev, Vite's proxy (vite.config.js) also rewrites /api → localhost:5000.
const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

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

      // Token is genuinely expired or invalid — clear session and redirect to login.
      // This covers /my-orders, /profile, /cart and all other protected pages.
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
