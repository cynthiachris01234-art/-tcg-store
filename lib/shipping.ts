/**
 * Shipping fee calculator.
 *
 * Fee scales with FOUR factors, per the store's policy:
 *   1. Quantity  — more items = more weight
 *   2. Size      — a case is far bigger/heavier than a single pack (by product_type)
 *   3. Value     — high-value sealed product needs insured, tracked shipping
 *   4. Distance  — domestic (US) is cheap; farther zones cost progressively more
 *
 * Pure functions with no side effects so the SAME logic runs on the client
 * (to display the fee) and on the server (the authoritative charge).
 */

// ─── Free-shipping policy ──────────────────────────────────────────────────────
// Domestic (US) orders at/above this subtotal ship free.
export const FREE_SHIPPING_THRESHOLD_USD = 1000;
export const DOMESTIC_COUNTRY = 'US';

// ─── Size: relative shipping "weight units" per product type ───────────────────
const WEIGHT_UNITS: Record<string, number> = {
  booster_pack:       1,
  blister:            1,
  single_card:        1,
  poster_collection:  2,
  etb:                3,
  bundle:             3,
  premium_collection: 3,
  upc:                4,
  spc:                4,
  display_case:       6,
  build_battle:       4,
  booster_box:        5,
  case:               20,
};

function weightUnitsFor(type: string): number {
  return WEIGHT_UNITS[type] ?? 3;
}

// ─── Distance: zone by destination country ────────────────────────────────────
type Zone = 'domestic' | 'northAmerica' | 'europe' | 'world';

const ZONE_BY_COUNTRY: Record<string, Zone> = {
  US: 'domestic',
  CA: 'northAmerica', MX: 'northAmerica',
  GB: 'europe', IE: 'europe', FR: 'europe', DE: 'europe', IT: 'europe', ES: 'europe',
  NL: 'europe', BE: 'europe', CH: 'europe', AT: 'europe', SE: 'europe', NO: 'europe',
  DK: 'europe', PT: 'europe', PL: 'europe',
};

function zoneFor(country: string): Zone {
  return ZONE_BY_COUNTRY[(country || '').toUpperCase()] ?? 'world';
}

// ─── Zone rate table ───────────────────────────────────────────────────────────
// base:      flat handling + carrier base for the zone
// perUnit:   added per shipping weight-unit (size × quantity)
// insurance: fraction of order value added to cover insured/tracked shipping
const ZONE_RATES: Record<Zone, { base: number; perUnit: number; insurance: number }> = {
  domestic:     { base:  3, perUnit: 0.75, insurance: 0.002 },
  northAmerica: { base:  8, perUnit: 1.5,  insurance: 0.004 },
  europe:       { base: 14, perUnit: 2.5,  insurance: 0.005 },
  world:        { base: 20, perUnit: 3.5,  insurance: 0.006 },
};

export interface ShipItem {
  product_type: string;
  quantity: number;
}

export interface ShippingBreakdown {
  zone: Zone;
  freeApplied: boolean;
  weightUnits: number;
  amount: number; // USD
}

/**
 * Compute the shipping fee in USD.
 * @param items       line items (product_type + quantity)
 * @param subtotalUsd order value used for insurance + free-shipping check
 * @param country     ISO-2 destination country code
 */
export function computeShipping(items: ShipItem[], subtotalUsd: number, country: string): ShippingBreakdown {
  const zone = zoneFor(country);

  const weightUnits = items.reduce((sum, i) => sum + weightUnitsFor(i.product_type) * (i.quantity || 1), 0);

  // Free domestic shipping over the threshold.
  if (zone === 'domestic' && subtotalUsd >= FREE_SHIPPING_THRESHOLD_USD) {
    return { zone, freeApplied: true, weightUnits, amount: 0 };
  }

  const rate = ZONE_RATES[zone];
  const raw = rate.base + weightUnits * rate.perUnit + subtotalUsd * rate.insurance;
  return { zone, freeApplied: false, weightUnits, amount: +raw.toFixed(2) };
}

/** Convenience: shipping in integer cents (for payment providers). */
export function computeShippingCents(items: ShipItem[], subtotalCents: number, country: string): number {
  const { amount } = computeShipping(items, subtotalCents / 100, country);
  return Math.round(amount * 100);
}
