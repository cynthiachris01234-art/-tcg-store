/**
 * Pricing utilities
 * – All stored prices are in USD.
 * – We sell at (1 - DISCOUNT_RATE) × market price.
 * – Cases get an additional CASE_BUNDLE_DISCOUNT on top.
 */

import type { Product, Currency } from '@/types';

export const DISCOUNT_RATE     = Number(process.env.NEXT_PUBLIC_DISCOUNT_RATE ?? 0.30);
export const CASE_BUNDLE_RATE  = 0.05;   // extra 5% for cases

export function calcOurPrice(marketPrice: number, isCase = false): number {
  const base = marketPrice * (1 - DISCOUNT_RATE);
  return isCase ? base * (1 - CASE_BUNDLE_RATE) : base;
}

export function calcSavings(marketPrice: number, ourPrice: number) {
  return {
    amount:  +(marketPrice - ourPrice).toFixed(2),
    percent: +((1 - ourPrice / marketPrice) * 100).toFixed(0),
  };
}

export function formatPrice(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Price source selectors ───────────────────────────────────────────────────

/** Which price source to use for a given language */
export function priceSourceForLanguage(lang: 'en' | 'jp' | 'kr') {
  const map = { en: 'tcgplayer', jp: 'bigweb', kr: 'naver' } as const;
  return map[lang];
}

// ─── TCGPlayer (EN) ───────────────────────────────────────────────────────────

export async function fetchTCGPlayerPrice(productName: string): Promise<number | null> {
  try {
    // Step 1: get bearer token
    const tokenRes = await fetch('https://api.tcgplayer.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.TCGPLAYER_PUBLIC_KEY!,
        client_secret: process.env.TCGPLAYER_PRIVATE_KEY!,
      }),
    });
    const { access_token } = await tokenRes.json();

    // Step 2: search for the product
    const searchRes = await fetch(
      `https://api.tcgplayer.com/v1.39.0/catalog/products?productName=${encodeURIComponent(productName)}&productTypeName=Booster+Box&limit=1`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const searchData = await searchRes.json();
    if (!searchData.results?.[0]) return null;

    const productId = searchData.results[0].productId;

    // Step 3: get market price
    const priceRes = await fetch(
      `https://api.tcgplayer.com/v1.39.0/pricing/product/${productId}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const priceData = await priceRes.json();
    const marketPrice = priceData.results?.[0]?.marketPrice;
    return marketPrice ?? null;
  } catch {
    return null;
  }
}

// ─── BigWeb / Yuyutei (JP) ────────────────────────────────────────────────────

export async function fetchBigWebPrice(setCode: string): Promise<number | null> {
  try {
    // BigWeb doesn't have a public API; we reference a price from our DB
    // Updated weekly via a cron job in /app/api/pricing/sync/route.ts
    // This function is a placeholder for the scraping logic run server-side.
    return null;
  } catch {
    return null;
  }
}

// ─── Naver (KR) ──────────────────────────────────────────────────────────────

export async function fetchNaverPrice(setName: string): Promise<number | null> {
  try {
    // Naver Smart Store requires manual reference; updated via cron.
    return null;
  } catch {
    return null;
  }
}

// ─── Scryfall (MTG) ──────────────────────────────────────────────────────────

export async function fetchScryfallSetPrice(setCode: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.scryfall.com/sets/${setCode}`);
    if (!res.ok) return null;
    // Scryfall doesn't expose box prices directly; use as supplementary data.
    return null;
  } catch {
    return null;
  }
}
