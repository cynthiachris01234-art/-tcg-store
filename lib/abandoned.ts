// Server-only: when a Stripe checkout expires unpaid, email the customer one
// reminder with a free-shipping link back to their cart, and alert the store
// on Telegram so you can follow up personally too.
import type Stripe from 'stripe';
import { rebuildOrderPricing, orderExists } from '@/lib/orderRecord';
import { makeComebackToken } from '@/lib/comeback';
import { COMEBACK } from '@/lib/promos';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://apextcg.shop';
const money = (n: number) => `$${n.toFixed(2)}`;
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export interface AbandonedCheckout {
  orderId: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  items: { productId: string; quantity: number }[];
}

const ITEM_CHUNK = 490;

/** Pack cart lines into Stripe metadata (each value is capped at 500 characters). */
export function encodeCartItems(items: { productId: string; quantity: number }[]): Record<string, string> {
  const json = JSON.stringify(items.map(i => [i.productId, i.quantity]));
  if (json.length <= 500) return { items: json };
  const meta: Record<string, string> = {};
  for (let i = 0, n = 0; i < json.length; i += ITEM_CHUNK, n++) {
    meta[`items_${n}`] = json.slice(i, i + ITEM_CHUNK);
  }
  return meta;
}

export function decodeCartItems(metadata: Record<string, string> | null | undefined): { productId: string; quantity: number }[] {
  const m = metadata ?? {};
  let raw = m.items || '';
  if (!raw) {
    for (let n = 0; m[`items_${n}`]; n++) raw += m[`items_${n}`];
  }
  if (!raw) return [];
  try {
    const pairs: [string, number][] = JSON.parse(raw);
    return pairs.map(([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}

/** Email the customer one free-shipping reminder and alert the store on Telegram. */
export async function notifyAbandonedCheckout(input: AbandonedCheckout) {
  if (!input.orderId) return { skipped: 'no order' };
  if (!input.items.length) return { skipped: 'no items' };
  const email = (input.email || '').trim();
  if (/@example\.(com|org)$/i.test(email)) return { skipped: 'test checkout' };

  const priced = rebuildOrderPricing(input.items, input.country || 'US', { freeShipping: true });
  const token = makeComebackToken(input.orderId);
  const link = `${SITE}/cart/recover?i=${encodeURIComponent(input.items.map(i => `${i.productId}:${i.quantity}`).join(','))}&t=${token}`;
  const name = (input.name || '').split(' ')[0] || 'there';

  const emailed = email ? await sendReminderEmail(email, name, priced, link) : false;
  await sendOwnerAlert(input, priced, link, emailed);
  return { emailed, orderId: input.orderId };
}

export async function handleExpiredSession(session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  const orderId = m.order_id;
  const email = (m.c_email || session.customer_details?.email || '').trim();
  if (!orderId || !email) return { skipped: 'no order or email' };
  if (session.payment_status === 'paid') return { skipped: 'paid' };
  if (await orderExists(orderId, { ignorePending: true })) return { skipped: 'order already recorded' };

  return notifyAbandonedCheckout({
    orderId,
    email,
    name: m.c_name,
    phone: m.c_phone,
    country: m.country,
    items: decodeCartItems(m),
  });
}

async function sendReminderEmail(to: string, name: string, priced: ReturnType<typeof rebuildOrderPricing>, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const rows = priced.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #222;width:64px;">${i.imageUrl ? `<img src="${esc(i.imageUrl)}" width="56" height="56" style="object-fit:contain;background:#111;border-radius:8px;" alt="">` : ''}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #222;color:#fff;font-size:14px;">${esc(i.setName)}<br><span style="color:#888;font-size:12px;">Qty ${i.quantity}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #222;color:#C8962A;font-weight:700;text-align:right;">${money(i.total)}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
    <h1 style="margin:0 0 4px;font-size:22px;color:#C8962A;">&#9889; APEX TCG</h1>
    <h2 style="margin:16px 0 8px;font-size:20px;">Hi ${esc(name)}, you left something behind</h2>
    <p style="color:#aaa;font-size:14px;line-height:1.5;margin:0 0 16px;">Your cart is saved. Finish your order in the next ${COMEBACK.hours} hours and <strong style="color:#22c55e;">shipping is on us</strong>.</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="text-align:right;font-size:16px;margin:12px 0 20px;">Total with free shipping: <strong style="color:#C8962A;">${money(priced.total)}</strong></p>
    ${priced.freeGift ? `<p style="background:#1a2e1a;border:1px solid #22c55e;border-radius:8px;padding:10px;color:#22c55e;font-size:13px;margin:0 0 16px;">&#127873; Your order also includes a free booster pack.</p>` : ''}
    <a href="${esc(link)}" style="display:block;text-align:center;background:#C8962A;color:#000;font-weight:800;text-decoration:none;padding:14px;border-radius:10px;font-size:16px;">Complete my order &#8594;</a>
    <p style="color:#555;font-size:11px;line-height:1.5;margin-top:24px;">You're getting this one-time reminder because you started a checkout at apextcg.shop. We won't send another. Questions? Just reply to this email.</p>
  </div></body></html>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Apex TCG <onboarding@resend.dev>',
        reply_to: 'apextradingcardshop@gmail.com',
        to: [to],
        subject: 'You left something in your cart — free shipping inside',
        html,
      }),
    });
    if (!res.ok) { console.error('Reminder email failed:', res.status, await res.text()); return false; }
    return true;
  } catch (err) { console.error('Reminder email error:', err); return false; }
}

async function sendOwnerAlert(input: AbandonedCheckout, priced: ReturnType<typeof rebuildOrderPricing>, link: string, emailed: boolean) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const text = [
    `🛒 ABANDONED CHECKOUT #${input.orderId}`,
    `(started paying but didn't finish)`,
    ``,
    `👤 ${input.name || '—'}`,
    `📧 ${input.email || '—'}`,
    input.phone ? `📱 ${input.phone}` : null,
    ``,
    ...priced.items.map(i => `• ${i.setName} ×${i.quantity} — ${money(i.total)}`),
    `Total (free shipping): ${money(priced.total)}`,
    ``,
    emailed ? `✉️ Reminder email sent with free shipping` : `⚠️ Reminder email NOT sent — message them yourself`,
    `Their cart link: ${link}`,
  ].filter(v => v !== null).join('\n');
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (err) { console.error('Telegram abandoned alert failed:', err); }
}
