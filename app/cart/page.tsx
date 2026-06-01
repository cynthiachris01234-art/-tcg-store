'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { BRAND_META } from '@/lib/brands';
import type { ProductType } from '@/types';

function typeLabel(t: ProductType): string {
  switch (t) {
    case 'case':               return 'Case (6 Boxes)';
    case 'etb':                return 'Elite Trainer Box';
    case 'upc':                return 'Ultra Premium Collection';
    case 'spc':                return 'Super Premium Collection';
    case 'bundle':             return 'Booster Bundle';
    case 'premium_collection': return 'Premium Collection';
    case 'display_case':       return 'Display Case';
    case 'poster_collection':  return 'Poster Collection';
    default:                   return 'Booster Box';
  }
}

export default function CartPage() {
  const { cart, removeItem, updateItem, clearCart } = useCart();
  const { format } = useCurrency();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-6 opacity-30" />
        <h1 className="text-2xl font-bold text-white mb-3">Your cart is empty</h1>
        <p className="text-muted mb-8">Add some sealed booster boxes to get started.</p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        <button onClick={clearCart} className="text-muted hover:text-danger text-sm transition-colors flex items-center gap-1">
          <Trash2 className="w-4 h-4" /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(({ product, quantity }) => {
            const meta = BRAND_META[product.brand];
            return (
              <div key={product.id} className="card p-4 flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-bg rounded-xl overflow-hidden">
                  <Image src={product.image_url || '/placeholder-box.png'} alt={product.set_name}
                    fill className="object-contain p-1" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold" style={{ color: meta.primaryColor }}>{meta.name}</span>
                      <h3 className="text-white font-semibold text-sm mt-0.5 line-clamp-1">{product.set_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <LanguageBadge language={product.language} />
                        <span className="text-muted text-xs">
                          {typeLabel(product.product_type)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(product.id)}
                      className="text-muted hover:text-danger transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateItem(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm text-white font-semibold">{quantity}</span>
                      <button onClick={() => updateItem(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-bg-border hover:border-accent flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-white font-bold">{format(product.our_price_usd * quantity)}</p>
                      {quantity > 1 && (
                        <p className="text-muted text-xs">{format(product.our_price_usd)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4 sticky top-20">
            <h2 className="text-white font-bold text-lg">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-white">{format(cart.subtotal_usd)}</span>
              </div>
              {cart.bundle_discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-success flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Case bundle (−5%)
                  </span>
                  <span className="text-success">−{format(cart.bundle_discount)}</span>
                </div>
              )}
              <div className="border-t border-bg-border pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-white text-lg">{format(cart.total_usd)}</span>
              </div>
            </div>

            <div className="bg-success/10 border border-success/20 rounded-xl p-3">
              <p className="text-success text-xs font-semibold">
                You're saving {format(
                  cart.items.reduce((s, i) => s + (i.product.market_price_usd - i.product.our_price_usd) * i.quantity, 0)
                  + cart.bundle_discount
                )} vs market price!
              </p>
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/shop" className="btn-outline w-full flex items-center justify-center py-3 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
