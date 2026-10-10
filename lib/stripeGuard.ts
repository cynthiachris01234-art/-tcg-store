// Server-only: decides whether Stripe card checkout can be offered.
// Live when a Stripe secret key is set. STRIPE_CHECKOUT_ENABLED=false turns it off.
import { env, envOff } from '@/lib/env';

export interface StripeStatus {
  available: boolean;
  reason?: string;
}

export async function stripeCheckoutStatus(): Promise<StripeStatus> {
  if (envOff('STRIPE_CHECKOUT_ENABLED')) return { available: false, reason: 'Stripe is switched off' };
  if (!env('STRIPE_SECRET_KEY')) return { available: false, reason: 'no Stripe key set' };
  return { available: true };
}
