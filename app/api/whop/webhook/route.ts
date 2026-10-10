import { NextRequest, NextResponse } from 'next/server';
import Whop from '@whop/sdk';
import { createClient } from '@supabase/supabase-js';

const whopApiKey        = process.env.WHOP_API_KEY ?? '';
const whopWebhookSecret = process.env.WHOP_WEBHOOK_SECRET ?? '';
const supabaseUrl       = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Whop follows the Standard Webhooks spec, whose verifier base64-DECODES the key
// it is given. The secret Whop issues ("ws_<hex>") is not valid base64, so passing
// it raw makes the verifier throw on construction and every delivery 401s.
// Per Whop's docs the secret must be base64-ENCODED first: btoa(WHOP_WEBHOOK_SECRET).
function encodedWebhookKey(secret: string): string {
  if (!secret) return '';
  return Buffer.from(secret, 'utf8').toString('base64');
}

// GET /api/whop/webhook — health probe. Reports whether the secret is present
// and usable, without ever exposing its value.
export async function GET() {
  const secret = whopWebhookSecret;
  let keyUsable = false;
  try {
    if (secret && !secret.includes('placeholder')) {
      new Whop({ apiKey: whopApiKey, webhookKey: encodedWebhookKey(secret) });
      keyUsable = true;
    }
  } catch { keyUsable = false; }
  // Non-reversible fingerprint so the deployed secret can be compared against a
  // local copy during debugging without ever exposing the secret itself.
  let fingerprint: string | null = null;
  if (secret) {
    const { createHash } = await import('crypto');
    fingerprint = createHash('sha256').update(secret).digest('hex').slice(0, 12);
  }

  return NextResponse.json({
    endpoint: 'whop-webhook',
    version: 'v3-fingerprint',
    secretConfigured: !!secret && !secret.includes('placeholder'),
    secretPrefix: secret ? secret.slice(0, 3) : null,
    secretLength: secret ? secret.length : 0,
    fingerprint,
    keyUsable,
  });
}

// POST /api/whop/webhook — Whop calls this when a payment succeeds.
// Configure the endpoint + secret in the Whop dashboard (Developer → Webhooks).
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!whopWebhookSecret || whopWebhookSecret.includes('placeholder')) {
      console.error('Whop webhook: WHOP_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const client = new Whop({ apiKey: whopApiKey, webhookKey: encodedWebhookKey(whopWebhookSecret) });
    let event: any;
    try {
      event = client.webhooks.unwrap(rawBody, { headers: Object.fromEntries(req.headers) });
    } catch (err) {
      console.error('Whop webhook signature verification failed:', (err as Error)?.message ?? err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event?.type === 'payment.succeeded') {
      const metadata = event.data?.metadata ?? {};
      const orderId: string | undefined = metadata.order_id;

      if (orderId && supabaseUrl && serviceRoleKey && !serviceRoleKey.includes('placeholder')) {
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data: updated, error } = await supabase
          .from('store_orders')
          .update({ status: 'paid' })
          .eq('id', orderId)
          .select('id');

        if (error) {
          console.error('Whop webhook: order update failed:', error);
        } else if (updated && updated.length > 0) {
          console.log(`Whop webhook: order ${orderId} marked paid`);
        } else {
          // Paid, but the browser never reported back (tab closed mid-payment),
          // so the order was never recorded. Save what the payment metadata
          // gives us so a real payment is never lost.
          const { error: insErr } = await supabase.from('store_orders').insert({
            id: orderId,
            status: 'paid',
            customer: {
              name: 'Recovered from Whop payment — details incomplete',
              payment_method: 'whop',
            },
            items: [],
            subtotal_usd: Number(metadata.subtotal_usd ?? 0),
            discount_usd: Number(metadata.discount_usd ?? 0),
            total_usd:    Number(metadata.total_usd ?? 0),
          });
          if (insErr) console.error('Whop webhook: recovery insert failed:', insErr);
          else console.warn(`Whop webhook: recovered paid order ${orderId} (details incomplete)`);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Whop webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
