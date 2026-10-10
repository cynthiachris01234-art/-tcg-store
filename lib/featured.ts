import type { Brand, Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { isComingSoon } from '@/lib/utils';

const BRAND_ORDER: Brand[] = ['pokemon', 'onepiece', 'mtg', 'riftbound', 'dragonball', 'lorcana', 'yugioh', 'starwars', 'digimon'];
const FEATURE_TYPES = new Set(['booster_box', 'etb', 'upc', 'spc', 'premium_collection', 'bundle']);
const PINNED_IDS = ['poke-30c-elite-trainer-box-en'];
export const FEATURED_COUNT = 11;

function isBuyableNow(p: Product) {
  return !p.is_pre_order && !isComingSoon(p) && p.stock_quantity > 0 && FEATURE_TYPES.has(p.product_type);
}

export function featuredPicks(total = FEATURED_COUNT): Product[] {
  const pinned = PINNED_IDS
    .map(id => MOCK_PRODUCTS.find(p => p.id === id))
    .filter((p): p is Product => !!p && isBuyableNow(p));
  const pinnedIds = new Set(pinned.map(p => p.id));

  const queues = BRAND_ORDER.map(brand => {
    const list = MOCK_PRODUCTS
      .filter(p => p.brand === brand && isBuyableNow(p) && !pinnedIds.has(p.id))
      .sort((a, b) =>
        (Number(!!b.is_promo) - Number(!!a.is_promo)) ||
        b.release_date.localeCompare(a.release_date) ||
        b.our_price_usd - a.our_price_usd);
    const seen = new Set<string>(); const first: Product[] = []; const rest: Product[] = [];
    for (const p of list) (seen.has(p.set_code) ? rest : (seen.add(p.set_code), first)).push(p);
    return [...first, ...rest];
  });

  const out: Product[] = [...pinned];
  for (let round = 0; out.length < total; round++) {
    let added = false;
    for (const q of queues) {
      if (q[round]) { out.push(q[round]); added = true; if (out.length >= total) break; }
    }
    if (!added) break;
  }
  return out;
}
