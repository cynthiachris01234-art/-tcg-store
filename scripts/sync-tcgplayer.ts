#!/usr/bin/env node
/**
 * Apex TCG — TCGplayer API sync script
 *
 * Fetches products and prices from the official TCGplayer API and upserts
 * them into the Supabase single_cards table.
 *
 * Usage:
 *   npm run sync-tcgplayer                  # sync all configured categories
 *   npm run sync-tcgplayer -- --cat=3       # sync Pokemon only
 *   npm run sync-tcgplayer -- --set=SV3.5   # sync one set (by name/code)
 *   npm run sync-tcgplayer -- --limit=500   # limit rows (for testing)
 *
 * Required env vars in .env.local:
 *   TCGPLAYER_CLIENT_ID       ← from developer.tcgplayer.com
 *   TCGPLAYER_CLIENT_SECRET
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * TCGplayer category IDs used:
 *   1  = Magic: The Gathering
 *   2  = Yu-Gi-Oh!
 *   3  = Pokémon
 *   65 = One Piece Card Game
 */

import fs   from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Load .env.local ──────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── Config ───────────────────────────────────────────────────────────────────

const TCGPLAYER_BASE   = 'https://api.tcgplayer.com';
const TCGPLAYER_API_V  = 'v1.37.0';            // bump when TCGplayer releases new versions
const BATCH_SIZE       = 250;                   // products per upsert batch
const PRICE_CHUNK      = 250;                   // max product IDs per pricing call (API limit)
const PAGE_SIZE        = 100;                   // API page size (max 100)

const CLIENT_ID        = process.env.TCGPLAYER_CLIENT_ID        ?? '';
const CLIENT_SECRET    = process.env.TCGPLAYER_CLIENT_SECRET     ?? '';
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY   ?? '';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: TCGPLAYER_CLIENT_ID and TCGPLAYER_CLIENT_SECRET must be set in .env.local');
  console.error('Get your credentials at: https://developer.tcgplayer.com/');
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

// TCGplayer category → Apex brand mapping
const CATEGORY_BRAND: Record<number, string> = {
  1:  'mtg',
  2:  'yugioh',
  3:  'pokemon',
  65: 'onepiece',
};

// Default categories to sync when no --cat flag is given
const DEFAULT_CATEGORIES = [3, 65, 1, 2]; // Pokemon, One Piece, MTG, Yu-Gi-Oh

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── TCGplayer auth ───────────────────────────────────────────────────────────

let _token = '';
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(`${TCGPLAYER_BASE}/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TCGplayer auth failed ${res.status}: ${text}`);
  }
  const data = await res.json() as { access_token: string; expires_in: number };
  _token       = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  return _token;
}

async function tcgGet(path: string): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${TCGPLAYER_BASE}/${TCGPLAYER_API_V}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TCGplayer GET ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── TCGplayer API types ──────────────────────────────────────────────────────

interface TCGProduct {
  productId:       number;
  name:            string;
  cleanName:       string;
  imageUrl:        string;
  categoryId:      number;
  groupId:         number;   // set ID
  url:             string;
  modifiedOn:      string;
  imageCount:      number;
  presaleInfo:     unknown;
  extendedData:    { name: string; displayName: string; value: string }[];
  isFoil:          boolean;
}

interface TCGGroup {
  groupId:       number;
  name:          string;
  abbreviation:  string;
  publishedOn:   string;
  categoryId:    number;
}

interface TCGPrice {
  productId:     number;
  lowPrice:      number | null;
  midPrice:      number | null;
  highPrice:     number | null;
  marketPrice:   number | null;
  directLowPrice:number | null;
  subTypeName:   string;       // "Normal", "Foil", "Holofoil", "Reverse Holofoil"
}

