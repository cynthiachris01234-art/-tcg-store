#!/usr/bin/env node
/**
 * Apex TCG — Sealed-product price sync
 *
 * Updates market_price_usd / our_price_usd in lib/mock-data.ts from a CSV.
 *
 * Usage:
 *   npx tsx scripts/sync-prices.ts prices.csv           ← dry run (report only)
 *   npx tsx scripts/sync-prices.ts prices.csv --apply   ← write changes
 *
 * CSV format (header row required):
 *   id,market_price
 *   poke-me02-en-box,410
 *   op-op13-en-box,450
 *
 * `id` is the product id from lib/mock-data.ts.
 * Both market_price_usd and our_price_usd are set to the new value
 * (current store policy: our price = market price).
 *
 * Rows whose id is not found are reported and skipped — nothing is guessed.
 *
 * Price data sources (in order of preference):
 *   1. TCGplayer API (developer.tcgplayer.com) — export market prices to CSV
 *   2. Manual lookup on tcgplayer.com / pricecharting.com
 * Card Kingdom / SCG / Troll and Toad have no public APIs; use their
 * CSV buylist exports if you obtain them.
 */

import fs   from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(__dirname, '..', 'lib', 'mock-data.ts');

function parseCSV(text: string): Array<{ id: string; price: number }> {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const idIdx    = header.indexOf('id');
  const priceIdx = header.findIndex(h => h === 'market_price' || h === 'price');
  if (idIdx === -1 || priceIdx === -1) {
    console.error('CSV must have "id" and "market_price" columns');
    process.exit(1);
  }
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    return { id: cols[idIdx]?.trim() ?? '', price: Number(cols[priceIdx]?.trim()) };
  }).filter(r => r.id);
}

function main() {
  const csvPath = process.argv[2];
  const apply   = process.argv.includes('--apply');

  if (!csvPath) {
    console.error('Usage: npx tsx scripts/sync-prices.ts <prices.csv> [--apply]');
    process.exit(1);
  }

  const rows = parseCSV(fs.readFileSync(path.resolve(process.cwd(), csvPath), 'utf8'));
  let source  = fs.readFileSync(DATA_FILE, 'utf8');

  const changes: string[] = [];
  const skipped: string[] = [];

  for (const { id, price } of rows) {
    if (!isFinite(price) || price <= 0) {
      skipped.push(`${id}: invalid price "${price}"`);
      continue;
    }

    // Locate this product's block: from its id line to the closing brace.
    const idMarker = `id: '${id}',`;
    const start = source.indexOf(idMarker);
    if (start === -1) {
      skipped.push(`${id}: not found in mock-data.ts`);
      continue;
    }
    const end   = source.indexOf('},', start);
    const block = source.slice(start, end);

    const m = block.match(/market_price_usd: ([\d.]+), our_price_usd: (?:d\()?([\d.]+)\)?/);
    if (!m) {
      skipped.push(`${id}: price line not found in block`);
      continue;
    }

    const oldMarket = Number(m[1]);
    if (oldMarket === price) continue; // no change needed

    const newBlock = block.replace(
      /market_price_usd: [\d.]+, our_price_usd: (?:d\()?[\d.]+\)?/,
      `market_price_usd: ${price}, our_price_usd: ${price}`
    );
    source = source.slice(0, start) + newBlock + source.slice(end);

    const pct = ((price - oldMarket) / oldMarket * 100).toFixed(1);
    changes.push(`${id}: $${oldMarket} → $${price} (${Number(pct) > 0 ? '+' : ''}${pct}%)`);
  }

  console.log(`\nPrice Sync ${apply ? '(APPLYING)' : '(dry run)'}`);
  console.log('──────────────────────────────');
  console.log(`Rows in CSV : ${rows.length}`);
  console.log(`Changes     : ${changes.length}`);
  changes.forEach(c => console.log('  ~ ' + c));
  console.log(`Skipped     : ${skipped.length}`);
  skipped.forEach(s => console.log('  ! ' + s));

  if (apply && changes.length > 0) {
    fs.writeFileSync(DATA_FILE, source, 'utf8');
    console.log(`\nWrote ${changes.length} price update(s) to lib/mock-data.ts`);
    console.log('Review with: git diff lib/mock-data.ts');
  } else if (!apply && changes.length > 0) {
    console.log('\nDry run — re-run with --apply to write changes.');
  } else {
    console.log('\nNo changes needed.');
  }
}

main();
