import type { Listing, SoldListing, SectionCategory, ListingTag } from './types';
import { MATCHES, getStadium, getCityForStadium } from './world-cup';

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic pseudo-random generator (mulberry32) so server & client render
// identical data — no hydration mismatches.
// ─────────────────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEATING SECTIONS — base price band per category (USD per ticket)
// ─────────────────────────────────────────────────────────────────────────────
export interface SectionConfig {
  category: SectionCategory;
  short: string;
  tier: 'Field' | 'Lower' | 'Club' | 'Mid' | 'Upper';
  min: number;
  max: number;
  blurb: string;
  proximity: number; // 1 (closest) .. 9 (farthest) for "Closest Seats" sort
}

export const SECTIONS: SectionConfig[] = [
  { category: 'VIP Hospitality',     short: 'VIP',    tier: 'Field', min: 5000, max: 25000, proximity: 1, blurb: 'All-inclusive premium hospitality with lounge access, gourmet dining & padded field-side seating.' },
  { category: 'Premium Club Seats',  short: 'CLUB',   tier: 'Club',  min: 2000, max: 8000,  proximity: 2, blurb: 'Climate-controlled club level with in-seat service, exclusive concourse & wide cushioned seats.' },
  { category: 'Lower Level Sideline', short: 'LWR-S', tier: 'Lower', min: 800,  max: 4000,  proximity: 2, blurb: 'Prime sideline views along the touchline — the best seats in the house for the action.' },
  { category: 'Lower Corner',        short: 'LWR-C',  tier: 'Lower', min: 700,  max: 3000,  proximity: 3, blurb: 'Lower-bowl corner seating with excellent proximity to the pitch at a friendlier price.' },
  { category: 'Goal End',            short: 'GOAL',   tier: 'Lower', min: 350,  max: 1400,  proximity: 4, blurb: 'Behind the goal with the loudest supporters — pure atmosphere and celebration central.' },
  { category: 'Mid-Level',           short: 'MID',    tier: 'Mid',   min: 400,  max: 1500,  proximity: 5, blurb: 'Elevated mid-tier seating with balanced, panoramic views of the entire field.' },
  { category: 'Upper Level',         short: 'UPR',    tier: 'Upper', min: 150,  max: 600,   proximity: 7, blurb: 'Budget-friendly upper deck — be part of the 80,000-strong World Cup crowd.' },
  { category: 'Family Section',      short: 'FAM',    tier: 'Mid',   min: 180,  max: 700,   proximity: 6, blurb: 'Alcohol-free family-friendly zone with clear sightlines and easy concourse access.' },
  { category: 'Accessible Seating',  short: 'ADA',    tier: 'Lower', min: 200,  max: 900,   proximity: 3, blurb: 'Wheelchair-accessible & companion seating with step-free access and clear views.' },
];

export const SECTION_BY_CATEGORY: Record<SectionCategory, SectionConfig> =
  Object.fromEntries(SECTIONS.map((s) => [s.category, s])) as Record<SectionCategory, SectionConfig>;

export const SECTION_CATEGORIES: SectionCategory[] = SECTIONS.map((s) => s.category);

