-- ─────────────────────────────────────────────────────────────────────────────
-- TCG Vault — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand            TEXT NOT NULL CHECK (brand IN ('pokemon','onepiece','mtg','yugioh')),
  language         TEXT NOT NULL CHECK (language IN ('en','jp','kr')),
  product_type     TEXT NOT NULL CHECK (product_type IN ('booster_box','case')),
  set_name         TEXT NOT NULL,
  set_code         TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  image_url        TEXT,
  release_date     DATE NOT NULL,
  stock_quantity   INTEGER NOT NULL DEFAULT 0,
  condition        TEXT NOT NULL DEFAULT 'sealed',
  market_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  our_price_usd    NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_price_sync  TIMESTAMPTZ,
  is_pre_order     BOOLEAN NOT NULL DEFAULT FALSE,
  pre_order_date   DATE,
  pack_count       INTEGER,   -- 36 for booster boxes
  box_count        INTEGER,   -- 6 for cases
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ORDERS ───────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID,
  email                      TEXT NOT NULL,
  stripe_payment_intent_id   TEXT UNIQUE NOT NULL,
  status                     TEXT NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  items                      JSONB NOT NULL DEFAULT '[]',
  subtotal_usd               NUMERIC(10,2) NOT NULL,
  discount_usd               NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_usd                  NUMERIC(10,2) NOT NULL,
  shipping_address           JSONB NOT NULL DEFAULT '{}',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RESTOCK ALERTS ───────────────────────────────────────────────────────────

CREATE TABLE restock_alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at  TIMESTAMPTZ,
  UNIQUE (product_id, email)
);

-- ─── PRE-ORDERS ───────────────────────────────────────────────────────────────

CREATE TABLE pre_orders (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id               UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email                    TEXT NOT NULL,
  quantity                 INTEGER NOT NULL DEFAULT 1,
  stripe_payment_intent_id TEXT,
  status                   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','cancelled')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DEALS ────────────────────────────────────────────────────────────────────

CREATE TABLE deals (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT NOT NULL,
  description             TEXT,
  product_ids             UUID[] NOT NULL DEFAULT '{}',
  extra_discount_percent  NUMERIC(5,2) NOT NULL DEFAULT 0,
  starts_at               TIMESTAMPTZ NOT NULL,
  ends_at                 TIMESTAMPTZ NOT NULL,
  badge_label             TEXT NOT NULL DEFAULT 'DEAL',
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EXCHANGE RATES ───────────────────────────────────────────────────────────

CREATE TABLE exchange_rates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency   TEXT NOT NULL UNIQUE,
  rate       NUMERIC(12,6) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default rates
INSERT INTO exchange_rates (currency, rate) VALUES
  ('USD', 1.000000),
  ('CAD', 1.360000),
  ('EUR', 0.920000),
  ('JPY', 155.000000),
  ('KRW', 1340.000000);

-- ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

-- Decrement stock safely (called from webhook)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- Orders: users can read their own; service role can do anything
CREATE POLICY "Read own orders" ON orders
  FOR SELECT USING (email = current_setting('request.jwt.claims', true)::jsonb->>'email');

-- Restock alerts: anyone can insert
CREATE POLICY "Insert restock alert" ON restock_alerts
  FOR INSERT WITH CHECK (true);

-- Pre-orders: anyone can insert
CREATE POLICY "Insert pre-order" ON pre_orders
  FOR INSERT WITH CHECK (true);

-- Deals: public read
CREATE POLICY "Public read deals" ON deals
  FOR SELECT USING (true);

-- Exchange rates: public read
CREATE POLICY "Public read rates" ON exchange_rates
  FOR SELECT USING (true);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_products_brand        ON products(brand);
CREATE INDEX idx_products_language     ON products(language);
CREATE INDEX idx_products_type         ON products(product_type);
CREATE INDEX idx_products_slug         ON products(slug);
CREATE INDEX idx_products_release_date ON products(release_date);
CREATE INDEX idx_products_pre_order    ON products(is_pre_order);
CREATE INDEX idx_orders_email          ON orders(email);
CREATE INDEX idx_orders_stripe         ON orders(stripe_payment_intent_id);
CREATE INDEX idx_restock_product       ON restock_alerts(product_id);
CREATE INDEX idx_preorders_product     ON pre_orders(product_id);
