// ─────────────────────────────────────────────────────────────────────────────
// FIFA World Cup 2026 — Ticket Resale Marketplace · Domain types
// (Unofficial fan-made prototype. Not affiliated with or endorsed by FIFA.)
// ─────────────────────────────────────────────────────────────────────────────

export type Country = 'USA' | 'Canada' | 'Mexico';

export interface HostCity {
  id: string;
  name: string;
  country: Country;
  stadiumId: string;
  emoji: string;        // flag emoji
  timezone: string;
}

export interface Stadium {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  country: Country;
  capacity: number;
  opened: number;
  roof: 'Open Air' | 'Retractable Roof' | 'Fixed Roof';
  image: string;
}

export interface Team {
  code: string;         // 3-letter code
  name: string;
  flag: string;         // emoji
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  fifaRank: number;
}

export type Stage =
  | 'Group Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter-final'
  | 'Semi-final'
  | 'Third Place'
  | 'Final';

export interface Match {
  id: string;
  matchNo: number;
  stage: Stage;
  group?: string;       // A..L for group stage
  home: Team;
  away: Team;
  dateISO: string;      // kickoff in ISO
  stadiumId: string;
  importance: number;   // 1-10, drives pricing & "trending"
  label?: string;       // e.g. "Opening Match", "FINAL"
}

export type SectionCategory =
  | 'VIP Hospitality'
  | 'Premium Club Seats'
  | 'Lower Level Sideline'
  | 'Lower Corner'
  | 'Goal End'
  | 'Mid-Level'
  | 'Upper Level'
  | 'Accessible Seating'
  | 'Family Section';

export type ListingTag = 'Best Value' | 'Hot Deal' | 'Only A Few Left' | null;

export interface Listing {
  id: string;
  matchId: string;
  category: SectionCategory;
  sectionCode: string;  // e.g. "C124"
  row: string;
  seatStart: number;
  quantity: number;             // tickets in this listing (sold together)
  ticketsRemaining: number;     // remaining at this price point
  pricePerTicket: number;
  sellerName: string;
  sellerRating: number;         // out of 5
  sellerReviews: number;
  instantDelivery: boolean;
  mobileTicket: boolean;
  tag: ListingTag;
  distanceFromPitch: number;    // arbitrary metric for "Closest Seats" sort (lower = closer)
}

export interface SoldListing {
  id: string;
  matchLabel: string;
  category: SectionCategory;
  price: number;
  quantity: number;
  soldMinutesAgo: number;
  city: string;
}
