'use client';

import { useState } from 'react';
import { ShoppingCart, Bell, Mail, Plus, Minus } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { subscribeRestockAlert, subscribePreOrder } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const canBuy   = product.stock_quantity > 0 && !product.is_pre_order;
  const isPreOrder = product.is_pre_order;

  async function handleNotify() {
    if (!email) return;
    setStatus('loading');
    try {
      await subscribeRestockAlert(product.id, email);
      setStatus('done');
    } catch { setStatus('error'); }
  }

  async function handlePreOrder() {
    if (!email) return;
    setStatus('loading');
    try {
      await subscribePreOrder(product.id, email, qty);
      setStatus('done');
    } catch { setStatus('error'); }
  }

  return (
    <div className="space-y-4">
      {/* Qty selector */}
      {(canBuy || isPreOrder) && (
        <div className="flex items-center gap-3">
          <span className="text-muted text-sm">Quantity</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center text-white transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-white font-semibold">{qty}</span>
            <button onClick={() => setQty(Math.min(product.stock_quantity || 99, qty + 1))}
              className="w-8 h-8 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart */}
      {canBuy && (
        <button onClick={() => addItem(product, qty)} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      )}

      {/* Pre-order */}
      {isPreOrder && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-bg border border-bg-border rounded-xl px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-accent" />
            <button onClick={handlePreOrder} disabled={status === 'loading' || !email}
              className="btn-primary px-6 py-3">
              Pre-Order
            </button>
          </div>
          {status === 'done'  && <p className="text-success text-sm">✓ Pre-order confirmed! We'll email you when it ships.</p>}
          {status === 'error' && <p className="text-danger text-sm">Something went wrong. Try again.</p>}
        </div>
      )}

      {/* Out of stock — restock alert */}
      {!canBuy && !isPreOrder && (
        <div className="space-y-3">
          <p className="text-muted text-sm">This product is currently out of stock. Enter your email to be notified when it's back.</p>
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-bg border border-bg-border rounded-xl px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-accent" />
            <button onClick={handleNotify} disabled={status === 'loading' || !email}
              className="btn-outline flex items-center gap-2 px-4 py-3">
              <Bell className="w-4 h-4" />
              Notify Me
            </button>
          </div>
          {status === 'done'  && <p className="text-success text-sm">✓ You'll be notified when this item is back in stock!</p>}
          {status === 'error' && <p className="text-danger text-sm">Something went wrong. Try again.</p>}
        </div>
      )}
    </div>
  );
}
