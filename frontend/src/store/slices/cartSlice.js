import { createSlice } from '@reduxjs/toolkit';

/**
 * Safely parse a JSON value from localStorage.
 * Returns the fallback if the stored value is missing or malformed.
 */
const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

// Cart state persistence supports guest users as well as authenticated customers.
// Guest cart items are preserved in localStorage and seamlessly migrate when the user registers or logs in.
const initialState = {
  cartItems: (safeParse('cartItems', []) || []).filter(item => item && item.id),
  shippingAddress: safeParse('shippingAddress', {}) || {},
};

const updateCartInStorage = (state) => {
  localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.id === item.id && x.size === item.size && x.color === item.color
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.id === existItem.id && x.size === existItem.size && x.color === existItem.color
            ? item
            : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      updateCartInStorage(state);
    },
    removeFromCart: (state, action) => {
      const { id, size, color } = action.payload;
      state.cartItems = state.cartItems.filter(
        (x) => !(x.id === id && x.size === size && x.color === color)
      );
      updateCartInStorage(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      state.shippingAddress = {};
      localStorage.removeItem('cartItems');
      localStorage.removeItem('shippingAddress');
    },
  },
});

export const { addToCart, removeFromCart, saveShippingAddress, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;
