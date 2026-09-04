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

---

## Deploy (get a public URL)

The app is a standard Next.js 14 site with **no required environment variables**,
so it deploys anywhere that runs Next.js. Fastest path — **Vercel**:

### Option A — Vercel CLI (deploys this branch as-is)

```bash
# from the project folder, on the marketplace branch
npm i -g vercel        # or use: npx vercel
vercel                 # first run: log in + link project (accept the defaults)
vercel --prod          # promote to a production https:// URL
```

Vercel auto-detects Next.js — accept the defaults (build `next build`,
output `.next`). You'll get a live `https://<project>.vercel.app` URL.

### Option B — Vercel dashboard (Git integration)

1. Push this branch to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the
   `-tcg-store` repository.
3. Under **Settings → Git**, set the Production Branch to
   `claude/fifa-2026-ticket-marketplace-tel1ro` (or merge it into `main` first).
4. Click **Deploy** — no env vars needed. Every push then redeploys automatically.

> The legacy store's Stripe/Supabase API routes are unused by the marketplace and
> build cleanly without keys. Add those env vars later only if you wire up real payments.

Other hosts (Netlify, Render, a Node server, Docker) work too — just run
`npm install && npm run build && npm run start`.

---

## Payment gateways

Checkout supports several payment methods through a single API route
(`POST /api/payments`). With **no keys configured it runs in safe demo mode**
(no real charge); adding a gateway's keys switches it to live automatically.

| Method | Provider (live mode) | Required env vars |
|--------|----------------------|-------------------|
| Credit / Debit Card | Stripe | `STRIPE_SECRET_KEY` |
| Apple Pay | Stripe | `STRIPE_SECRET_KEY` |
| Google Pay | Stripe | `STRIPE_SECRET_KEY` |
| Cash App Pay | Stripe | `STRIPE_SECRET_KEY` |
| PayPal | PayPal Orders API | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (`PAYPAL_ENV=live` for prod) |
| Crypto (BTC/ETH/USDC) | Coinbase Commerce | `COINBASE_COMMERCE_API_KEY` |
| Whop | Whop Checkout | `WHOP_API_KEY`, `WHOP_PLAN_ID` |

`GET /api/payments` returns the gateway list with each one's live/demo status.
The buyer picks a method in the checkout modal; the route creates the provider
session (Stripe PaymentIntent, PayPal order, or Coinbase charge) and returns a
`clientSecret` / `approveUrl` / `hostedUrl` to complete the flow.

> This is a prototype. Wire real order fulfilment and webhook verification
> before taking live payments.

---

## Careers site (Levy Real Estate)

`/careers` is a **separate, live surface** from the marketplace demo above. It
does not inherit the marketplace chrome: `components/SiteChrome.tsx` switches on
the pathname so careers routes render the Levy Real Estate header/footer on a
light theme, with **no FIFA navbar and no "design demo" ribbon**.

| Route | Purpose |
|-------|---------|
| `/careers` | Index of open positions (`lib/careers/posting.ts`) |
| `/careers/property-data-entry` | Job posting + application form |
| `/careers/apply` | `POST` endpoint that receives applications |
| `/careers/thank-you` | Confirmation screen (noindex) |
| `/careers/hiring-integrity` | How we contact applicants / recruitment-fraud notice |

### Setup

Applications are stored in Supabase, so **intake requires** `NEXT_PUBLIC_SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY`:

1. Run `supabase/careers-schema.sql` — it creates the `job_applications` table
   (RLS on, no policies, so only the service-role key can read it) and the
   **private** `career-applications` storage bucket.
2. Set the two Supabase env vars.
3. Optionally set `CAREERS_NOTIFY_EMAIL` (plus `RESEND_API_KEY` and `EMAIL_FROM`)
   to get an email when an application arrives.

> If Supabase is not configured the endpoint returns **503 and tells the applicant
> their details were not submitted**, rather than showing a success screen for an
> application that was never stored. Check this before going live.

### Handling applicant data

Applications carry personal data — name, phone, home city/state and a résumé
that typically contains a home address and full work history. Accordingly:

- Résumés go to a **private** bucket. Do not flip it to public; read them from
  the dashboard or via a short-lived signed URL.
- The table is written with the service-role key server-side only. RLS is
  enabled with no policies, so anon/authenticated clients get nothing.
- The notification email deliberately carries **no résumé attachment**.
- Nothing about an application is written to application logs.

### Form behaviour

- Validated on both sides; the server is authoritative (`lib/careers/application.ts`).
- Résumé must be PDF/DOC/DOCX and ≤ 5 MB.
- Works without JavaScript — the form has a real `action`, and the endpoint
  answers a plain form post with a `303` redirect instead of JSON.
- Honeypot field plus a per-instance rate limit (5 submissions / 10 min / IP).
  Put a platform-level limiter in front of it too.
- Note that some hosts cap request body size on serverless functions; confirm
  your platform allows a 5 MB upload.
