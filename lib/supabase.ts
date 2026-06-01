import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Brand, FilterState, Product } from '@/types';
import { getMockProducts, MOCK_PRODUCTS } from '@/lib/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Supabase is configured for ORDERS only — products always use mock data
const isConfigured = false; // Set to true only when products table is populated

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

export async function getProducts(filters: FilterState = {}): Promise<Product[]> {
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
  if (!isConfigured) return MOCK_PRODUCTS.find(p => p.slug === slug) ?? null;
  try {
    const { data } = await db().from('products').select('*').eq('slug', slug).single();
    return (data as Product) ?? null;
  } catch { return null; }
}

export async function getNewReleases(limit = 8): Promise<Product[]> {
  if (!isConfigured) return getMockProducts({ sort_by: 'release_date' })
    .filter(p => p.release_date >= '2026-01-01')
    .slice(0, limit);
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
