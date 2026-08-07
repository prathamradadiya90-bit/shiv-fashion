import { createSlice } from '@reduxjs/toolkit';

/**
 * Safely parse a JSON value from localStorage.
 * Returns null if the stored value is missing, malformed, or tampered.
 */
const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // Malformed JSON in localStorage (e.g. manually tampered) — treat as absent
    localStorage.removeItem(key);
    return null;
  }
};

const initialState = {
  userInfo: safeParse('userInfo'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      // Clear all user-specific data from localStorage on logout
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('shippingAddress');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
