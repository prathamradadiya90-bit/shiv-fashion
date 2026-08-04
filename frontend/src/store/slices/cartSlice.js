import { createSlice } from '@reduxjs/toolkit';

// Only restore cart from localStorage if the user is actually logged in.
// This prevents guests from seeing a cart badge or accessing stale cart data.
const isLoggedIn = !!localStorage.getItem('userInfo');

const initialState = {
  cartItems: isLoggedIn && localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems')).filter(item => item && item.id)
    : [],
  shippingAddress: isLoggedIn && localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {},
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
