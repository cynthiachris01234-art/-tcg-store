# TCG Vault 🃏

> Sealed Pokémon, One Piece, MTG & Yu-Gi-Oh! booster boxes and cases — always **30% below market price**.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 14 (App Router) + Tailwind CSS  |
| Backend     | Supabase (Postgres + Auth + Storage)    |
| Payments    | Stripe                                  |
| Emails      | Resend (restock alerts)                 |
| Deployment  | Vercel                                  |

---

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (v20 LTS recommended).

### 2. Install dependencies
```bash
cd tcg-store
npm install
```

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
# Fill in your keys — see .env.local.example for instructions
```

### 4. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to add sample products
4. Copy your **Project URL** and **Anon Key** into `.env.local`

### 5. Set up Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. Copy your **Publishable Key** and **Secret Key** into `.env.local`
3. Set up a webhook pointing to `/api/webhook` for `payment_intent.succeeded` events

### 6. Run the dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
tcg-store/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── shop/
│   │   ├── page.tsx              # All products
│   │   ├── [brand]/page.tsx      # Shop by brand
│   │   └── language/[lang]/page.tsx  # Shop by language
│   ├── product/[id]/page.tsx     # Product detail
│   ├── cases/page.tsx            # Cases section
│   ├── releases/page.tsx         # New releases calendar
│   ├── deals/page.tsx            # Deals & flash sales
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Stripe checkout
│   └── api/
│       ├── checkout/route.ts     # Create payment intent
│       ├── webhook/route.ts      # Stripe webhook handler
│       ├── pricing/sync/route.ts # Weekly price sync (cron)
│       └── restock/route.ts      # Restock email notifications
├── components/
│   ├── layout/   Navbar, Footer
│   ├── home/     HeroBanner, BrandSection, NewReleasesStrip, DealsBanner
│   ├── product/  ProductCard, ProductGrid, FilterBar
│   └── ui/       LanguageBadge, PriceTag, StockBadge
├── lib/
│   ├── supabase.ts   DB queries
│   ├── stripe.ts     Stripe client
│   ├── pricing.ts    Price sync logic
│   ├── currency.ts   Currency context & conversion
│   ├── cart.ts       Cart context & reducer
│   ├── brands.ts     Brand/language metadata
│   └── utils.ts      Helpers
├── types/index.ts    All TypeScript types
└── supabase/
    ├── schema.sql    Full DB schema with RLS
    └── seed.sql      Sample products
```

---

## Pricing Logic

| Layer        | Discount           |
|--------------|--------------------|
| Base         | −30% off market    |
| Cases        | −5% extra (stacks) |
| Flash deals  | −varies (stacks)   |

Market prices are synced weekly via `POST /api/pricing/sync` (secured with `CRON_SECRET`).

| Language | Source             |
|----------|--------------------|
| EN 🇺🇸   | TCGPlayer API      |
| JP 🇯🇵   | BigWeb / Yuyutei   |
| KR 🇰🇷   | Naver Smart Store  |

---

## Weekly Price Sync (cron)

Add this to **Vercel Cron Jobs** (`vercel.json`):

```json
{
  "crons": [{
    "path": "/api/pricing/sync",
    "schedule": "0 3 * * 1"
  }]
}
```

Or use a GitHub Actions workflow / Supabase `pg_cron`.

---

## Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

Make sure to add all environment variables in your Vercel project settings.