const SELLER_NAMES = [
  'GoldenBoot Tickets', 'WorldCupVault', 'Azteca Resale', 'PitchsidePro', 'KickOff Exchange',
  'La Albiceleste Seats', 'TopCorner Tickets', 'StadiumDirect', 'MatchdayHub', 'FanFirst Resale',
  'EliteSeats Co.', 'TheTwelfthMan', 'Verified Reseller', 'GlobalGoals Tickets', 'TouchlineTrade',
  'PremiumPitch', 'CupFinal Seats', 'SambaSeats', 'Maple Leaf Tickets', 'Sol de Mayo Resale',
];

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}
function round(n: number, to = 1): number {
  return Math.round(n / to) * to;
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTING GENERATION
// ─────────────────────────────────────────────────────────────────────────────
function generateListingsForMatch(matchId: string): Listing[] {
  const match = MATCHES.find((m) => m.id === matchId);
  if (!match) return [];
  const rand = mulberry32(hashStr(matchId));
  const listings: Listing[] = [];

  // Importance drives where prices sit within each band, plus a knockout premium.
  const imp = match.importance / 10; // 0.1 .. 1
  const isFinal = match.stage === 'Final';
  const knockoutBoost =
    match.stage === 'Final' ? 2.4 :
    match.stage === 'Semi-final' ? 1.7 :
    match.stage === 'Quarter-final' ? 1.4 :
    match.stage === 'Round of 16' ? 1.2 :
    match.stage === 'Round of 32' ? 1.1 : 1;

  let idx = 0;
  for (const sec of SECTIONS) {
    // More listings for popular sections of big matches.
    const baseCount = sec.tier === 'Upper' || sec.tier === 'Mid' ? 4 : 3;
    const count = Math.max(2, Math.round(baseCount * (0.6 + imp) * (isFinal ? 1.6 : 1)));

    for (let i = 0; i < count; i++) {
      const r = rand();
      // Position price within band, skewed up by importance.
      const within = Math.min(1, Math.max(0, imp * 0.7 + r * 0.6 - 0.15));
      let price = sec.min + (sec.max - sec.min) * within;
      price *= knockoutBoost;
      // Final premium seats go significantly higher.
      if (isFinal && (sec.tier === 'Field' || sec.tier === 'Club')) price *= 1.6;
      // Round to a clean resale figure.
      const step = price > 5000 ? 250 : price > 1500 ? 50 : price > 500 ? 25 : 5;
      price = round(price, step);

      const quantity = pick([1, 2, 2, 2, 3, 4, 4], rand());
      const ticketsRemaining = quantity * pick([1, 1, 2, 3, 5, 8], rand());
      const sellerRating = round(4.2 + rand() * 0.8, 0.1);
      const sellerReviews = 20 + Math.floor(rand() * 4800);

      // Tags
      let tag: ListingTag = null;
      const tagRoll = rand();
      if (within < 0.4 && tagRoll < 0.4) tag = 'Best Value';
      else if (imp > 0.7 && tagRoll > 0.78) tag = 'Hot Deal';
      else if (ticketsRemaining <= 2 && tagRoll > 0.5) tag = 'Only A Few Left';

      const sectionNum = 100 + Math.floor(rand() * 540);
      const sectionLetter = pick(['', '', 'A', 'B', 'C'], rand());
      const rowNum =
        sec.tier === 'Field' ? pick(['AA', 'BB', 'A', 'B', '1', '2'], rand()) :
        String(1 + Math.floor(rand() * 34));

      listings.push({
        id: `${matchId}-l${idx++}`,
        matchId,
        category: sec.category,
        sectionCode: `${sectionLetter}${sectionNum}`,
        row: rowNum,
        seatStart: 1 + Math.floor(rand() * 24),
        quantity,
        ticketsRemaining,
        pricePerTicket: Math.max(sec.min, Math.round(price)),
        sellerName: pick(SELLER_NAMES, rand()),
        sellerRating,
        sellerReviews,
        instantDelivery: rand() > 0.25,
        mobileTicket: rand() > 0.1,
        tag,
        distanceFromPitch: sec.proximity * 10 + Math.floor(rand() * 9),
      });
    }
  }

  return listings.sort((a, b) => a.pricePerTicket - b.pricePerTicket);
}

// Memoised per-match cache (module-level, computed once).
const LISTING_CACHE = new Map<string, Listing[]>();
export function getListingsForMatch(matchId: string): Listing[] {
  if (!LISTING_CACHE.has(matchId)) {
    LISTING_CACHE.set(matchId, generateListingsForMatch(matchId));
  }
  return LISTING_CACHE.get(matchId)!;
}

let ALL_LISTINGS: Listing[] | null = null;
export function getAllListings(): Listing[] {
  if (!ALL_LISTINGS) {
    ALL_LISTINGS = MATCHES.flatMap((m) => getListingsForMatch(m.id));
  }
  return ALL_LISTINGS;
}

export function countListingsForMatch(matchId: string): number {
  return getListingsForMatch(matchId).length;
}
export function cheapestForMatch(matchId: string): number {
  const ls = getListingsForMatch(matchId);
  return ls.length ? ls[0].pricePerTicket : 0;
}
export function ticketsAvailableForMatch(matchId: string): number {
  return getListingsForMatch(matchId).reduce((s, l) => s + l.ticketsRemaining, 0);
}

export function listingsByCategoryForMatch(matchId: string): Record<string, Listing[]> {
  const out: Record<string, Listing[]> = {};
  for (const l of getListingsForMatch(matchId)) {
    (out[l.category] ||= []).push(l);
  }
  return out;
}

// Global marketplace stats (for live counters).
export function marketplaceStats() {
  const all = getAllListings();
  const totalTickets = all.reduce((s, l) => s + l.ticketsRemaining, 0);
  return {
    totalListings: all.length,
    totalTickets,
    activeMatches: MATCHES.length,
    hostCities: 16,
    avgSellerRating: 4.8,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECENTLY SOLD (deterministic)
// ─────────────────────────────────────────────────────────────────────────────
let SOLD_CACHE: SoldListing[] | null = null;
export function getRecentlySold(): SoldListing[] {
  if (SOLD_CACHE) return SOLD_CACHE;
  const rand = mulberry32(987654321);
  const big = [...MATCHES].sort((a, b) => b.importance - a.importance);
  const out: SoldListing[] = [];
  for (let i = 0; i < 14; i++) {
    const m = big[i % big.length];
    const sec = pick(SECTIONS, rand());
    const within = rand();
    let price = sec.min + (sec.max - sec.min) * (0.3 + within * 0.6);
    if (m.stage === 'Final') price *= 2;
    const city = getCityForStadium(m.stadiumId)?.name ?? '';
    out.push({
      id: `sold-${i}`,
      matchLabel: `${m.home.flag} ${m.home.code} vs ${m.away.code} ${m.away.flag}`,
      category: sec.category,
      price: Math.round(price),
      quantity: pick([1, 2, 2, 4], rand()),
      soldMinutesAgo: 1 + Math.floor(rand() * 180),
      city,
    });
  }
  SOLD_CACHE = out.sort((a, b) => a.soldMinutesAgo - b.soldMinutesAgo);
  return SOLD_CACHE;
}

// Trending = highest importance upcoming matches.
export function getTrendingMatches(limit = 6) {
  return [...MATCHES]
    .sort((a, b) => b.importance - a.importance || a.dateISO.localeCompare(b.dateISO))
    .slice(0, limit);
}

export function getFeaturedMatches(limit = 8) {
  // A balanced mix: a few group marquees + knockout headliners, by date.
  return [...MATCHES]
    .filter((m) => m.importance >= 8)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .slice(0, limit);
}
