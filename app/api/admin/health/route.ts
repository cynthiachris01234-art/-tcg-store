import { NextResponse } from 'next/server';
import { stripeCheckoutStatus } from '@/lib/stripeGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    stripe_secret:      !!process.env.STRIPE_SECRET_KEY,
    stripe_publishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    supabase_url:       !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon:      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service:   !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    resend:             !!process.env.RESEND_API_KEY,
    whatsapp_number:    !!process.env.WHATSAPP_NUMBER,
    callmebot_key:      !!process.env.CALLMEBOT_API_KEY,
  };

  const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  // Whether card checkout is live, and if not, why. Admin-only route.
  const stripe_checkout = await stripeCheckoutStatus();
  // The on/off switches as saved, to spot typos. Should be "true"/"false";
  // anything long (e.g. a key pasted by mistake) is described, never echoed.
  const sw = (n: string) => {
    const v = process.env[n];
    if (v == null) return 'not set';
    const t = v.trim();
    if (t.length <= 8) return JSON.stringify(v);
    return `not true/false — contains a ${t.length}-character value starting "${t.slice(0, 8)}…" (looks like a key pasted into the wrong setting)`;
  };
  const switches = {
    STRIPE_CHECKOUT_ENABLED: sw('STRIPE_CHECKOUT_ENABLED'),
    PAYPAL_CHECKOUT_ENABLED: sw('PAYPAL_CHECKOUT_ENABLED'),
    MANUAL_ORDERS_ENABLED:   sw('MANUAL_ORDERS_ENABLED'),
    stripe_key_set:  !!process.env.STRIPE_SECRET_KEY,
    paypal_keys_set: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  };
  return NextResponse.json({ ok: missing.length === 0, checks, missing, stripe_checkout, switches });
}
