// ─── Enums ───────────────────────────────────────────────────────────────────

export type Brand = 'pokemon' | 'onepiece' | 'mtg' | 'yugioh';
export type Language = 'en' | 'jp' | 'kr';
export type ProductType =
  | 'booster_box'
  | 'case'
  | 'etb'               // Elite Trainer Box
  | 'upc'               // Ultra Premium Collection
  | 'spc'               // Super Premium Collection
  | 'bundle'            // Booster Bundle (3–5 packs)
  | 'premium_collection'// Premium Collection / PC ETB
  | 'display_case'      // JP Display Case (set of ETBs/products)
  | 'poster_collection';// Poster + promo collection
export type ProductCondition = 'sealed';
export type Currency = 'USD' | 'CAD' | 'EUR' | 'JPY' | 'KRW';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  brand: Brand;
  language: Language;
  product_type: ProductType;
  set_name: string;
  set_code: string;
  image_url: string;
  release_date: string;           // ISO date string
  stock_quantity: number;
  condition: ProductCondition;
  market_price_usd: number;       // synced from external APIs
  our_price_usd: number;          // market_price_usd * (1 - DISCOUNT_RATE)
  last_price_sync: string;        // ISO datetime
  is_pre_order: boolean;
  pre_order_date?: string;
  pack_count?: number;            // 36 for boxes
  box_count?: number;             // 6 for cases
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface ProductWithPricing extends Product {
  display_price: number;          // converted to selected currency
  display_market_price: number;
  savings_amount: number;
  savings_percent: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal_usd: number;
  bundle_discount: number;        // extra 5% when buying a case
  total_usd: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  user_id?: string;
  email: string;
  stripe_payment_intent_id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal_usd: number;
  discount_usd: number;
  total_usd: number;
  shipping_address: ShippingAddress;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_snapshot: Partial<Product>;
  quantity: number;
  unit_price_usd: number;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ─── Restock Alert ────────────────────────────────────────────────────────────

export interface RestockAlert {
  id: string;
  product_id: string;
  email: string;
  created_at: string;
  notified_at?: string;
}

// ─── Pre-order ────────────────────────────────────────────────────────────────

export interface PreOrder {
  id: string;
  product_id: string;
  email: string;
  quantity: number;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// ─── Deal / Flash Sale ────────────────────────────────────────────────────────

export interface Deal {
  id: string;
  title: string;
  description: string;
  product_ids: string[];
  extra_discount_percent: number;  // on top of the base 30%
  starts_at: string;
  ends_at: string;
  badge_label: string;
  is_active: boolean;
}

// ─── Price Source ─────────────────────────────────────────────────────────────

export interface PriceData {
  product_id: string;
  source: 'tcgplayer' | 'cardmarket' | 'bigweb' | 'naver' | 'manual';
  market_price_usd: number;
  synced_at: string;
}

// ─── Currency Exchange ────────────────────────────────────────────────────────

export interface ExchangeRates {
  base: 'USD';
  rates: Record<Currency, number>;
  updated_at: string;
}

// ─── Nav / Filter ─────────────────────────────────────────────────────────────

export interface FilterState {
  brand?: Brand;
  language?: Language;
  product_type?: ProductType;
  in_stock_only?: boolean;
  pre_order?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'release_date' | 'name';
  search?: string;
}

// ─── Brand Meta ───────────────────────────────────────────────────────────────

export interface BrandMeta {
  id: Brand;
  name: string;
  tagline: string;
  gradient: string;
  primaryColor: string;
  secondaryColor: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
}
