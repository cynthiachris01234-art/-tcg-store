# Goal26 — FIFA World Cup 2026™ Ticket Resale Marketplace ⚽

> A modern, premium ticket resale marketplace prototype for the **FIFA World Cup 2026**
> (USA · Canada · Mexico), styled after high-end platforms like SeatGeek and StubHub.

> ⚠️ **Fan-made prototype.** Not affiliated with, authorised by, or endorsed by FIFA.
> No real tickets are sold and no payments are processed. All teams, fixtures, prices
> and listings are illustrative **mock data**.

---

## Features

- **Hero homepage** — branded hero, search bar (“Search by Team, Stadium, City or Match”),
  live inventory counters, and a live **countdown to the World Cup Final**.
- **Featured / Trending matches** and a **Recently Sold** ticker.
- **104-match schedule** across all **16 host cities**, with stage, group and venue data.
- **Match pages** with an **interactive SVG stadium seating map** — click any section to
  filter listings; a colour-coded legend shows the cheapest price per tier.
- **Seating tiers**: VIP Hospitality, Premium Club Seats, Lower Level Sideline,
  Lower Corner, Goal End, Mid-Level, Upper Level, Family Section & Accessible Seating.
- **Hundreds of realistic listings** — section, row, seat, quantity, seller rating,
  instant-delivery & mobile-ticket badges, “Best Value” / “Hot Deal” tags, and live counts.
- **Browse Tickets** with filters (section, city, price band, quantity) and sorting
  (Lowest Price, Best Value, Closest Seats, VIP First).
- **Stadiums** directory + detail pages (capacity, roof, seating pricing, fixtures).
- **Sell Tickets** flow with a live payout estimator.
- **My Account** dashboard — purchased tickets (with QR digital-ticket mockups),
  active listings and a watchlist.
- **Secure Checkout** modal with a digital ticket + QR preview and Buyer Guarantee.
- Mobile-first, responsive, **dark mode** with FIFA-inspired **blue, white & gold** accents.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Framework| Next.js 14 (App Router) + TypeScript|
| Styling  | Tailwind CSS                        |
| Icons    | lucide-react                        |
| Data     | Deterministic in-memory mock data   |

All marketplace data is generated **deterministically** (seeded PRNG) so server and
client render identically — no database or API keys required to run.

---

## Project Structure

```
app/
├── page.tsx                  # Homepage
├── matches/page.tsx          # All matches + filters
├── match/[id]/page.tsx       # Match detail + interactive seating map
├── tickets/page.tsx          # Browse all listings + filters/sort
├── stadiums/page.tsx         # Stadium directory
├── stadiums/[id]/page.tsx    # Stadium detail
├── sell/page.tsx             # Sell tickets
└── account/page.tsx          # My Account dashboard

components/fifa/              # Marketplace UI (navbar, footer, cards,
                              # seating map, countdown, badges, QR ticket…)

lib/fifa/
├── types.ts                  # Domain types
├── world-cup.ts              # Cities, stadiums, teams, match schedule
├── listings.ts               # Seating sections + listing generation
└── format.ts                 # Price/date formatting helpers
```

---

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

No environment variables are required for the marketplace prototype.
