'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Gift, Layers } from 'lucide-react';
import type { Product } from '@/types';
import { activeFlashSale, currentFlashSale, priceOf, MULTI_BUY, FREE_GIFT, MIN_ORDER_USD } from '@/lib/promos';

/** Current time, updated every `everyMs`. Null until mounted, so server and
 *  client render the same HTML (no hydration mismatch), then it goes live. */
export function useNow(everyMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

/** The price a product sells for right now (flash sales applied once mounted). */
export function useLivePrice(p: Pick<Product, 'id' | 'our_price_usd'>): { price: number; onSale: boolean } {
  const now = useNow(30_000);
  const price = now == null ? p.our_price_usd : priceOf(p, now);
  return { price, onSale: price < p.our_price_usd };
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const pad = (n: number) => String(n).padStart(2, '0');

function Countdown({ endsAt, now }: { endsAt: string; now: number }) {
  const { h, m, s } = parts(Date.parse(endsAt) - now);
  return (
    <span className="font-mono tabular-nums font-black">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/** Price with the regular price struck through while a flash sale runs. */
export function LivePrice({ product, className = 'text-white font-bold text-2xl' }: {
  product: Pick<Product, 'id' | 'our_price_usd'>; className?: string;
}) {
  const { price, onSale } = useLivePrice(product);
  return (
    <span className="inline-flex items-baseline gap-2">
      {onSale && <span className="text-muted line-through text-sm">${product.our_price_usd.toFixed(2)}</span>}
      <span className={onSale ? className.replace('text-white', 'text-red-400') : className}>${price.toFixed(2)}</span>
    </span>
  );
}

/** Site-wide bar shown only while a flash sale is running. */
export function FlashSaleBanner() {
  const now = useNow();
  if (now == null) return null;
  const sale = currentFlashSale(now);
  if (!sale) return null;
  return (
    <Link href="/shop"
      className="block bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white hover:brightness-110 transition">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm text-center">
        <span className="flex items-center gap-1 font-extrabold uppercase tracking-wide">
          <Zap className="w-4 h-4 fill-white" /> {sale.title}
        </span>
        <span>
          Sale price <strong>${sale.price.toFixed(0)}</strong> — today only
        </span>
        <span className="bg-black/25 rounded-md px-2 py-0.5">
          Ends in <Countdown endsAt={sale.endsAt} now={now} />
        </span>
      </div>
    </Link>
  );
}

/** Product-page box: flash countdown + multi-buy and free-gift reminders. */
export function ProductPromos({ product }: { product: Pick<Product, 'id' | 'our_price_usd' | 'product_type'> }) {
  const now = useNow();
  const sale = now == null ? null : activeFlashSale(product.id, now);
  const multi = MULTI_BUY.types.includes(product.product_type);
  return (
    <div className="space-y-2">
      {sale && now != null && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3">
          <p className="text-red-400 font-extrabold text-sm tracking-wide flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-red-400" /> {sale.title.toUpperCase()}
          </p>
          <p className="text-white text-sm mt-1">
            Save ${(product.our_price_usd - sale.price).toFixed(2)} — sale ends in{' '}
            <span className="text-red-300"><Countdown endsAt={sale.endsAt} now={now} /></span>
          </p>
          <p className="text-muted text-xs mt-0.5">Price goes back to ${product.our_price_usd.toFixed(2)} at midnight (New York time).</p>
        </div>
      )}
      {multi && (
        <p className="text-xs text-accent flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Buy 2 or more ETBs / Booster Boxes — every 2nd one is 10% off
        </p>
      )}
      <p className="text-xs text-green-400 flex items-center gap-1.5">
        <Gift className="w-3.5 h-3.5" /> Free booster pack with every order over ${FREE_GIFT.thresholdUsd}
      </p>
      <p className="text-xs text-muted">Minimum order ${MIN_ORDER_USD}</p>
    </div>
  );
}

/** Cart / checkout summary lines: multi-buy saving and free-gift progress. */
export function CartPromoLines({ multibuy, merchTotal, format }: {
  multibuy: number; merchTotal: number; format: (usd: number) => string;
}) {
  const gap = +(FREE_GIFT.thresholdUsd - merchTotal).toFixed(2);
  return (
    <>
      {multibuy > 0 && (
        <div className="flex justify-between text-green-400 text-sm">
          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Multi-buy (10% off every 2nd)</span>
          <span>−{format(multibuy)}</span>
        </div>
      )}
      {merchTotal > 0 && (gap <= 0 ? (
        <div className="flex justify-between text-green-400 text-sm">
          <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> {FREE_GIFT.label}</span>
          <span>FREE</span>
        </div>
      ) : (
        <div className="text-[11px] text-muted">
          <p>Add <strong className="text-green-400">{format(gap)}</strong> more for a <strong className="text-green-400">free booster pack</strong> 🎁</p>
          <div className="h-1 bg-bg-border rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (merchTotal / FREE_GIFT.thresholdUsd) * 100)}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}
