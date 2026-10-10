/**
 * Store promotions. Pure functions with no side effects, so the SAME rules run
 * in the browser (what the customer sees) and on the server (what is charged).
 */
import type { Product } from '@/types';

// ─── Minimum order ───────────────────────────────────────────────────────────
// Merchandise total (after discounts, before shipping) must reach this.
export const MIN_ORDER_USD = 150;
export const meetsMinimum = (merchTotalUsd: number) => merchTotalUsd + 1e-9 >= MIN_ORDER_USD;
export const minOrderMessage = (merchTotalUsd: number) =>
  `Minimum order is $${MIN_ORDER_USD}. Add $${Math.max(0, MIN_ORDER_USD - merchTotalUsd).toFixed(2)} more to check out.`;

// ─── 1. Flash sales ─────────────────────────────────────────────────────────
// A flash sale sets a fixed price on specific products between two moments.
// Once `endsAt` passes, the normal price comes back automatically.
export interface FlashSale {
  id: string;
  title: string;
  productIds: string[];
  price: number;
  startsAt: string;   // ISO, UTC
  endsAt: string;     // ISO, UTC
}

export const FLASH_SALES: FlashSale[] = [
  {
    id: 'eom-2026-09',
    title: 'End of Month Flash Sale',
    productIds: ['poke-30c-elite-trainer-box-en'],
    price: 89,
    startsAt: '2026-09-30T04:00:00Z',   // Sep 30, 12:00 AM New York time
    endsAt:   '2026-10-01T03:59:59Z',   // Sep 30, 11:59:59 PM New York time
  },
];

export function activeFlashSale(productId: string, now = Date.now()): FlashSale | null {
  return FLASH_SALES.find(s =>
    s.productIds.includes(productId) &&
    now >= Date.parse(s.startsAt) && now <= Date.parse(s.endsAt)) ?? null;
}

/** Any flash sale running right now (for the site-wide banner). */
export function currentFlashSale(now = Date.now()): FlashSale | null {
  return FLASH_SALES.find(s => now >= Date.parse(s.startsAt) && now <= Date.parse(s.endsAt)) ?? null;
}

/** The price a product sells for at a given moment. */
export function priceOf(p: Pick<Product, 'id' | 'our_price_usd'>, now = Date.now()): number {
  const sale = activeFlashSale(p.id, now);
  return sale && sale.price < p.our_price_usd ? sale.price : p.our_price_usd;
}

// ─── 3. Multi-buy ───────────────────────────────────────────────────────────
// Buy 2+ ETBs / booster boxes: every second one (the cheaper of each pair) is 10% off.
export const MULTI_BUY = {
  types: ['etb', 'booster_box'] as string[],
  rate: 0.10,
  label: 'Multi-buy: 10% off every 2nd ETB or Booster Box',
};

export interface PriceLine { unitPrice: number; quantity: number; productType: string }

export function multiBuyDiscount(lines: PriceLine[]): number {
  const units: number[] = [];
  for (const l of lines) {
    if (!MULTI_BUY.types.includes(l.productType)) continue;
    for (let q = 0; q < Math.max(0, Math.floor(l.quantity)); q++) units.push(l.unitPrice);
  }
  units.sort((a, b) => b - a);
  let off = 0;
  for (let i = 1; i < units.length; i += 2) off += units[i] * MULTI_BUY.rate;
  return +off.toFixed(2);
}

// ─── 2. Free gift ───────────────────────────────────────────────────────────
export const FREE_GIFT = {
  thresholdUsd: 250,
  label: 'Free booster pack',
};

/** Merchandise total (after discounts, before shipping) earns the gift. */
export const qualifiesForGift = (merchTotalUsd: number) => merchTotalUsd >= FREE_GIFT.thresholdUsd;

// ─── 6. Comeback offer (abandoned checkout) ─────────────────────────────────
export const COMEBACK = {
  hours: 72,
  label: 'Free shipping (welcome-back offer)',
};

/** Reads the expiry out of a comeback token without verifying it (display only). */
export function comebackTokenExpiry(token: string | null | undefined): number | null {
  if (!token) return null;
  try {
    const body = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(typeof atob === 'function' ? atob(body) : Buffer.from(body, 'base64').toString());
    return typeof json.e === 'number' ? json.e : null;
  } catch { return null; }
}
