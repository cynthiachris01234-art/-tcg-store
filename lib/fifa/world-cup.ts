import type { HostCity, Stadium, Team, Match, Stage } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// HOST CITIES & STADIUMS — FIFA World Cup 2026 (USA · Canada · Mexico)
// ─────────────────────────────────────────────────────────────────────────────

export const STADIUMS: Stadium[] = [
  { id: 'metlife',   name: 'MetLife Stadium',        cityId: 'nynj',    cityName: 'New York / New Jersey', country: 'USA',    capacity: 82500, opened: 2010, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'sofi',      name: 'SoFi Stadium',           cityId: 'la',      cityName: 'Los Angeles',           country: 'USA',    capacity: 70240, opened: 2020, roof: 'Fixed Roof',      image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80' },
  { id: 'hardrock',  name: 'Hard Rock Stadium',      cityId: 'miami',   cityName: 'Miami',                 country: 'USA',    capacity: 65326, opened: 1987, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1540329957110-b87c0a0b1f64?auto=format&fit=crop&w=1200&q=80' },
  { id: 'att',       name: 'AT&T Stadium',           cityId: 'dallas',  cityName: 'Dallas',                country: 'USA',    capacity: 80000, opened: 2009, roof: 'Retractable Roof', image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'nrg',       name: 'NRG Stadium',            cityId: 'houston', cityName: 'Houston',               country: 'USA',    capacity: 72220, opened: 2002, roof: 'Retractable Roof', image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'mercedes',  name: 'Mercedes-Benz Stadium',  cityId: 'atlanta', cityName: 'Atlanta',               country: 'USA',    capacity: 71000, opened: 2017, roof: 'Retractable Roof', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80' },
  { id: 'lumen',     name: 'Lumen Field',            cityId: 'seattle', cityName: 'Seattle',               country: 'USA',    capacity: 69000, opened: 2002, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'levis',     name: "Levi's Stadium",         cityId: 'sf',      cityName: 'San Francisco Bay Area', country: 'USA',   capacity: 70909, opened: 2014, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80' },
  { id: 'linc',      name: 'Lincoln Financial Field', cityId: 'philly', cityName: 'Philadelphia',          country: 'USA',    capacity: 69596, opened: 2003, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1610214146998-fd8d8c5b3c2b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'gillette',  name: 'Gillette Stadium',       cityId: 'boston',  cityName: 'Boston',                country: 'USA',    capacity: 64628, opened: 2002, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
  { id: 'arrowhead', name: 'Arrowhead Stadium',      cityId: 'kc',      cityName: 'Kansas City',           country: 'USA',    capacity: 76416, opened: 1972, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1577223618563-3d858655e1f0?auto=format&fit=crop&w=1200&q=80' },
  { id: 'bmo',       name: 'BMO Field',              cityId: 'toronto', cityName: 'Toronto',               country: 'Canada', capacity: 45736, opened: 2007, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80' },
  { id: 'bcplace',   name: 'BC Place',               cityId: 'vancouver', cityName: 'Vancouver',           country: 'Canada', capacity: 54500, opened: 1983, roof: 'Retractable Roof', image: 'https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?auto=format&fit=crop&w=1200&q=80' },
  { id: 'azteca',    name: 'Estadio Azteca',         cityId: 'mexico',  cityName: 'Mexico City',           country: 'Mexico', capacity: 87523, opened: 1966, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
  { id: 'akron',     name: 'Estadio Akron',          cityId: 'guadalajara', cityName: 'Guadalajara',       country: 'Mexico', capacity: 48071, opened: 2010, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80' },
  { id: 'bbva',      name: 'Estadio BBVA',           cityId: 'monterrey', cityName: 'Monterrey',           country: 'Mexico', capacity: 53500, opened: 2015, roof: 'Open Air',        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80' },
];

export const HOST_CITIES: HostCity[] = [
  { id: 'nynj',    name: 'New York / New Jersey', country: 'USA',    stadiumId: 'metlife',   emoji: '🇺🇸', timezone: 'ET' },
  { id: 'la',      name: 'Los Angeles',           country: 'USA',    stadiumId: 'sofi',      emoji: '🇺🇸', timezone: 'PT' },
  { id: 'miami',   name: 'Miami',                 country: 'USA',    stadiumId: 'hardrock',  emoji: '🇺🇸', timezone: 'ET' },
  { id: 'dallas',  name: 'Dallas',                country: 'USA',    stadiumId: 'att',       emoji: '🇺🇸', timezone: 'CT' },
  { id: 'houston', name: 'Houston',               country: 'USA',    stadiumId: 'nrg',       emoji: '🇺🇸', timezone: 'CT' },
  { id: 'atlanta', name: 'Atlanta',               country: 'USA',    stadiumId: 'mercedes',  emoji: '🇺🇸', timezone: 'ET' },
  { id: 'seattle', name: 'Seattle',               country: 'USA',    stadiumId: 'lumen',     emoji: '🇺🇸', timezone: 'PT' },
  { id: 'sf',      name: 'San Francisco Bay Area', country: 'USA',   stadiumId: 'levis',     emoji: '🇺🇸', timezone: 'PT' },
  { id: 'philly',  name: 'Philadelphia',          country: 'USA',    stadiumId: 'linc',      emoji: '🇺🇸', timezone: 'ET' },
  { id: 'boston',  name: 'Boston',                country: 'USA',    stadiumId: 'gillette',  emoji: '🇺🇸', timezone: 'ET' },
  { id: 'kc',      name: 'Kansas City',           country: 'USA',    stadiumId: 'arrowhead', emoji: '🇺🇸', timezone: 'CT' },
  { id: 'toronto', name: 'Toronto',               country: 'Canada', stadiumId: 'bmo',       emoji: '🇨🇦', timezone: 'ET' },
  { id: 'vancouver', name: 'Vancouver',           country: 'Canada', stadiumId: 'bcplace',   emoji: '🇨🇦', timezone: 'PT' },
  { id: 'mexico',  name: 'Mexico City',           country: 'Mexico', stadiumId: 'azteca',    emoji: '🇲🇽', timezone: 'CT' },
  { id: 'guadalajara', name: 'Guadalajara',       country: 'Mexico', stadiumId: 'akron',     emoji: '🇲🇽', timezone: 'CT' },
  { id: 'monterrey', name: 'Monterrey',           country: 'Mexico', stadiumId: 'bbva',      emoji: '🇲🇽', timezone: 'CT' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────────────────────────────────────

export const TEAMS: Record<string, Team> = {
  USA: { code: 'USA', name: 'United States', flag: '🇺🇸', confederation: 'CONCACAF', fifaRank: 11 },
  CAN: { code: 'CAN', name: 'Canada',        flag: '🇨🇦', confederation: 'CONCACAF', fifaRank: 31 },
  MEX: { code: 'MEX', name: 'Mexico',        flag: '🇲🇽', confederation: 'CONCACAF', fifaRank: 17 },
  ARG: { code: 'ARG', name: 'Argentina',     flag: '🇦🇷', confederation: 'CONMEBOL', fifaRank: 1 },
  BRA: { code: 'BRA', name: 'Brazil',        flag: '🇧🇷', confederation: 'CONMEBOL', fifaRank: 5 },
  FRA: { code: 'FRA', name: 'France',        flag: '🇫🇷', confederation: 'UEFA',     fifaRank: 2 },
  ENG: { code: 'ENG', name: 'England',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA',  fifaRank: 4 },
  ESP: { code: 'ESP', name: 'Spain',         flag: '🇪🇸', confederation: 'UEFA',     fifaRank: 8 },
  GER: { code: 'GER', name: 'Germany',       flag: '🇩🇪', confederation: 'UEFA',     fifaRank: 16 },
  POR: { code: 'POR', name: 'Portugal',      flag: '🇵🇹', confederation: 'UEFA',     fifaRank: 6 },
  NED: { code: 'NED', name: 'Netherlands',   flag: '🇳🇱', confederation: 'UEFA',     fifaRank: 7 },
  BEL: { code: 'BEL', name: 'Belgium',       flag: '🇧🇪', confederation: 'UEFA',     fifaRank: 3 },
  ITA: { code: 'ITA', name: 'Italy',         flag: '🇮🇹', confederation: 'UEFA',     fifaRank: 9 },
  CRO: { code: 'CRO', name: 'Croatia',       flag: '🇭🇷', confederation: 'UEFA',     fifaRank: 10 },
  URU: { code: 'URU', name: 'Uruguay',       flag: '🇺🇾', confederation: 'CONMEBOL', fifaRank: 15 },
  COL: { code: 'COL', name: 'Colombia',      flag: '🇨🇴', confederation: 'CONMEBOL', fifaRank: 12 },
  JPN: { code: 'JPN', name: 'Japan',         flag: '🇯🇵', confederation: 'AFC',      fifaRank: 18 },
  KOR: { code: 'KOR', name: 'South Korea',   flag: '🇰🇷', confederation: 'AFC',      fifaRank: 23 },
  MAR: { code: 'MAR', name: 'Morocco',       flag: '🇲🇦', confederation: 'CAF',      fifaRank: 13 },
  SEN: { code: 'SEN', name: 'Senegal',       flag: '🇸🇳', confederation: 'CAF',      fifaRank: 20 },
  NGA: { code: 'NGA', name: 'Nigeria',       flag: '🇳🇬', confederation: 'CAF',      fifaRank: 28 },
  GHA: { code: 'GHA', name: 'Ghana',         flag: '🇬🇭', confederation: 'CAF',      fifaRank: 60 },
  SUI: { code: 'SUI', name: 'Switzerland',   flag: '🇨🇭', confederation: 'UEFA',     fifaRank: 19 },
  DEN: { code: 'DEN', name: 'Denmark',       flag: '🇩🇰', confederation: 'UEFA',     fifaRank: 21 },
  POL: { code: 'POL', name: 'Poland',        flag: '🇵🇱', confederation: 'UEFA',     fifaRank: 26 },
  AUS: { code: 'AUS', name: 'Australia',     flag: '🇦🇺', confederation: 'AFC',      fifaRank: 24 },
  ECU: { code: 'ECU', name: 'Ecuador',       flag: '🇪🇨', confederation: 'CONMEBOL', fifaRank: 27 },
  SAU: { code: 'SAU', name: 'Saudi Arabia',  flag: '🇸🇦', confederation: 'AFC',      fifaRank: 56 },
  QAT: { code: 'QAT', name: 'Qatar',         flag: '🇶🇦', confederation: 'AFC',      fifaRank: 37 },
  CRC: { code: 'CRC', name: 'Costa Rica',    flag: '🇨🇷', confederation: 'CONCACAF', fifaRank: 52 },
  IRN: { code: 'IRN', name: 'Iran',          flag: '🇮🇷', confederation: 'AFC',      fifaRank: 22 },
  EGY: { code: 'EGY', name: 'Egypt',         flag: '🇪🇬', confederation: 'CAF',      fifaRank: 33 },
};

const T = (code: string) => TEAMS[code];

// ─────────────────────────────────────────────────────────────────────────────
// MATCH SCHEDULE — a representative slice across all 16 venues
// Group stage highlights + a full knockout bracket culminating in the Final
// at MetLife Stadium on 19 July 2026.
// ─────────────────────────────────────────────────────────────────────────────

interface Fixture {
  no: number;
  stage: Stage;
  group?: string;
  home: string;
  away: string;
  date: string;       // ISO kickoff
  stadium: string;
  importance: number;
  label?: string;
}

const FIXTURES: Fixture[] = [
  // ── Group Stage — Matchday 1 ──────────────────────────────────────────────
  { no: 1,  stage: 'Group Stage', group: 'A', home: 'MEX', away: 'CRC', date: '2026-06-11T19:00:00-05:00', stadium: 'azteca',    importance: 8, label: 'Opening Match' },
  { no: 2,  stage: 'Group Stage', group: 'B', home: 'USA', away: 'QAT', date: '2026-06-12T19:00:00-04:00', stadium: 'metlife',   importance: 8 },
  { no: 3,  stage: 'Group Stage', group: 'C', home: 'CAN', away: 'AUS', date: '2026-06-12T18:00:00-04:00', stadium: 'bmo',       importance: 6 },
  { no: 4,  stage: 'Group Stage', group: 'D', home: 'ARG', away: 'SAU', date: '2026-06-13T16:00:00-04:00', stadium: 'mercedes',  importance: 8 },
  { no: 5,  stage: 'Group Stage', group: 'E', home: 'FRA', away: 'POL', date: '2026-06-13T13:00:00-07:00', stadium: 'sofi',      importance: 7 },
  { no: 6,  stage: 'Group Stage', group: 'F', home: 'ENG', away: 'IRN', date: '2026-06-14T15:00:00-04:00', stadium: 'hardrock',  importance: 7 },
  { no: 7,  stage: 'Group Stage', group: 'G', home: 'BRA', away: 'GHA', date: '2026-06-14T18:00:00-05:00', stadium: 'att',       importance: 8 },
  { no: 8,  stage: 'Group Stage', group: 'H', home: 'ESP', away: 'JPN', date: '2026-06-15T19:00:00-07:00', stadium: 'levis',     importance: 8 },
  { no: 9,  stage: 'Group Stage', group: 'I', home: 'GER', away: 'KOR', date: '2026-06-15T16:00:00-07:00', stadium: 'lumen',     importance: 7 },
  { no: 10, stage: 'Group Stage', group: 'J', home: 'POR', away: 'EGY', date: '2026-06-16T15:00:00-05:00', stadium: 'nrg',       importance: 7 },
  { no: 11, stage: 'Group Stage', group: 'K', home: 'NED', away: 'ECU', date: '2026-06-16T18:00:00-04:00', stadium: 'linc',      importance: 6 },
  { no: 12, stage: 'Group Stage', group: 'L', home: 'BEL', away: 'SEN', date: '2026-06-17T15:00:00-05:00', stadium: 'bbva',      importance: 6 },

  // ── Group Stage — Matchday 2 (marquee) ────────────────────────────────────
  { no: 13, stage: 'Group Stage', group: 'D', home: 'ARG', away: 'CRO', date: '2026-06-18T19:00:00-04:00', stadium: 'metlife',   importance: 9 },
  { no: 14, stage: 'Group Stage', group: 'E', home: 'FRA', away: 'URU', date: '2026-06-19T13:00:00-07:00', stadium: 'sofi',      importance: 8 },
  { no: 15, stage: 'Group Stage', group: 'B', home: 'USA', away: 'MAR', date: '2026-06-19T19:00:00-05:00', stadium: 'arrowhead', importance: 8 },
  { no: 16, stage: 'Group Stage', group: 'G', home: 'BRA', away: 'COL', date: '2026-06-20T18:00:00-04:00', stadium: 'hardrock',  importance: 9 },
  { no: 17, stage: 'Group Stage', group: 'F', home: 'ENG', away: 'DEN', date: '2026-06-20T15:00:00-04:00', stadium: 'gillette',  importance: 8 },
  { no: 18, stage: 'Group Stage', group: 'H', home: 'ESP', away: 'NGA', date: '2026-06-21T16:00:00-07:00', stadium: 'levis',     importance: 7 },
  { no: 19, stage: 'Group Stage', group: 'A', home: 'MEX', away: 'POL', date: '2026-06-21T19:00:00-06:00', stadium: 'akron',     importance: 8 },
  { no: 20, stage: 'Group Stage', group: 'I', home: 'GER', away: 'SUI', date: '2026-06-22T18:00:00-05:00', stadium: 'att',       importance: 7 },

  // ── Group Stage — Matchday 3 ──────────────────────────────────────────────
  { no: 21, stage: 'Group Stage', group: 'C', home: 'CAN', away: 'BEL', date: '2026-06-24T18:00:00-07:00', stadium: 'bcplace',   importance: 7 },
  { no: 22, stage: 'Group Stage', group: 'J', home: 'POR', away: 'URU', date: '2026-06-24T15:00:00-05:00', stadium: 'nrg',       importance: 8 },
  { no: 23, stage: 'Group Stage', group: 'K', home: 'NED', away: 'SEN', date: '2026-06-25T18:00:00-04:00', stadium: 'linc',      importance: 7 },
  { no: 24, stage: 'Group Stage', group: 'L', home: 'BEL', away: 'JPN', date: '2026-06-25T15:00:00-06:00', stadium: 'bbva',      importance: 7 },

  // ── Round of 32 ───────────────────────────────────────────────────────────
  { no: 73, stage: 'Round of 32', home: 'ARG', away: 'NGA', date: '2026-06-28T16:00:00-04:00', stadium: 'metlife',   importance: 8 },
  { no: 74, stage: 'Round of 32', home: 'FRA', away: 'KOR', date: '2026-06-29T13:00:00-07:00', stadium: 'sofi',      importance: 8 },
  { no: 75, stage: 'Round of 32', home: 'BRA', away: 'SEN', date: '2026-06-29T18:00:00-04:00', stadium: 'hardrock',  importance: 9 },
  { no: 76, stage: 'Round of 32', home: 'ENG', away: 'ECU', date: '2026-06-30T15:00:00-05:00', stadium: 'att',       importance: 8 },
  { no: 77, stage: 'Round of 32', home: 'ESP', away: 'MAR', date: '2026-07-01T16:00:00-07:00', stadium: 'levis',     importance: 8 },
  { no: 78, stage: 'Round of 32', home: 'POR', away: 'JPN', date: '2026-07-01T19:00:00-05:00', stadium: 'nrg',       importance: 8 },

  // ── Round of 16 ───────────────────────────────────────────────────────────
  { no: 89, stage: 'Round of 16', home: 'ARG', away: 'FRA', date: '2026-07-04T16:00:00-04:00', stadium: 'metlife',   importance: 10, label: 'Final Rematch' },
  { no: 90, stage: 'Round of 16', home: 'BRA', away: 'ENG', date: '2026-07-05T15:00:00-05:00', stadium: 'att',       importance: 9 },
  { no: 91, stage: 'Round of 16', home: 'ESP', away: 'GER', date: '2026-07-05T18:00:00-04:00', stadium: 'hardrock',  importance: 9 },
  { no: 92, stage: 'Round of 16', home: 'POR', away: 'NED', date: '2026-07-06T13:00:00-07:00', stadium: 'sofi',      importance: 9 },

  // ── Quarter-finals ────────────────────────────────────────────────────────
  { no: 97, stage: 'Quarter-final', home: 'ARG', away: 'BRA', date: '2026-07-09T19:00:00-04:00', stadium: 'metlife', importance: 10, label: 'Clásico' },
  { no: 98, stage: 'Quarter-final', home: 'FRA', away: 'ESP', date: '2026-07-10T16:00:00-07:00', stadium: 'sofi',    importance: 10 },
  { no: 99, stage: 'Quarter-final', home: 'ENG', away: 'POR', date: '2026-07-11T15:00:00-05:00', stadium: 'att',     importance: 9 },
  { no: 100, stage: 'Quarter-final', home: 'GER', away: 'NED', date: '2026-07-11T18:00:00-04:00', stadium: 'mercedes', importance: 9 },

  // ── Semi-finals ───────────────────────────────────────────────────────────
  { no: 101, stage: 'Semi-final', home: 'ARG', away: 'FRA', date: '2026-07-14T16:00:00-05:00', stadium: 'att',     importance: 10 },
  { no: 102, stage: 'Semi-final', home: 'ESP', away: 'ENG', date: '2026-07-15T16:00:00-04:00', stadium: 'mercedes', importance: 10 },

  // ── Third Place & Final ───────────────────────────────────────────────────
  { no: 103, stage: 'Third Place', home: 'FRA', away: 'ENG', date: '2026-07-18T15:00:00-04:00', stadium: 'hardrock', importance: 8, label: 'Third-Place Play-off' },
  { no: 104, stage: 'Final', home: 'ARG', away: 'ESP', date: '2026-07-19T15:00:00-04:00', stadium: 'metlife', importance: 10, label: 'FINAL' },
];

export const MATCHES: Match[] = FIXTURES.map((f) => ({
  id: `m${f.no}`,
  matchNo: f.no,
  stage: f.stage,
  group: f.group,
  home: T(f.home),
  away: T(f.away),
  dateISO: f.date,
  stadiumId: f.stadium,
  importance: f.importance,
  label: f.label,
}));

// ── Lookups ──────────────────────────────────────────────────────────────────
export const STADIUM_BY_ID: Record<string, Stadium> = Object.fromEntries(STADIUMS.map((s) => [s.id, s]));
export const CITY_BY_ID: Record<string, HostCity> = Object.fromEntries(HOST_CITIES.map((c) => [c.id, c]));

export function getMatch(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}
export function getStadium(id: string): Stadium | undefined {
  return STADIUM_BY_ID[id];
}
export function getCity(id: string): HostCity | undefined {
  return CITY_BY_ID[id];
}
export function getCityForStadium(stadiumId: string): HostCity | undefined {
  const st = STADIUM_BY_ID[stadiumId];
  return st ? CITY_BY_ID[st.cityId] : undefined;
}

// The Final — used for the homepage countdown.
export const FINAL_MATCH = MATCHES.find((m) => m.stage === 'Final')!;
export const WORLD_CUP_FINAL_DATE = FINAL_MATCH.dateISO;
