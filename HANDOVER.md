# Apex TCG (apextcg.shop): Project Handover

_Last updated: October 5, 2026_

This document is for whoever works on the store next, whether a developer or an AI assistant. It explains what the store does, how it's built, where everything lives, how to deploy it, and what still needs attention. **No secret values are written here.** They live in `.env.local` (on the owner's computer) and in Vercel's environment settings.

---

## 1. What this is

**Apex TCG** is an online shop selling **sealed trading card game products**: Pokémon, One Piece, Magic: The Gathering, Riftbound, Dragon Ball, Lorcana, Yu-Gi-Oh!, Star Wars and Digimon. That covers booster boxes, Elite Trainer Boxes, bundles, collections and cases. It ships from New York.

| | |
|---|---|
| Live site | https://apextcg.shop |
| Project folder | `C:\Users\megah\tcg-store` |
| Framework | Next.js 14.2.5 (App Router), React 18, TypeScript, Tailwind CSS |
| Hosting | Vercel (project `tcg-store`) |
| Database | Supabase (orders and page-view analytics) |
| Product catalog | A TypeScript file (`lib/mock-data.ts`), about 786 products. **Not** the database |
| Version control | **None.** This folder is not a git repository (see "Known issues") |

---

## 2. Current state (as of Oct 5, 2026)

- **Checkout:** customers choose **Wise, Venmo or Apple Pay**, then **place the order**, and the order is saved as `awaiting_payment`. The confirmation page shows a **"Confirm my order on WhatsApp"** button. It opens a chat with the store (+1 332 272 8148) with the order number, items, total and payment method typed in. The store replies with payment details, then marks the order paid in the admin once the money arrives.
- **Nobody can pay directly on the site.** Stripe, PayPal, Kkiapay and Whop checkouts are all switched off on the server. The old `/api/checkout` card route is retired (it returns HTTP 410).
- **Promotions running:** a $150 minimum order, 10% off every second ETB or booster box, and a free booster pack on orders over $250.
- **Order alerts** go to Telegram and email.
- **Admin** is at `/admin`. It is password-protected, and all admin data APIs are locked.

---

## 3. Running and deploying

```bash
# install dependencies
npm install

# local dev server (http://localhost:3000)
npm run dev

# production build check (run this before every deploy)
npx next build

# deploy to production (apextcg.shop)
npx vercel --prod --yes
```

- The Vercel CLI is already linked to the project from this folder.
- **Vercel deploys sometimes fail with "Not authorized" or "fetch failed".** That's a temporary problem on Vercel's side, so just run the deploy command again. A small retry loop was used in practice:
  ```bash
  for i in 1 2 3 4 5 6; do OUT=$(npx vercel --prod --yes 2>&1 | grep -iE "readyState|message" | head -2); echo "$OUT" | grep -q READY && { echo "$OUT"; break; }; echo "attempt $i failed"; sleep 10; done
  ```
- **Environment variables:** locally they're in `.env.local`. In production they're in Vercel (Project → Settings → Environment Variables). After changing a variable in Vercel, **redeploy** for it to take effect. From the CLI:
  ```bash
  npx vercel env rm NAME production --yes
  npx vercel env add NAME production    # paste the value when asked
  ```

---

## 4. Project map

### Pages (`app/`)
| Path | What it is |
|---|---|
| `/` | Homepage: Featured Picks, 30th Celebration section, brand shelves, deals, reviews |
| `/shop`, `/shop/[brand]`, `/shop/language/[lang]` | Catalog browsing |
| `/product/[id]` | Product page. **The URL uses the product `slug`, not its `id`** |
| `/cases`, `/deals`, `/releases`, `/special-sets` | Collection pages |
| `/cart` | Cart, with promo lines (multi-buy, free-gift progress, $150 minimum) |
| `/cart/recover` | Landing page for the abandoned-cart email link: restores the cart and applies free shipping |
| `/checkout` | Checkout form. The list of payment methods is set here (see section 6) |
| `/checkout/success` | Confirmation page. Shows the WhatsApp confirm step, or the Stripe/PayPal payment confirmation |
| `/contact`, `/privacy`, `/faq`, `/shipping`, `/returns` | Info pages. The contact form sends to the store's Telegram and email |
| `/admin`, `/admin/orders`, `/admin/payments`, `/admin/products`, `/admin/analytics` | Admin area (login at `/admin/login`) |

