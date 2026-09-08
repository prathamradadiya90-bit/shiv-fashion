import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/store';
import App from './App.jsx';
import './index.css';

// Version stamp — bump this whenever JWT_SECRET or auth schema changes.
// On mismatch, all stale localStorage auth/cart data is wiped so users
// get a clean re-login instead of a confusing "token failed" error.
const APP_VERSION = '2';
if (localStorage.getItem('appVersion') !== APP_VERSION) {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.setItem('appVersion', APP_VERSION);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
