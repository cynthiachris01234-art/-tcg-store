'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Clock, CheckCircle2, Ban } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { formatDate, isComingSoon, shortDate } from '@/lib/utils';

// In-stock and pre-order products go through the normal cart → checkout flow
// (so the order reaches you and your admin panel). Sold-out products are shown
// as sold out and cannot be added to the cart.
export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isPreOrder = product.is_pre_order;
  const inStock    = product.stock_quantity > 0 && !isPreOrder;
  const soldOut    = !isPreOrder && product.stock_quantity <= 0;
  const maxQty     = inStock ? product.stock_quantity : 10;

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (isComingSoon(product)) {
    return (
      <div className="space-y-3">
        <button disabled
          className="w-full flex items-center justify-center gap-2 py-3.5 text-base rounded-xl border border-accent/40 bg-accent/10 text-accent cursor-not-allowed">
          <Clock className="w-5 h-5" />
          Coming Soon · {shortDate(product.release_date)}
        </button>
        <p className="text-xs text-muted">
          Not released yet — available to order from <strong className="text-white">{formatDate(product.release_date)}</strong>.
        </p>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="space-y-3">
        <button disabled
          className="w-full flex items-center justify-center gap-2 py-3.5 text-base rounded-xl border border-bg-border bg-bg text-muted cursor-not-allowed">
          <Ban className="w-5 h-5" />
          Sold Out
        </button>
        <p className="text-xs text-muted">This item is sold out. Check back soon — we restock regularly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Qty selector */}
      <div className="flex items-center gap-3">
        <span className="text-muted text-sm">Quantity</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center text-white transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-white font-semibold">{qty}</span>
          <button onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty}
            className="w-8 h-8 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center text-white transition-colors disabled:opacity-40">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {inStock && product.stock_quantity <= 5 && (
          <span className="text-xs text-yellow-400">Only {product.stock_quantity} left</span>
        )}
      </div>

      <button onClick={handleAdd} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base">
        {added ? <CheckCircle2 className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        {added ? 'Added to cart' : isPreOrder ? 'Pre-Order Now' : 'Add to Cart'}
      </button>

      {isPreOrder && (
        <p className="flex items-start gap-2 text-xs text-muted leading-relaxed">
          <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <span>
            Pre-order — reserve yours now. Ships on release
            {product.release_date ? <> (<strong className="text-white">{formatDate(product.release_date)}</strong>)</> : null}.
          </span>
        </p>
      )}
    </div>
  );
}
