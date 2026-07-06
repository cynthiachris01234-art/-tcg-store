-- ─────────────────────────────────────────────────────────────────────────────
-- Apex TCG — Single Cards Table
-- Run this in the Supabase SQL Editor AFTER running schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS single_cards (
  -- identity
  id                    TEXT PRIMARY KEY,          -- e.g. "pokemon-615023"
  slug                  TEXT NOT NULL UNIQUE,      -- e.g. "pokemon-sv3pt5-006-165-nm-en"
  tcgplayer_product_id  TEXT UNIQUE,               -- TCGplayer numeric product ID

  -- classification
  brand                 TEXT NOT NULL,             -- pokemon | onepiece | mtg | yugioh | lorcana
  language              TEXT NOT NULL DEFAULT 'en',-- en | jp | kr
  category              TEXT,                      -- e.g. "Pokemon Cards", "Magic Singles"

  -- card identity
  card_name             TEXT NOT NULL,             -- "Charizard ex"
  set_name              TEXT NOT NULL,             -- "Scarlet & Violet 151"
  set_code              TEXT NOT NULL,             -- "SV3.5"
  card_number           TEXT,                      -- "006/165"
  rarity                TEXT,                      -- "Double Rare"
  printing              TEXT DEFAULT 'Standard',   -- "1st Edition" | "Unlimited" | "Standard"

  -- condition & stock
  condition             TEXT NOT NULL DEFAULT 'nm',-- nm | lp | mp | hp | damaged
  stock_quantity        INTEGER NOT NULL DEFAULT 0,

  -- media
  image_url             TEXT,

  -- dates
  release_date          TEXT,                      -- ISO date "2023-09-22"

  -- pricing (all USD)
  market_price_usd      NUMERIC(10,2) DEFAULT 0,  -- TCGplayer market price
  our_price_usd         NUMERIC(10,2) DEFAULT 0,  -- what we charge
  low_price_usd         NUMERIC(10,2),             -- TCGplayer low
  mid_price_usd         NUMERIC(10,2),             -- TCGplayer mid
  high_price_usd        NUMERIC(10,2),             -- TCGplayer high

  -- metadata
  is_pre_order          BOOLEAN NOT NULL DEFAULT FALSE,
  last_price_sync       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at (reuses the function defined in schema.sql)
CREATE TRIGGER single_cards_updated_at
  BEFORE UPDATE ON single_cards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE single_cards ENABLE ROW LEVEL SECURITY;

-- Public read (same as products table)
CREATE POLICY "Public read single_cards" ON single_cards
  FOR SELECT USING (true);

-- Service role can do everything (for the import script)
CREATE POLICY "Service role write single_cards" ON single_cards
  FOR ALL USING (auth.role() = 'service_role');

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_sc_brand         ON single_cards(brand);
CREATE INDEX idx_sc_language      ON single_cards(language);
CREATE INDEX idx_sc_set_code      ON single_cards(set_code);
CREATE INDEX idx_sc_rarity        ON single_cards(rarity);
CREATE INDEX idx_sc_condition     ON single_cards(condition);
CREATE INDEX idx_sc_card_name     ON single_cards USING gin(to_tsvector('english', card_name));
CREATE INDEX idx_sc_set_name      ON single_cards USING gin(to_tsvector('english', set_name));
CREATE INDEX idx_sc_price         ON single_cards(our_price_usd);
CREATE INDEX idx_sc_stock         ON single_cards(stock_quantity);
CREATE INDEX idx_sc_tcgplayer     ON single_cards(tcgplayer_product_id);