### API routes (`app/api/`)
| Route | Purpose | Status |
|---|---|---|
| `POST /api/orders` | Places a Wise/Venmo/Apple Pay order. The server creates the order number, prices the order and sends alerts | **Active** |
| `GET/DELETE /api/orders` | Admin: list or delete orders | Admin-only |
| `POST /api/contact` | Contact form, sent to Telegram and email | Active |
| `POST /api/track` / `GET /api/track` | Page-view beacon / admin analytics | POST public, GET admin-only |
| `/api/stripe/checkout` | Creates a Stripe Checkout session | **Off** (`STRIPE_CHECKOUT_ENABLED`) |
| `/api/stripe/confirm`, `/api/stripe/webhook` | Record paid Stripe sessions; abandoned-checkout reminder on `checkout.session.expired` | Active (only matters when Stripe is on) |
| `/api/paypal/checkout`, `/api/paypal/capture` | Create and capture PayPal orders | **Off** (`PAYPAL_CHECKOUT_ENABLED`); capture still works for in-progress payments |
| `/api/admin/paypal` | Admin PayPal transaction view | Admin-only |
| `/api/admin/payments` | Admin Stripe payments view | Admin-only |
| `/api/admin/login` | Admin login (sets a signed cookie) | Public |
| `/api/kkiapay/*` | Kkiapay (West African payments) | **Dormant.** Never had all its keys |
| `/api/whop/*` | Whop checkout | **Dormant.** Not configured |
| `/api/checkout` | Old card route | **Retired** (always returns 410) |
| `/api/webhook` | Old Stripe webhook for an `orders` table | Legacy, unused |
| `/api/pricing/sync`, `/api/restock` | Cron-style jobs, protected by `CRON_SECRET` | Not scheduled |
| `/api/test-notify` | Sends a test alert | Admin-only |

