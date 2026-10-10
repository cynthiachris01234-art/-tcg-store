'use client';

import { createContext, useContext, useReducer, useEffect, useState, ReactNode, createElement } from 'react';
import type { Product, Cart, CartItem } from '@/types';
import { CASE_BUNDLE_RATE } from './pricing';
import { priceOf, multiBuyDiscount } from './promos';

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD';    product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; cart: Cart }
  | { type: 'RECALC' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

// Same rules as the server's rebuildOrderPricing (lib/orderRecord.ts).
function calcCart(items: CartItem[]): Cart {
  const now = Date.now();
  const lines = items.map(i => ({
    unitPrice: priceOf(i.product, now), quantity: i.quantity, productType: i.product.product_type,
  }));
  const subtotal = +lines.reduce((sum, l) => sum + +(l.unitPrice * l.quantity).toFixed(2), 0).toFixed(2);
  const multi    = multiBuyDiscount(lines);
  const hasCase  = items.some((i) => i.product.product_type === 'case');
  const bundle   = hasCase ? +((subtotal - multi) * CASE_BUNDLE_RATE).toFixed(2) : 0;
  return {
    items,
    subtotal_usd: subtotal,
    bundle_discount: bundle,
    multibuy_discount: multi,
    total_usd: +(subtotal - multi - bundle).toFixed(2),
  };
}

function cartReducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case 'HYDRATE':
      return action.cart;
    case 'RECALC':
      return calcCart(state.items);
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
    // A cart restored from the reminder email (/cart/recover) wins over
    // whatever was saved before, and is used once.
    const restore = localStorage.getItem('apex-cart-restore');
    if (restore) localStorage.removeItem('apex-cart-restore');
    const raw = restore ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
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
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage, then refresh prices from the server catalog
  // (the full catalog is not shipped in the browser bundle).
  useEffect(() => {
    const saved = loadCart();
    if (saved.items.length === 0) {
      setReady(true);
      return;
    }
    dispatch({ type: 'HYDRATE', cart: saved });
    const ids = saved.items.map(i => i.product.id);
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(r => r.json())
      .then((d: { products?: Product[] }) => {
        const byId = new Map((d.products ?? []).map(p => [p.id, p]));
        if (!byId.size) return;
        const items = saved.items.map(i => ({ ...i, product: byId.get(i.product.id) ?? i.product }));
        dispatch({ type: 'HYDRATE', cart: calcCart(items) });
      })
      .catch(() => {});
    setReady(true);
  }, []);

  // Re-price every minute so a flash sale ending is reflected without a reload.
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'RECALC' }), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCart(cart);
  }, [cart, ready]);

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
