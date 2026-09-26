import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('cart');
const parsedCart = storedCart ? JSON.parse(storedCart) : null;
const initialCart = {
  ...parsedCart,
  items: Array.isArray(parsedCart?.items)
    ? parsedCart.items
        .filter((item) => item?.productCode)
        .map((item) => ({ ...item, price: 400, stock: item.stock || item.quantity }))
    : [],
  shippingAddress: parsedCart?.shippingAddress || {},
  paymentMethod: 'Cash on Delivery',
};

if (storedCart) localStorage.setItem('cart', JSON.stringify(initialCart));

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCart,
  reducers: {
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existItem = state.items.find((x) => x.product === item.product && x.sku === item.sku);

      if (item.stock === 0) return;

      if (existItem) {
        existItem.quantity = Math.min(existItem.quantity + item.quantity, item.stock || existItem.stock || 20);
        existItem.stock = item.stock || existItem.stock;
      } else {
        state.items.push(item);
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateCartQuantity: (state, action) => {
      const { product, sku, quantity } = action.payload;
      const item = state.items.find((cartItem) => cartItem.product === product && cartItem.sku === sku);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock || 20));
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    removeFromCartLocal: (state, action) => {
      const { product, sku } = action.payload;
      state.items = state.items.filter((x) => !(x.product === product && x.sku === sku));
      localStorage.setItem('cart', JSON.stringify(state));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const {
  addToCartLocal,
  updateCartQuantity,
  removeFromCartLocal,
  saveShippingAddress,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;