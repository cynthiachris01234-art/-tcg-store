// Server-only: price, store and announce orders. Shared by /api/orders and the
// Stripe confirmation route so both follow exactly the same rules.
import { createClient } from '@supabase/supabase-js';
import { notifyNewOrder } from '@/lib/notify';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { CASE_BUNDLE_RATE } from '@/lib/pricing';
import { computeShipping, type ShipItem } from '@/lib/shipping';
import { priceOf, multiBuyDiscount, qualifiesForGift, meetsMinimum, minOrderMessage } from '@/lib/promos';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const dbConfigured   = () => !!(supabaseUrl && serviceRoleKey && !serviceRoleKey.includes('placeholder'));

// Rebuild an order's line items and totals from the CURRENT catalog so a stale
// browser (cached old JS bundle) can never save an order at outdated prices.
// The server is the single source of truth for pricing.
export interface PricingOptions {
  at?: number;              // price as of this moment (e.g. when the customer started paying)
  freeShipping?: boolean;   // welcome-back offer
}

export function rebuildOrderPricing(rawItems: any[], country: string, opts: PricingOptions = {}) {
  const at = opts.at ?? Date.now();
  let subtotal = 0;
  let hasCase = false;
  const shipItems: ShipItem[] = [];

  const items = (rawItems ?? []).map((i: any) => {
    const productId = i.productId ?? i.product_id ?? i.id ?? '';
    const quantity  = i.quantity ?? 1;
    const current   = MOCK_PRODUCTS.find(p => p.id === productId);

    // Use current catalog price/details when the product is known; fall back to
    // the client-supplied values only for products no longer in the catalog.
    const unitPrice   = current ? priceOf(current, at) : (i.unitPrice ?? i.unit_price_usd ?? 0);
    const setName     = current ? current.set_name      : (i.setName   ?? i.set_name   ?? '');
    const brand       = current ? current.brand         : (i.brand     ?? '');
    const language    = current ? current.language      : (i.language  ?? '');
    const productType = current ? current.product_type  : (i.productType ?? i.product_type ?? '');
    const imageUrl    = current ? current.image_url     : (i.imageUrl  ?? i.image_url  ?? '');
    const lineTotal   = +(unitPrice * quantity).toFixed(2);

    subtotal += lineTotal;
    if (productType === 'case') hasCase = true;
    shipItems.push({ product_type: productType, quantity });

    return { productId, setName, brand, language, productType, imageUrl, quantity, unitPrice, total: lineTotal };
  });

  // Same rules as the cart (lib/cart.ts): multi-buy first, then the case bundle.
  subtotal = +subtotal.toFixed(2);
  const multibuy = multiBuyDiscount(items.map(i => ({ unitPrice: i.unitPrice, quantity: i.quantity, productType: i.productType })));
  const caseDisc = hasCase ? +((subtotal - multibuy) * CASE_BUNDLE_RATE).toFixed(2) : 0;
  const discount = +(multibuy + caseDisc).toFixed(2);
  const merch    = +(subtotal - discount).toFixed(2);
  const shipping = opts.freeShipping ? 0 : computeShipping(shipItems, merch, country).amount;
  const total    = +(merch + shipping).toFixed(2);
  return {
    items, subtotal, discount, multibuy, shipping, total, merch,
    freeGift: qualifiesForGift(merch),
    minimumError: meetsMinimum(merch) ? null : minOrderMessage(merch),
  };
}

// Insert an order, tolerating a store_orders table that predates newer columns
// (e.g. payment_method, shipping_usd). Postgres rejects the whole row for one
// unknown column, which would silently lose the order — so strip any column it
// doesn't know about, fold that value into the customer JSON (which is JSONB,
// so nothing is lost and the admin panel can still read it), and retry.
// Once the columns are added via SQL, the full row is stored natively instead.
async function insertOrderResilient(supabase: any, fullRow: Record<string, any>): Promise<string | null> {
  const row: Record<string, any> = { ...fullRow };
  const folded: Record<string, any> = {};

  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await supabase.from('store_orders').insert(row);
    if (!error) return null;

    const missing = error.message.match(/Could not find the '([^']+)' column/);
    if (!missing) return error.message; // a real error, not a schema mismatch

    const col = missing[1];
    if (!(col in row)) return error.message; // can't fix — avoid looping
    folded[col] = row[col];
    delete row[col];
    row.customer = { ...(fullRow.customer ?? {}), ...folded };
  }
  return 'store_orders schema mismatch: too many missing columns';
}

/** True if an order with this id is already stored (used to avoid double-recording). */
export async function orderExists(id: string, opts: { ignorePending?: boolean } = {}): Promise<boolean> {
  if (!dbConfigured()) return false;
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let q = supabase.from('store_orders').select('id').eq('id', id);
  if (opts.ignorePending) q = q.neq('status', 'checkout_started');
  const { data } = await q.limit(1);
  return !!(data && data.length);
}

export interface OrderInput {
  id: string;
  status: string;
  paymentMethod?: string;
  customer: any;
  items: any[];
}

/**
 * Price the order from the live catalog, notify the store, and save it.
 *
 * With `saveFirst`, the order is saved BEFORE notifying, and the notification
 * is skipped if the id already exists. Used for paid card orders, where the
 * success page and the Stripe webhook can both report the same payment at the
 * same moment — the database's unique order id makes only one of them win.
 */
export async function recordOrder(o: OrderInput, opts: { saveFirst?: boolean } & PricingOptions = {}) {
  const country = o.customer?.country ?? 'US';
  const priced = rebuildOrderPricing(o.items, country, opts);
  if (priced.freeGift) o = { ...o, customer: { ...(o.customer ?? {}), free_gift: 'booster pack' } };
  const row = {
    id:             o.id,
    status:         o.status,
    payment_method: o.paymentMethod,
    customer:       o.customer,
    items:          priced.items,
    subtotal_usd:   priced.subtotal,
    discount_usd:   priced.discount,
    shipping_usd:   priced.shipping,
    total_usd:      priced.total,
  };

  let dbError: string | null = null;
  if (opts.saveFirst && dbConfigured()) {
    dbError = await insertOrderResilient(createClient(supabaseUrl, serviceRoleKey), row);
    if (dbError && /duplicate key|already exists/i.test(dbError)) {
      return { priced, dbError: null, duplicate: true };   // someone else recorded it
    }
    if (dbError) console.error('Supabase insert error:', dbError);
  }

  await notifyNewOrder({
    id:            o.id,
    status:        o.status,
    paymentMethod: o.paymentMethod,
    customer:      o.customer,
    items: priced.items.map(i => ({
      setName: i.setName, brand: i.brand, language: i.language,
      quantity: i.quantity, unitPrice: i.unitPrice, total: i.total,
    })),
    subtotal_usd: priced.subtotal,
    discount_usd: priced.discount,
    shipping_usd: priced.shipping,
    total_usd:    priced.total,
    freeGift:     priced.freeGift,
  });

  if (!opts.saveFirst && dbConfigured()) {
    dbError = await insertOrderResilient(createClient(supabaseUrl, serviceRoleKey), row);
    if (dbError) console.error('Supabase insert error:', dbError);
  }
  return { priced, dbError, duplicate: false };
}
