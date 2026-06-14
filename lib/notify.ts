// ─── Order notification helpers ───────────────────────────────────────────────
// Sends WhatsApp + Email when a new order is placed

export interface OrderNotifyPayload {
  id: string;
  paymentMethod?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  items: Array<{
    setName: string;
    brand: string;
    language: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal_usd: number;
  discount_usd: number;
  total_usd: number;
  status: string;
}

// ── Reliable USD formatter — no toLocaleString (unreliable in server envs) ─────
function usd(n: any): string {
  // Convert to number, clamp to 2 decimal places via string
  const num = Math.round(Number(n ?? 0) * 100) / 100;
  const fixed = num.toFixed(2); // always gives e.g. "1074.20"
  const [whole, cents] = fixed.split('.');
  // Add comma thousands separators to the integer part
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return withCommas + '.' + cents;
}

// ── Human-readable payment method labels ──────────────────────────────────────
const PAY_LABELS: Record<string, string> = {
  wise:     'Wise Transfer',
  applepay: 'Apple Pay',
  cashapp:  'Cash App',
  paypal:   'PayPal',
};
function payLabel(id?: string): string {
  return PAY_LABELS[id ?? ''] ?? id ?? 'Not specified';
}

// ── WhatsApp via CallMeBot ─────────────────────────────────────────────────────
export async function sendWhatsApp(order: OrderNotifyPayload): Promise<void> {
  const phone  = process.env.WHATSAPP_NUMBER;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apiKey) return;

  const method = payLabel(order.paymentMethod);

  // Build item lines — use USD prefix to avoid WhatsApp stripping $+digit sequences
  const itemLines = order.items.map(i => {
    const up = Math.round(Number(i.unitPrice) * 100) / 100;
    const ln = Math.round(Number(i.unitPrice) * Number(i.quantity) * 100) / 100;
    const lang = (i.language ?? '').toUpperCase();
    return `- ${i.setName} (${lang}) x${i.quantity}  USD ${usd(up)} ea = USD ${usd(ln)}`;
  }).join('\n');

  const addr = [
    order.customer.line1,
    order.customer.line2,
    order.customer.city,
    order.customer.state,
    order.customer.postal_code,
    order.customer.country,
  ].filter(Boolean).join(', ');

  // Compute totals directly from items to avoid any stale serialised values
  const itemsSubtotal = order.items.reduce(
    (s, i) => s + Math.round(Number(i.unitPrice) * Number(i.quantity) * 100) / 100, 0
  );
  const discount = Math.round(Number(order.discount_usd ?? 0) * 100) / 100;
  const total    = discount > 0
    ? Math.round((itemsSubtotal - discount) * 100) / 100
    : Math.round(Number(order.total_usd ?? itemsSubtotal) * 100) / 100;

