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

// Format USD with commas, e.g. $1,074.00
const fmt = (n: any) =>
  Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── WhatsApp via CallMeBot ─────────────────────────────────────────────────────
export async function sendWhatsApp(order: OrderNotifyPayload): Promise<void> {
  const phone  = process.env.WHATSAPP_NUMBER;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apiKey) return;

  const itemLines = order.items
    .map(i => {
      const unitPrice = Number(i.unitPrice ?? 0) || (Number(i.total ?? 0) / Math.max(Number(i.quantity) || 1, 1));
      return `• ${i.setName} (${(i.language ?? '').toUpperCase()}) x${i.quantity} @ $${fmt(unitPrice)} = $${fmt(i.total)}`;
    })
    .join('\n');

  const addrParts = [
    order.customer.line1,
    order.customer.line2,
    order.customer.city,
    order.customer.state,
    order.customer.postal_code,
    order.customer.country,
  ].filter(Boolean).join(', ');

  const payMethod = order.paymentMethod ?? 'Not specified';

  const message = [
    `🛍 NEW ORDER #${order.id}`,
    `━━━━━━━━━━━━━━━━`,
    `👤 ${order.customer.name}`,
    `📧 ${order.customer.email}`,
    order.customer.phone ? `📱 ${order.customer.phone}` : null,
    `📍 ${addrParts}`,
    `━━━━━━━━━━━━━━━━`,
    `📦 Items (${order.items.length}):`,
    itemLines,
    `━━━━━━━━━━━━━━━━`,
    `💵 Subtotal: $${fmt(order.subtotal_usd)} USD`,
    Number(order.discount_usd) > 0 ? `🏷 Discount: -$${fmt(order.discount_usd)} USD` : null,
    `✅ TOTAL: $${fmt(order.total_usd)} USD`,
    `━━━━━━━━━━━━━━━━`,
    `💳 Payment Method: ${payMethod}`,
    `⚡ ACTION: Send payment link to customer`,
  ].filter(v => v !== null).join('\n');

  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;

  try {
    await fetch(url);
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
  }
}

// ── Email via Resend ──────────────────────────────────────────────────────────
export async function sendEmail(order: OrderNotifyPayload): Promise<void> {
  const apiKey     = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return;

  const addrParts = [
    order.customer.line1,
    order.customer.line2,
    order.customer.city,
    order.customer.state,
    order.customer.postal_code,
    order.customer.country,
  ].filter(Boolean).join(', ');

  const payMethod = order.paymentMethod ?? 'Not specified';

  const itemRows = order.items.map(i => {
    const unitPrice = Number(i.unitPrice ?? 0) || (Number(i.total ?? 0) / Math.max(Number(i.quantity) || 1, 1));
    return `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;">${i.setName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${(i.language ?? '').toUpperCase()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${fmt(unitPrice)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;color:#C8962A;">$${fmt(i.total)}</td>
    </tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#fff;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <div style="background:linear-gradient(135deg,#C8962A,#8B6418);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#000;">⚡ APEX TCG</h1>
      <p style="margin:8px 0 0;color:#000;opacity:0.7;font-size:13px;">New Order — Action Required</p>
    </div>

    <!-- Order ID + Payment Method -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;display:flex;gap:16px;">
      <div style="flex:1;">
        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;font-family:monospace;color:#C8962A;">#${order.id}</p>
      </div>
      <div style="flex:1;">
        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Payment Method</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#22c55e;">${payMethod}</p>
      </div>
    </div>

    <!-- Action banner -->
    <div style="background:#1a2e1a;border:1px solid #22c55e;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
      <p style="margin:0;color:#22c55e;font-weight:700;font-size:14px;">⚡ Send the customer their ${payMethod} payment link to complete this order.</p>
    </div>

    <!-- Customer -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Customer</p>
      <p style="margin:0;font-weight:700;font-size:15px;">${order.customer.name}</p>
      <p style="margin:3px 0;color:#aaa;font-size:13px;">📧 ${order.customer.email}</p>
      ${order.customer.phone ? `<p style="margin:3px 0;color:#aaa;font-size:13px;">📱 ${order.customer.phone}</p>` : ''}
      <p style="margin:3px 0;color:#aaa;font-size:13px;">📍 ${addrParts}</p>
    </div>

    <!-- Items -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <p style="margin:0;padding:12px 16px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #222;">Items</p>
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

    <!-- Totals -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#888;font-size:14px;">
        <span>Subtotal</span><span>$${fmt(order.subtotal_usd)} USD</span>
      </div>
      ${Number(order.discount_usd) > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#22c55e;font-size:14px;"><span>Bundle Discount</span><span>-$${fmt(order.discount_usd)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;border-top:1px solid #333;margin-top:8px;font-size:20px;font-weight:800;">
        <span>TOTAL</span><span style="color:#C8962A;">$${fmt(order.total_usd)} USD</span>
      </div>
    </div>

    <p style="text-align:center;color:#444;font-size:12px;">Apex TCG · Automated order notification · apextcg.shop</p>
  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'Apex TCG <onboarding@resend.dev>',
        to:      [adminEmail],
        subject: `🛍 Order #${order.id} — $${fmt(order.total_usd)} USD — ${payMethod}`,
        html,
      }),
    });
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