interface TCGApiResponse<T> {
  totalItems: number;
  success:    boolean;
  errors:     string[];
  results:    T[];
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchAllGroups(categoryId: number): Promise<TCGGroup[]> {
  const res = await tcgGet(
    `/catalog/categories/${categoryId}/groups?offset=0&limit=500`
  ) as TCGApiResponse<TCGGroup>;
  return res.results ?? [];
}

async function fetchProductsForGroup(groupId: number): Promise<TCGProduct[]> {
  const all: TCGProduct[] = [];
  let offset = 0;
  while (true) {
    const res = await tcgGet(
      `/catalog/products?groupId=${groupId}&offset=${offset}&limit=${PAGE_SIZE}&getExtendedFields=true`
    ) as TCGApiResponse<TCGProduct>;
    const items = res.results ?? [];
    all.push(...items);
    if (all.length >= res.totalItems || items.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

async function fetchPrices(productIds: number[]): Promise<Map<number, TCGPrice>> {
  const map = new Map<number, TCGPrice>();
  for (let i = 0; i < productIds.length; i += PRICE_CHUNK) {
    const chunk = productIds.slice(i, i + PRICE_CHUNK);
    try {
      const res = await tcgGet(
        `/pricing/product/${chunk.join(',')}`
      ) as TCGApiResponse<TCGPrice>;
      for (const p of res.results ?? []) {
        // Prefer "Normal" subtype price; fall back to first available
        const existing = map.get(p.productId);
        if (!existing || p.subTypeName === 'Normal') {
          map.set(p.productId, p);
        }
      }
    } catch (e) {
      console.warn(`  ⚠ Price fetch failed for chunk starting at ${chunk[0]}: ${e}`);
    }
  }
  return map;
}

// ─── Extended data helpers ────────────────────────────────────────────────────

function extField(product: TCGProduct, field: string): string {
  return product.extendedData?.find(d => d.name === field)?.value?.trim() ?? '';
}

// ─── Slug & ID ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSlug(brand: string, setCode: string, cardNumber: string, condition: string, lang: string): string {
  return [brand, slugify(setCode), slugify(cardNumber), condition, lang].filter(Boolean).join('-');
}

// ─── Map TCGplayer product → Supabase row ─────────────────────────────────────

interface CardRow {
  id: string;
  slug: string;
  tcgplayer_product_id: string;
  brand: string;
  language: string;
  category: string;
  card_name: string;
  set_name: string;
  set_code: string;
  card_number: string | null;
  rarity: string | null;
  printing: string;
  condition: string;
  stock_quantity: number;
  image_url: string | null;
  release_date: string | null;
  market_price_usd: number;
  our_price_usd: number;
  low_price_usd: number | null;
  mid_price_usd: number | null;
  high_price_usd: number | null;
  is_pre_order: boolean;
  last_price_sync: string;
}

function mapProduct(
  product: TCGProduct,
  group:   TCGGroup,
  price:   TCGPrice | undefined,
  brand:   string,
  lang:    string,
): CardRow {
  const cardNumber = extField(product, 'Number');
  const rarity     = extField(product, 'Rarity') || null;
  const printing   = product.isFoil ? 'Foil' : (extField(product, 'Printing') || 'Standard');
  const setCode    = group.abbreviation || String(group.groupId);
  const condition  = 'nm'; // TCGplayer listed prices are for NM unless otherwise noted
  const tcgId      = String(product.productId);

  const slug = buildSlug(brand, setCode, cardNumber || tcgId, condition, lang);
  const id   = `${brand}-${tcgId}`;

  const marketPrice = price?.marketPrice ?? price?.midPrice ?? 0;
  const midPrice    = price?.midPrice ?? price?.marketPrice ?? 0;

  // Release date: group.publishedOn is like "2023-09-22T00:00:00"
  const releaseDate = group.publishedOn
    ? group.publishedOn.split('T')[0]
    : null;

  return {
    id,
    slug,
    tcgplayer_product_id: tcgId,
    brand,
    language: lang,
    category: CATEGORY_BRAND[product.categoryId] ? `${brand} Singles` : 'TCG Singles',
    card_name: product.name,
    set_name:  group.name,
    set_code:  setCode,
    card_number: cardNumber || null,
    rarity,
    printing,
    condition,
    stock_quantity: 0,        // TCGplayer API doesn't expose stock; update manually
    image_url: product.imageUrl || `https://product-images.tcgplayer.com/fit-in/400x558/${tcgId}.jpg`,
    release_date: releaseDate,
    market_price_usd: marketPrice,
    our_price_usd:    midPrice || marketPrice,
    low_price_usd:    price?.lowPrice ?? null,
    mid_price_usd:    price?.midPrice ?? null,
    high_price_usd:   price?.highPrice ?? null,
    is_pre_order: false,
    last_price_sync: new Date().toISOString(),
  };
}

// ─── Upsert batch to Supabase ─────────────────────────────────────────────────

async function upsertBatch(rows: CardRow[]): Promise<{ ok: number; failed: number }> {
  const { error } = await supabase
    .from('single_cards')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false });
  if (error) {
    console.error(`  DB error: ${error.message}`);
    return { ok: 0, failed: rows.length };
  }
  return { ok: rows.length, failed: 0 };
}

// ─── Parse CLI flags ──────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const flags: { cat?: number; set?: string; limit?: number } = {};
  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, '').split('=');
    if (key === 'cat'   && val) flags.cat   = Number(val);
    if (key === 'set'   && val) flags.set   = val;
    if (key === 'limit' && val) flags.limit = Number(val);
  }
  return flags;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function syncCategory(categoryId: number, opts: { setFilter?: string; limit?: number }) {
  const brand = CATEGORY_BRAND[categoryId] ?? 'unknown';
  console.log(`\n▶ Category ${categoryId} (${brand})`);

  const groups = await fetchAllGroups(categoryId);
  console.log(`  ${groups.length} sets found`);

  const filteredGroups = opts.setFilter
    ? groups.filter(g =>
        g.name.toLowerCase().includes(opts.setFilter!.toLowerCase()) ||
        g.abbreviation.toLowerCase().includes(opts.setFilter!.toLowerCase())
      )
    : groups;

  if (filteredGroups.length === 0) {
    console.log(`  No sets match filter "${opts.setFilter}"`);
    return { ok: 0, failed: 0 };
  }

  let totalOk = 0;
  let totalFailed = 0;

  for (const group of filteredGroups) {
    process.stdout.write(`  Set: ${group.name} (${group.abbreviation || group.groupId})... `);

    let products: TCGProduct[];
    try {
      products = await fetchProductsForGroup(group.groupId);
    } catch (e) {
      console.log(`FAILED (${e})`);
      continue;
    }

    if (products.length === 0) { console.log('0 products, skipped'); continue; }
    if (opts.limit) products = products.slice(0, opts.limit);

    // Fetch prices for all products in this group
    const productIds = products.map(p => p.productId);
    const priceMap   = await fetchPrices(productIds);

    // Map to card rows (default to EN for most categories)
    const lang = 'en';
    const rows: CardRow[] = products.map(p =>
      mapProduct(p, group, priceMap.get(p.productId), brand, lang)
    );

    // Upsert in batches
    let groupOk = 0;
    let groupFailed = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const result = await upsertBatch(batch);
      groupOk     += result.ok;
      groupFailed += result.failed;
    }

    console.log(`${groupOk} upserted${groupFailed > 0 ? `, ${groupFailed} failed` : ''}`);
    totalOk     += groupOk;
    totalFailed += groupFailed;
  }

  return { ok: totalOk, failed: totalFailed };
}

async function main() {
  const opts = parseArgs();
  const categories = opts.cat ? [opts.cat] : DEFAULT_CATEGORIES;

  console.log(`\nApex TCG — TCGplayer Sync`);
  console.log(`──────────────────────────`);
  console.log(`Categories: ${categories.join(', ')}`);
  if (opts.set)   console.log(`Set filter: ${opts.set}`);
  if (opts.limit) console.log(`Row limit:  ${opts.limit}`);
  console.log(`Target:     ${SUPABASE_URL}\n`);

  // Verify auth
  try {
    await getToken();
    console.log('TCGplayer auth: OK');
  } catch (e) {
    console.error(`TCGplayer auth FAILED: ${e}`);
    process.exit(1);
  }

  let grandOk = 0;
  let grandFailed = 0;

  for (const cat of categories) {
    const result = await syncCategory(cat, { setFilter: opts.set, limit: opts.limit });
    grandOk     += result.ok;
    grandFailed += result.failed;
  }

  console.log(`\n──────────────────────────`);
  console.log(`Total upserted : ${grandOk}`);
  console.log(`Total failed   : ${grandFailed}`);
  console.log(`Done.\n`);

  process.exit(grandFailed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