  const lines = [
    `NEW ORDER #${order.id}`,
    `---`,
    `Customer: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
    order.customer.phone ? `Phone: ${order.customer.phone}` : null,
    `Address: ${addr}`,
    `---`,
    `Items (${order.items.length}):`,
    itemLines,
    `---`,
    `Subtotal : USD ${usd(itemsSubtotal)}`,
    discount > 0 ? `Discount : -USD ${usd(discount)}` : null,
    `TOTAL    : USD ${usd(total)}`,
    `---`,
    `Payment  : ${method}`,
    `ACTION   : Send ${method} details to customer now`,
  ].filter(v => v !== null).join('\n');

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(lines)}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) console.error('CallMeBot error:', res.status, await res.text());
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
  }
}

// ── Email via Resend ──────────────────────────────────────────────────────────
export async function sendEmail(order: OrderNotifyPayload): Promise<void> {
  const apiKey     = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return;

  const method = payLabel(order.paymentMethod);

  const addr = [
    order.customer.line1,
    order.customer.line2,
    order.customer.city,
    order.customer.state,
    order.customer.postal_code,
    order.customer.country,
  ].filter(Boolean).join(', ');

  const itemsSubtotal = order.items.reduce(
    (s, i) => s + Math.round(Number(i.unitPrice) * Number(i.quantity) * 100) / 100, 0
  );
  const discount = Math.round(Number(order.discount_usd ?? 0) * 100) / 100;
  const total    = discount > 0
    ? Math.round((itemsSubtotal - discount) * 100) / 100
    : Math.round(Number(order.total_usd ?? itemsSubtotal) * 100) / 100;

  const itemRows = order.items.map(i => {
    const up = Math.round(Number(i.unitPrice) * 100) / 100;
    const ln = Math.round(Number(i.unitPrice) * Number(i.quantity) * 100) / 100;
    return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;">${i.setName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${(i.language ?? '').toUpperCase()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${usd(up)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;color:#C8962A;font-weight:700;">$${usd(ln)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#fff;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <div style="background:linear-gradient(135deg,#C8962A,#8B6418);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#000;">&#9889; APEX TCG</h1>
      <p style="margin:8px 0 0;color:#000;opacity:0.7;font-size:13px;">New Order &#8212; Action Required</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;">
      <table style="width:100%;"><tr>
        <td style="width:50%;vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;font-family:monospace;color:#C8962A;">#${order.id}</p>
        </td>
        <td style="width:50%;vertical-align:top;">
          <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Payment</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#22c55e;">${method}</p>
        </td>
      </tr></table>
    </div>

    <div style="background:#1a2e1a;border:1px solid #22c55e;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#22c55e;font-weight:700;font-size:14px;">Send the customer their ${method} payment details to complete this order.</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0 0 10px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Customer</p>
      <p style="margin:0;font-weight:700;font-size:15px;">${order.customer.name}</p>
      <p style="margin:4px 0;color:#aaa;font-size:13px;">&#128231; ${order.customer.email}</p>
      ${order.customer.phone ? `<p style="margin:4px 0;color:#aaa;font-size:13px;">&#128241; ${order.customer.phone}</p>` : ''}
      <p style="margin:4px 0;color:#aaa;font-size:13px;">&#128205; ${addr}</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <p style="margin:0;padding:12px 16px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #222;">Order Items</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#0d0d0d;">
            <th style="padding:8px 12px;text-align:left;color:#666;font-weight:500;">Product</th>
            <th style="padding:8px 12px;text-align:center;color:#666;font-weight:500;">Lang</th>
            <th style="padding:8px 12px;text-align:center;color:#666;font-weight:500;">Qty</th>
            <th style="padding:8px 12px;text-align:right;color:#666;font-weight:500;">Unit Price</th>
            <th style="padding:8px 12px;text-align:right;color:#666;font-weight:500;">Line Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#888;font-size:14px;">
        <span>Subtotal</span><span>$${usd(itemsSubtotal)} USD</span>
      </div>
      ${discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#22c55e;font-size:14px;"><span>Bundle Discount</span><span>-$${usd(discount)} USD</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;border-top:1px solid #333;margin-top:8px;font-size:20px;font-weight:800;">
        <span>TOTAL</span><span style="color:#C8962A;">$${usd(total)} USD</span>
      </div>
    </div>

    <p style="text-align:center;color:#444;font-size:12px;">Apex TCG &#183; apextcg.shop</p>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:     'Apex TCG <onboarding@resend.dev>',
        reply_to: 'apextradingcardshop@gmail.com',
        to:       [adminEmail],
        subject:  `Order #${order.id} - $${usd(total)} USD - ${method}`,
        html,
      }),
    });
    if (!res.ok) console.error('Resend error:', res.status, await res.text());
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}

// ── Send both ─────────────────────────────────────────────────────────────────
export async function notifyNewOrder(order: OrderNotifyPayload): Promise<void> {
  await Promise.allSettled([
    sendWhatsApp(order),
    sendEmail(order),
  ]);
}