### Core modules (`lib/`)
| File | Purpose |
|---|---|
| `mock-data.ts` | **The product catalog** (prices, stock, images, release dates). Edit this to add or change products |
| `promos.ts` | **All promotions in one place:** minimum order, flash sales, multi-buy, free gift, comeback offer. The browser and server use the same rules |
| `cart.ts` | Cart state (in the browser's localStorage). Uses `promos.ts` for pricing |
| `orderRecord.ts` | **Server-side pricing and saving of orders.** `rebuildOrderPricing()` recalculates every order from the catalog (client prices are never trusted). `recordOrder()` saves to Supabase and sends alerts |
| `shipping.ts` | Shipping fee by size, quantity, value and destination. Free US shipping at $1,000 or more |
| `pricing.ts` | Case bundle discount (5%) and price helpers |
| `notify.ts` | Order alerts: **Telegram**, **email (Resend)**, WhatsApp (CallMeBot) |
| `abandoned.ts`, `comeback.ts` | Abandoned-checkout reminder email and Telegram alert, plus signed "free shipping for 72h" links. Stripe only |
| `adminAuth.ts` | Admin session token. The cookie holds an HMAC of the password, never the password itself |
| `stripe.ts`, `stripeOrder.ts` | Stripe client; turns a paid Stripe session into an order |
| `paypal.ts` | PayPal REST client (Orders v2) |
| `kkiapay.ts` | Kkiapay helpers (dormant) |
| `utils.ts` | Date formatting (UTC), `isComingSoon()`, stock labels |
| `supabase.ts` | Supabase clients |

`middleware.ts` protects `/admin/*` pages and the admin APIs listed above.

---

## 5. Catalog and pricing

- Each product in `lib/mock-data.ts` has: `id`, `slug`, `brand`, `language`, `product_type` (e.g. `etb`, `booster_box`, `case`, `display_case`, `bundle`), `set_name`, `image_url`, `release_date`, `stock_quantity`, `market_price_usd`, `our_price_usd`, `is_pre_order`, and so on.
- **Pricing convention:** `our_price_usd ≈ market_price_usd × 0.7`. Cases use a separate wholesale rule plus the 5% case discount.
- **Unreleased products:** `isComingSoon()` blocks ordering before `release_date` and shows "Coming Soon · date".
- **Stock is static.** It does not go down automatically when orders come in. Update `stock_quantity` by hand and redeploy.
- **Product images** mostly come from TCGplayer's image CDN (`product-images.tcgplayer.com`).
- **Price data source:** TCGplayer search API (`mp-search-api.tcgplayer.com`). Keep `size` at 50 or less, because larger values return nothing. Scripts: `scripts/sync-tcgplayer.ts` and `scripts/sync-prices.ts`.
- **Every price shown, and every price charged, goes through `priceOf()` in `lib/promos.ts`.** That's where flash-sale prices apply.

---

## 6. Checkout and payments

**Where the payment options are set:** `app/checkout/page.tsx`. Look for `PAYMENT_METHODS`. Method groups defined there:
- `WHATSAPP_METHODS`: Wise, Venmo, Apple Pay (**currently in use**)
- `PAYPAL_METHOD`, `STRIPE_METHODS`, `KKIAPAY_METHOD`, `TELEGRAM_METHOD`: defined but not shown

**Server switches (Vercel environment variables), which control what the server will accept:**
| Variable | Effect |
|---|---|
| `MANUAL_ORDERS_ENABLED` | Set to `false` to stop Wise/Venmo/Apple Pay orders (they're on by default) |
| `STRIPE_CHECKOUT_ENABLED` | Must be `true` for Stripe checkout to work (off by default) |
| `PAYPAL_CHECKOUT_ENABLED` | Must be `true` for PayPal checkout to work (currently `false`) |

**How each flow records an order:**
- **WhatsApp methods:** `POST /api/orders` → `recordOrder()` → saved as `awaiting_payment`, with Telegram and email alerts. The customer then confirms on WhatsApp (`components/checkout/WhatsAppConfirm.tsx`).
- **Stripe** (when on): `/api/stripe/checkout` creates a hosted Checkout Session (expires after 1 hour). The order is recorded as **paid** only after Stripe confirms, via either the success page (`/api/stripe/confirm`) or the webhook. Expired sessions trigger the abandoned-checkout reminder.
- **PayPal** (when on): `/api/paypal/checkout` creates an order and redirects to PayPal. On return, `/api/paypal/capture` captures the payment, checks the amount and records it as **paid**.

> **Important about payment accounts.** Card and PayPal payments must go into an account **registered to this store**, meaning its website is apextcg.shop and its statement name is something like APEXTCG, in the owner's or the business's name. During setup, several accounts belonging to other, unrelated businesses were tried. That led to frozen funds (Stripe "OpitmaLink Solutions" disabled with about $4,099 held), customers abandoning payment pages that showed unfamiliar business names, and money sitting in other people's PayPal balances. **Use an account opened for Apex TCG.**

---

## 7. Promotions (`lib/promos.ts`)

| Promo | Setting |
|---|---|
| Minimum order | `MIN_ORDER_USD = 150` (merchandise total after discounts, before shipping) |
| Flash sales | The `FLASH_SALES` array: product IDs, sale price, start and end times (UTC). A countdown banner shows site-wide while one is running. The last one ended on Sep 30, 2026 |
| Multi-buy | 10% off every second ETB or booster box (`MULTI_BUY`) |
| Free gift | Free booster pack on orders of $250 or more (`FREE_GIFT`). Shown in the cart and in order alerts |
| Comeback offer | 72-hour free-shipping link in the abandoned-checkout email (Stripe only) |

---

## 8. Notifications

- **Telegram** (main channel): `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Every new order, abandoned checkout and contact-form message is sent here.
- **Email via Resend:** goes to `ADMIN_EMAIL`. **Limitation:** emails are sent from Resend's shared test address (`onboarding@resend.dev`), which can only deliver to the Resend account owner. To email customers (abandoned-cart reminders), verify the domain `apextcg.shop` in Resend, then set `EMAIL_FROM` (e.g. `Apex TCG <orders@apextcg.shop>`).
- **WhatsApp via CallMeBot:** `WHATSAPP_NUMBER` and `CALLMEBOT_API_KEY`. This stopped working earlier (the number couldn't log in), and Telegram replaced it.

---

## 9. Admin

- Log in at `/admin/login` with the `ADMIN_SECRET` password. The session lasts 7 days.
- `/admin/orders`: all orders, with status, customer, items and payment method. Mark orders paid or shipped here.
- `/admin/payments`: the PayPal section (transactions, plus paid orders from the store's own records) and Stripe card payments.
- `/admin/products` and `/admin/analytics`: catalog view and page-view stats.
- Wrong passwords are delayed by about 1.5 seconds to slow down guessing.

---

## 10. Analytics and tracking

- **Microsoft Clarity** (heatmaps and session recordings): `NEXT_PUBLIC_CLARITY_ID`. View at clarity.microsoft.com.
- **Meta Pixel:** ID set in `components/MetaPixel.tsx`.
- **Built-in page views:** `components/PageTracker.tsx` posts to `/api/track`, which writes to the Supabase `page_views` table (see section 12).

---

## 11. Environment variables

| Name | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database |
| `ADMIN_SECRET` | Admin password; also signs admin sessions and comeback links |
| `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM` (optional) | Email alerts |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram alerts |
| `WHATSAPP_NUMBER`, `CALLMEBOT_API_KEY` | WhatsApp alerts (not working) |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CHECKOUT_ENABLED` | Stripe |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MERCHANT_ID`, `PAYPAL_ENV`, `PAYPAL_CHECKOUT_ENABLED` | PayPal |
| `MANUAL_ORDERS_ENABLED` | Wise/Venmo/Apple Pay orders on/off |
| `NEXT_PUBLIC_CLARITY_ID` | Clarity analytics |
| `NEXT_PUBLIC_KKIAPAY_*`, `KKIAPAY_*`, `WHOP_*`, `NEXT_PUBLIC_WHOP_APP_ID` | Dormant integrations |
| `CRON_SECRET`, `TCGPLAYER_PUBLIC_KEY`, `TCGPLAYER_PRIVATE_KEY` | Price sync jobs (optional) |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` | Site base URL |
| `COMEBACK_SECRET` (optional) | Signs comeback links (falls back to `ADMIN_SECRET`) |

**When setting up a Stripe account for the store:** add a webhook in Stripe that points to `https://apextcg.shop/api/stripe/webhook`, with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.expired`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.

---

## 12. Database (Supabase)

- **`store_orders`**: every order. Columns: `id` (APX-XXXXXX), `created_at`, `status`, `customer` (JSON), `items` (JSON), `subtotal_usd`, `discount_usd`, `total_usd`. If the table is missing `payment_method` or `shipping_usd`, the code stores those inside `customer` instead, so nothing is lost. Recommended SQL:
  ```sql
  ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS shipping_usd NUMERIC(10,2) DEFAULT 0;
  ```
- **`page_views`**: analytics (`page`, `country`, `city`, `ip`, `ts`). Create it if it's missing.
- Older reference SQL is in `supabase/` (`schema.sql` describes an earlier design with `products` and `orders` tables that the live store doesn't use).

---

## 13. Known issues and to-do

1. **No version control.** Run `git init`, then commit. Keep `.env.local` out of git; it should be in `.gitignore`.
2. **Rotate secrets.** Many live keys were pasted into chat during setup: Stripe keys for several accounts, PayPal secrets, the Telegram bot token, and others. Regenerate them. _(Oct 6, 2026: all payment keys (Stripe, PayPal, Kkiapay, Whop) were deleted from Vercel and `.env.local`, and the apextcg.shop webhooks were deleted from the OpitmaLink, Medages, Serenity and YunTraders Stripe accounts. The original Stripe account's webhook (acct_1TkWo4…) still needs deleting in its own dashboard.)_
3. **Payment account:** connect a Stripe, PayPal or other account registered to apextcg.shop (see section 6), then turn on its switch and add it to `PAYMENT_METHODS`.
4. **Resend domain** isn't verified, so customer emails don't deliver (see section 8).
5. **Stock doesn't decrement automatically.** Consider moving products into Supabase and decrementing stock on paid orders.
6. **Outstanding money and disputes on old accounts:** the OpitmaLink Stripe account (disabled, about $4,099 pending, 5 disputes) and the infor@softvora.com PayPal (3 store orders worth $1,254.01, withdrawn by that account's holder). Settle these with the account holders.
7. **Paid orders to fulfil:** check `/admin/orders` for orders with status `paid` that haven't shipped.
8. **Cleanup:** delete `lib/mock-data.ts.bak*` and the dormant code (Whop, Melio, Kkiapay, Telegram method, old `/api/webhook` and `/api/checkout`) once they're definitely not needed.
9. **Small thing:** the product URL uses `slug`, so `/product/<id>` returns a 404.

---

## 14. Store contacts and social accounts

| | |
|---|---|
| Phone / WhatsApp | +1 (332) 272-8148 |
| Email | apextradingcardshop@gmail.com |
| Instagram | @apextcg_distribution |
| Facebook | Apex TCG Distribution |
| Telegram | @apextcgshop |
| TikTok | @apextcg_distro |
