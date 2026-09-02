import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  _loaded: boolean;
}

function recalcTotals(items: CartItem[]) {
  return {
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("datatowel_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("datatowel_cart", JSON.stringify(items));
  } catch {
    // ignore
  }
}

const persistedItems = loadCart();
const persistedTotals = recalcTotals(persistedItems);

const initialState: CartState = {
  items: persistedItems,
  totalQuantity: persistedItems.length > 0 ? persistedTotals.totalQuantity : 0,
  totalAmount: persistedItems.length > 0 ? persistedTotals.totalAmount : 0,
  _loaded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id && item.variant === action.payload.variant
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      const totals = recalcTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCart(state.items);
    },
    removeFromCart(
      state,
      action: PayloadAction<{ id: string; variant?: string }>
    ) {
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === action.payload.id &&
            item.variant === action.payload.variant
          )
      );
      const totals = recalcTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCart(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{
        id: string;
        variant?: string;
        quantity: number;
      }>
    ) {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id && item.variant === action.payload.variant
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      const totals = recalcTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      saveCart([]);
    },
    setCartLoaded(state) {
      state._loaded = true;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartLoaded } =
  cartSlice.actions;
export default cartSlice.reducer;
