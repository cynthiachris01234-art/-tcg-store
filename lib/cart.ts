'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, createElement } from 'react';
import type { Product, Cart, CartItem } from '@/types';
import { CASE_BUNDLE_RATE } from './pricing';

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD';    product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; cart: Cart };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function calcCart(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, i) => sum + i.product.our_price_usd * i.quantity, 0);
  const hasCase = items.some((i) => i.product.product_type === 'case');
  const bundle  = hasCase ? subtotal * CASE_BUNDLE_RATE : 0;
  return {
    items,
    subtotal_usd: +subtotal.toFixed(2),
    bundle_discount: +bundle.toFixed(2),
    total_usd: +(subtotal - bundle).toFixed(2),
  };
}

function cartReducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'HYDRATE':
      return action.cart;
    case 'ADD': {
      const qty   = action.quantity ?? 1;
      const exist = state.items.find((i) => i.product.id === action.product.id);
      const items = exist
        ? state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          )
        : [...state.items, { product: action.product, quantity: qty }];
      return calcCart(items);
    }
    case 'REMOVE': {
      return calcCart(state.items.filter((i) => i.product.id !== action.productId));
    }
    case 'UPDATE': {
      const items = action.quantity <= 0
        ? state.items.filter((i) => i.product.id !== action.productId)
        : state.items.map((i) =>
            i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
          );
      return calcCart(items);
    }
    case 'CLEAR':
      return calcCart([]);
    default:
      return state;
  }
}

const STORAGE_KEY = 'apex-tcg-cart';
const EMPTY_CART: Cart = { items: [], subtotal_usd: 0, bundle_discount: 0, total_usd: 0 };

function loadCart(): Cart {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
    // Recalculate totals to ensure they're current
    return calcCart(parsed.items ?? []);
  } catch {
    return EMPTY_CART;
  }
}

function saveCart(cart: Cart) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: cart.items }));
  } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue>({
  cart: EMPTY_CART,
  addItem:    () => {},
  removeItem: () => {},
  updateItem: () => {},
  clearCart:  () => {},
  itemCount: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, EMPTY_CART);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const saved = loadCart();
    if (saved.items.length > 0) {
      dispatch({ type: 'HYDRATE', cart: saved });
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addItem    = (product: Product, quantity = 1) => dispatch({ type: 'ADD', product, quantity });
  const removeItem = (productId: string)               => dispatch({ type: 'REMOVE', productId });
  const updateItem = (productId: string, qty: number)  => dispatch({ type: 'UPDATE', productId, quantity: qty });
  const clearCart  = ()                                 => dispatch({ type: 'CLEAR' });

  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return createElement(CartContext.Provider, { value: { cart, addItem, removeItem, updateItem, clearCart, itemCount } }, children);
}

export function useCart() {
  return useContext(CartContext);
}
