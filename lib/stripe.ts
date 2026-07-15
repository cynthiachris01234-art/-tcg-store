import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance (lazy — never throws at import/build time even
// when STRIPE_SECRET_KEY is unset, so deployments without payment keys build
// cleanly; the FIFA marketplace pages don't use Stripe at all).
let _stripe: Stripe | null = null;
export function getServerStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });
  }
  return _stripe;
}

// Backwards-compatible proxy so existing `stripe.xxx` calls keep working.
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    const s = getServerStripe() as unknown as Record<string | symbol, unknown>;
    const v = s[prop];
    return typeof v === 'function' ? v.bind(s) : v;
  },
});

// Client-side Stripe promise (singleton)
let stripePromise: ReturnType<typeof loadStripe>;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

export async function createPaymentIntent(
  amountUSD: number,
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amountUSD * 100), // cents
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}
