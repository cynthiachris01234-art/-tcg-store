import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Brand, FilterState, Product } from '@/types';
import { getMockProducts, MOCK_PRODUCTS } from '@/lib/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Supabase is configured for ORDERS only — sealed products always use mock data
const isConfigured = false; // Set to true only when products table is populated
// single_cards table is queried from Supabase when URL + key are present
const isCardsConfigured = !!(supabaseUrl && supabaseAnonKey);

let _client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export function createAdminClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
    auth: { persistSession: false },
  });
}

// ─── Product queries ──────────────────────────────────────────────────────────

export async function getProducts(filters: FilterState & { search?: string } = {}): Promise<Product[]> {
  if (!isConfigured) return getMockProducts(filters);
  try {
    let query = db().from('products').select('*');
    if (filters.brand)         query = query.eq('brand', filters.brand);
    if (filters.language)      query = query.eq('language', filters.language);
    if (filters.product_type)  query = query.eq('product_type', filters.product_type);
    if (filters.in_stock_only) query = query.gt('stock_quantity', 0);
    if (filters.pre_order !== undefined) query = query.eq('is_pre_order', filters.pre_order);
    switch (filters.sort_by) {
      case 'price_asc':    query = query.order('our_price_usd', { ascending: true });  break;
      case 'price_desc':   query = query.order('our_price_usd', { ascending: false }); break;
      case 'release_date': query = query.order('release_date',  { ascending: false }); break;
      default:             query = query.order('created_at',    { ascending: false });
    }
    const { data } = await query;
    return (data ?? []) as Product[];
  } catch { return []; }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Check sealed products first (mock data)
  const sealed = MOCK_PRODUCTS.find(p => p.slug === slug);
  if (sealed) return sealed;
  // Fall back to single_cards table
  return getCardBySlug(slug);
}

// ─── Single-card queries ──────────────────────────────────────────────────────

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id:                   String(row.id),
    brand:                row.brand as Product['brand'],
    language:             (row.language ?? 'en') as Product['language'],
    product_type:         'single_card',
    set_name:             String(row.set_name),
    set_code:             String(row.set_code),
    image_url:            String(row.image_url ?? ''),
    release_date:         String(row.release_date ?? ''),
    stock_quantity:       Number(row.stock_quantity ?? 0),
    condition:            (row.condition ?? 'nm') as Product['condition'],
    market_price_usd:     Number(row.market_price_usd ?? 0),
    our_price_usd:        Number(row.our_price_usd ?? 0),
    last_price_sync:      String(row.last_price_sync ?? new Date().toISOString()),
    is_pre_order:         Boolean(row.is_pre_order),
    slug:                 String(row.slug),
    created_at:           String(row.created_at ?? new Date().toISOString()),
    updated_at:           String(row.updated_at ?? new Date().toISOString()),
    card_name:            row.card_name ? String(row.card_name) : undefined,
    card_number:          row.card_number ? String(row.card_number) : undefined,
    rarity:               row.rarity ? String(row.rarity) : undefined,
    printing:             row.printing ? String(row.printing) : undefined,
    low_price_usd:        row.low_price_usd != null ? Number(row.low_price_usd) : undefined,
    mid_price_usd:        row.mid_price_usd != null ? Number(row.mid_price_usd) : undefined,
    high_price_usd:       row.high_price_usd != null ? Number(row.high_price_usd) : undefined,
    tcgplayer_product_id: row.tcgplayer_product_id ? String(row.tcgplayer_product_id) : undefined,
    category:             row.category ? String(row.category) : undefined,
  };
}

export async function getCards(filters: FilterState & { search?: string; rarity?: string } = {}): Promise<Product[]> {
  if (!isCardsConfigured) return [];
  try {
    let q = db().from('single_cards').select('*');
    if (filters.brand)         q = q.eq('brand',    filters.brand);
    if (filters.language)      q = q.eq('language', filters.language);
    if (filters.in_stock_only) q = q.gt('stock_quantity', 0);
    if (filters.rarity)        q = q.eq('rarity',   filters.rarity);
    if (filters.search) {
      q = q.or(
        `card_name.ilike.%${filters.search}%,set_name.ilike.%${filters.search}%,set_code.ilike.%${filters.search}%,card_number.ilike.%${filters.search}%`
      );
    }
    switch (filters.sort_by) {
      case 'price_asc':    q = q.order('our_price_usd', { ascending: true });  break;
      case 'price_desc':   q = q.order('our_price_usd', { ascending: false }); break;
      case 'release_date': q = q.order('release_date',  { ascending: false }); break;
      default:             q = q.order('card_name',     { ascending: true });
    }
    const { data } = await q;
    return (data ?? []).map(rowToProduct);
  } catch { return []; }
}

export async function getCardBySlug(slug: string): Promise<Product | null> {
  if (!isCardsConfigured) return null;
  try {
    const { data } = await db().from('single_cards').select('*').eq('slug', slug).single();
    return data ? rowToProduct(data as Record<string, unknown>) : null;
  } catch { return null; }
}

export async function getNewReleases(limit = 8): Promise<Product[]> {
  if (!isConfigured) {
    // One product per set, so a large set (e.g. 40+ Marvel SKUs) can't fill
    // every slot and bury the other new releases.
    const seen = new Set<string>();
    return getMockProducts({ sort_by: 'release_date' })
      .filter(p => p.release_date >= '2026-01-01')
      .filter(p => {
        const key = `${p.brand}:${p.set_code}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await db()
      .from('products').select('*')
      .gte('release_date', today)
      .order('release_date', { ascending: true })
      .limit(limit);
    return (data ?? []) as Product[];
  } catch { return []; }
}

export async function getBestSellers(brand?: Brand, limit = 4): Promise<Product[]> {
  if (!isConfigured) return getMockProducts({ brand, in_stock_only: true }).slice(0, limit);
  try {
    let query = db()
      .from('products').select('*')
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (brand) query = query.eq('brand', brand);
    const { data } = await query;
    return (data ?? []) as Product[];
  } catch { return []; }
}

export async function getActiveDeals() {
  if (!isConfigured) return [];
  try {
    const now = new Date().toISOString();
    const { data } = await db()
      .from('deals').select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now);
    return data ?? [];
  } catch { return []; }
}

export async function subscribeRestockAlert(productId: string, email: string) {
  if (!isConfigured) return;
  await db().from('restock_alerts').upsert({ product_id: productId, email }, { onConflict: 'product_id,email' });
}

export async function subscribePreOrder(productId: string, email: string, quantity: number) {
  if (!isConfigured) return;
  await db().from('pre_orders').insert({ product_id: productId, email, quantity, status: 'pending' });
}
