#!/usr/bin/env node
/**
 * Apex TCG — Single-card import script
 *
 * Usage:
 *   npx tsx scripts/import-cards.ts cards.csv
 *   npx tsx scripts/import-cards.ts cards.json
 *
 * Required env vars (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← service role for write access
 *
 * CSV columns (order doesn't matter, header row required):
 *   card_name, set_name, set_code, card_number, rarity, condition, language,
 *   printing, image_url, market_price, low_price, mid_price, high_price,
 *   tcgplayer_product_id, brand, category, stock_quantity, release_date
 *
 * JSON format: array of objects with the same field names.
 *
 * Behaviour:
 *   - Generates slug and id automatically.
 *   - Image URL: uses provided value; if blank + tcgplayer_product_id is set,
 *     falls back to https://product-images.tcgplayer.com/fit-in/400x558/{id}.jpg
 *   - Upserts on slug (no duplicates). Existing rows get price/stock updated.
 *   - Processes in batches of BATCH_SIZE (default 200).
 *   - Writes failures to import-errors-{timestamp}.log in current directory.
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

const BATCH_SIZE = 200;

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawRow {
  card_name?: string;
  set_name?: string;
  set_code?: string;
  card_number?: string;
  rarity?: string;
  condition?: string;
  language?: string;
  printing?: string;
  image_url?: string;
  market_price?: string | number;
  low_price?: string | number;
  mid_price?: string | number;
  high_price?: string | number;
  tcgplayer_product_id?: string | number;
  brand?: string;
  category?: string;
  stock_quantity?: string | number;
  release_date?: string;
  [key: string]: unknown;
}

interface CardRow {
  id: string;
  slug: string;
  tcgplayer_product_id: string | null;
  brand: string;
  language: string;
  category: string | null;
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

interface ImportError {
  row: number;
  card_name: string;
  reason: string;
  raw: RawRow;
}

// ─── Slug & ID helpers ────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\//g, '-')          // "006/165" → "006-165"
    .replace(/[^a-z0-9]+/g, '-') // spaces, dots, etc.
    .replace(/^-+|-+$/g, '');
}

const VALID_BRANDS   = new Set(['pokemon','onepiece','mtg','yugioh','lorcana']);
const VALID_LANGS    = new Set(['en','jp','kr']);
const VALID_CONDS    = new Set(['nm','lp','mp','hp','damaged']);

function generateSlug(r: RawRow): string {
  const brand   = slugify(r.brand ?? 'unknown');
  const setCode = slugify(r.set_code ?? 'unknown');
  const cardNum = r.card_number ? slugify(r.card_number) : '';
  const cond    = slugify(r.condition ?? 'nm');
  const lang    = slugify(r.language ?? 'en');
  const parts   = [brand, setCode, cardNum, cond, lang].filter(Boolean);
  return parts.join('-');
}

function generateId(r: RawRow, tcgId: string | null): string {
  if (tcgId) return `${(r.brand ?? 'card').toLowerCase()}-${tcgId}`;
  return generateSlug(r);
}

function num(v: string | number | undefined): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function numOrNull(v: string | number | undefined): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

// ─── Validation & mapping ─────────────────────────────────────────────────────

function mapRow(raw: RawRow, rowIndex: number): { card: CardRow | null; error: ImportError | null } {
  const errors: string[] = [];

  const cardName = (raw.card_name ?? '').trim();
  const setName  = (raw.set_name  ?? '').trim();
  const setCode  = (raw.set_code  ?? '').trim();
  const brand    = (raw.brand     ?? '').trim().toLowerCase();
  const lang     = (raw.language  ?? 'en').trim().toLowerCase();
  const cond     = (raw.condition ?? 'nm').trim().toLowerCase();

  if (!cardName)                        errors.push('card_name is required');
  if (!setName)                         errors.push('set_name is required');
  if (!setCode)                         errors.push('set_code is required');
  if (!brand)                           errors.push('brand is required');
  if (!VALID_BRANDS.has(brand))         errors.push(`brand "${brand}" must be one of: pokemon, onepiece, mtg, yugioh, lorcana`);
  if (!VALID_LANGS.has(lang))           errors.push(`language "${lang}" must be one of: en, jp, kr`);
  if (!VALID_CONDS.has(cond))           errors.push(`condition "${cond}" must be one of: nm, lp, mp, hp, damaged`);

  if (errors.length > 0) {
    return {
      card: null,
      error: { row: rowIndex, card_name: cardName || '(blank)', reason: errors.join('; '), raw },
    };
  }

  const tcgId    = raw.tcgplayer_product_id ? String(raw.tcgplayer_product_id).trim() : null;
  const slug     = generateSlug({ ...raw, brand, language: lang, condition: cond });
  const id       = generateId(raw, tcgId);
  const imgUrl   = (raw.image_url ?? '').trim()
    || (tcgId ? `https://product-images.tcgplayer.com/fit-in/400x558/${tcgId}.jpg` : null);

  const marketPrice = num(raw.market_price);
  const midPrice    = numOrNull(raw.mid_price);

  const card: CardRow = {
    id,
    slug,
    tcgplayer_product_id: tcgId,
    brand,
    language: lang,
    category:  (raw.category ?? '').trim() || null,
    card_name: cardName,
    set_name:  setName,
    set_code:  setCode,
    card_number: (raw.card_number ?? '').trim() || null,
    rarity:    (raw.rarity ?? '').trim() || null,
    printing:  (raw.printing ?? 'Standard').trim(),
    condition: cond,
    stock_quantity: Math.round(num(raw.stock_quantity)),
    image_url: imgUrl,
    release_date: (raw.release_date ?? '').trim() || null,
    market_price_usd: marketPrice,
    our_price_usd:    midPrice ?? marketPrice,
    low_price_usd:    numOrNull(raw.low_price),
    mid_price_usd:    midPrice,
    high_price_usd:   numOrNull(raw.high_price),
    is_pre_order: false,
    last_price_sync: new Date().toISOString(),
  };

  return { card, error: null };
}

// ─── CSV parser (handles quoted fields & embedded commas) ─────────────────────

function parseCSV(text: string): RawRow[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = splitCSVLine(line);
    const row: RawRow = {};
    headers.forEach((h, idx) => { row[h] = vals[idx]?.trim() ?? ''; });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-cards.ts <file.csv|file.json>');
    process.exit(1);
  }

  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const ext  = path.extname(absPath).toLowerCase();
  const text = fs.readFileSync(absPath, 'utf8');
  let rawRows: RawRow[];

  if (ext === '.json') {
    rawRows = JSON.parse(text) as RawRow[];
    if (!Array.isArray(rawRows)) { console.error('JSON must be an array'); process.exit(1); }
  } else if (ext === '.csv') {
    rawRows = parseCSV(text);
  } else {
    console.error(`Unsupported file type: ${ext}. Use .csv or .json`);
    process.exit(1);
  }

  console.log(`\nApex TCG Card Importer`);
  console.log(`─────────────────────────────`);
  console.log(`File   : ${filePath}`);
  console.log(`Rows   : ${rawRows.length}`);
  console.log(`Batch  : ${BATCH_SIZE}`);
  console.log(`Target : ${SUPABASE_URL}\n`);

  const errors: ImportError[] = [];
  const cards: CardRow[]      = [];

  // Validate & map all rows first
  rawRows.forEach((raw, i) => {
    const { card, error } = mapRow(raw, i + 2); // +2: 1-indexed + header row
    if (error) errors.push(error);
    else if (card) cards.push(card);
  });

  console.log(`Valid  : ${cards.length}`);
  console.log(`Invalid: ${errors.length}`);
  if (cards.length === 0) {
    console.log('\nNo valid rows to import.');
    writeErrorLog(errors);
    process.exit(errors.length > 0 ? 1 : 0);
  }

  // Batch upsert
  const batches = Math.ceil(cards.length / BATCH_SIZE);
  let imported  = 0;
  let dbErrors  = 0;

  for (let b = 0; b < batches; b++) {
    const batch = cards.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    process.stdout.write(`  Batch ${b + 1}/${batches} (${batch.length} rows)... `);

    const { error } = await supabase
      .from('single_cards')
      .upsert(batch, {
        onConflict: 'slug',
        ignoreDuplicates: false, // update prices/stock on conflict
      });

    if (error) {
      console.log(`FAILED: ${error.message}`);
      dbErrors += batch.length;
      batch.forEach((card, i) => {
        errors.push({
          row: b * BATCH_SIZE + i + 2,
          card_name: card.card_name,
          reason: `DB error: ${error.message}`,
          raw: card as unknown as RawRow,
        });
      });
    } else {
      console.log(`OK`);
      imported += batch.length;
    }
  }

  // Summary
  console.log(`\n─────────────────────────────`);
  console.log(`Imported : ${imported}`);
  console.log(`Failed   : ${errors.length} (validation: ${errors.length - dbErrors}, DB: ${dbErrors})`);

  if (errors.length > 0) {
    const logPath = writeErrorLog(errors);
    console.log(`Error log: ${logPath}`);
  }

  console.log(`Done.\n`);
  process.exit(errors.length > 0 ? 1 : 0);
}

function writeErrorLog(errors: ImportError[]): string {
  if (errors.length === 0) return '';
  const ts      = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.resolve(process.cwd(), `import-errors-${ts}.log`);
  const lines   = errors.map(e =>
    `Row ${e.row}: [${e.card_name}] ${e.reason}`
  );
  fs.writeFileSync(logPath, lines.join('\n') + '\n', 'utf8');
  return logPath;
}

main().catch(err => { console.error(err); process.exit(1); });
