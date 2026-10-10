-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: store_orders is missing the payment_method column, so order inserts fail.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
