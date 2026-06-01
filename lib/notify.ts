// ─── Order notification helpers ───────────────────────────────────────────────
// Sends WhatsApp + Email when a new order is placed

interface OrderNotifyPayload {
  id: string;
  customer: { name: string; email: string; line1: string; city: string; state: string; country: string; };
  items: Array<{ setName: string; brand: string; language: string; quantity: number; total: number; }>;
  subtotal_usd: number;
  discount_usd: number;
  total_usd: number;
  status: string;
}

// ── WhatsApp via CallMeBot ─────────────────────────────────────────────────────
export async function sendWhatsApp(order: OrderNotifyPayload): Promise<void> {
  const phone  = process.env.WHATSAPP_NUMBER;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!phone || !apiKey) return;

  const itemLines = order.items
    .map(i => `• ${i.setName} (${i.language.toUpperCase()}) x${i.quantity} — $${i.total.toFixed(2)}`)
    .join('\n');

  const message = [
    `🛍️ NEW ORDER — #${order.id}`,
    `👤 ${order.customer.name} (${order.customer.email})`,
    `📦 ${order.items.length} item${order.items.length !== 1 ? 's' : ''}:`,
    itemLines,
    `💰 Total: $${order.total_usd.toFixed(2)}`,
    `📍 ${order.customer.city}, ${order.customer.country}`,
  ].join('\n');

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

  const itemRows = order.items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;">${i.setName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${i.language.toUpperCase()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:right;">$${i.total.toFixed(2)}</td>
    </tr>`).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#fff;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C8962A,#8B6418);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#000;">⚡ TCG Vault</h1>
      <p style="margin:8px 0 0;color:#000;opacity:0.7;font-size:13px;">New Order Received</p>
    </div>

    <!-- Order ID -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Order ID</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;font-family:monospace;color:#C8962A;">#${order.id}</p>
    </div>

    <!-- Customer -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Customer</p>
      <p style="margin:0;font-weight:600;">${order.customer.name}</p>
      <p style="margin:2px 0;color:#888;font-size:14px;">${order.customer.email}</p>
      <p style="margin:2px 0;color:#888;font-size:14px;">${order.customer.line1}, ${order.customer.city}, ${order.customer.state} ${order.customer.country}</p>
    </div>

    <!-- Items -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;overflow:hidden;margin-bottom:16px;">
      <p style="margin:0;padding:12px 16px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #222;">Items</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#0d0d0d;">
            <th style="padding:8px 12px;text-align:left;color:#666;font-weight:500;">Product</th>
            <th style="padding:8px 12px;text-align:center;color:#666;font-weight:500;">Lang</th>
            <th style="padding:8px 12px;text-align:center;color:#666;font-weight:500;">Qty</th>
            <th style="padding:8px 12px;text-align:right;color:#666;font-weight:500;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#888;font-size:14px;">
        <span>Subtotal</span><span>$${order.subtotal_usd.toFixed(2)}</span>
      </div>
      ${order.discount_usd > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#22c55e;font-size:14px;"><span>Discount</span><span>-$${order.discount_usd.toFixed(2)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:1px solid #222;margin-top:8px;font-size:18px;font-weight:700;">
        <span>Total</span><span style="color:#C8962A;">$${order.total_usd.toFixed(2)}</span>
      </div>
    </div>

    <p style="text-align:center;color:#444;font-size:12px;">TCG Vault · Automated order notification</p>
  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'onboarding@resend.dev',
        to:      [adminEmail],
        subject: `New Order #${order.id} — $${order.total_usd.toFixed(2)}`,
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
