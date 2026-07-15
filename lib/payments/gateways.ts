// ─────────────────────────────────────────────────────────────────────────────
// Payment gateways for the FIFA World Cup 2026 marketplace checkout.
// Each gateway maps to a real provider API; live mode activates automatically
// when the required environment variables are present, otherwise the API runs
// in safe "demo" mode (no real charge).
// ─────────────────────────────────────────────────────────────────────────────

export type GatewayId = 'card' | 'paypal' | 'applepay' | 'googlepay' | 'cashapp' | 'crypto';

export interface GatewayMeta {
  id: GatewayId;
  name: string;
  blurb: string;
  provider: string;    // underlying payment API used in live mode
  envKeys: string[];   // env vars required for live mode
}

export const GATEWAYS: GatewayMeta[] = [
  { id: 'card',      name: 'Credit / Debit Card', blurb: 'Visa · Mastercard · Amex', provider: 'Stripe',            envKeys: ['STRIPE_SECRET_KEY'] },
  { id: 'paypal',    name: 'PayPal',              blurb: 'Pay with your PayPal balance', provider: 'PayPal Orders API', envKeys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'] },
  { id: 'applepay',  name: 'Apple Pay',           blurb: 'One-tap on Apple devices',  provider: 'Stripe',            envKeys: ['STRIPE_SECRET_KEY'] },
  { id: 'googlepay', name: 'Google Pay',          blurb: 'One-tap on Android & Chrome', provider: 'Stripe',          envKeys: ['STRIPE_SECRET_KEY'] },
  { id: 'cashapp',   name: 'Cash App Pay',        blurb: 'Pay with Cash App',         provider: 'Stripe',            envKeys: ['STRIPE_SECRET_KEY'] },
  { id: 'crypto',    name: 'Crypto',              blurb: 'BTC · ETH · USDC & more',    provider: 'Coinbase Commerce', envKeys: ['COINBASE_COMMERCE_API_KEY'] },
];

export function gatewayById(id: string): GatewayMeta | undefined {
  return GATEWAYS.find((g) => g.id === id);
}

// Server-only: a gateway is "live" when all its env keys are set.
export function isGatewayLive(g: GatewayMeta): boolean {
  return g.envKeys.every((k) => !!process.env[k]);
}
