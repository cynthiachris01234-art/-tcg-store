import { NextRequest, NextResponse } from 'next/server';

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

// POST /api/contact — contact-form messages go straight to the store's
// Telegram and email (reply-to is the customer, so you can just hit Reply).
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (b.website) return NextResponse.json({ ok: true });   // honeypot: bots fill hidden fields

    const name = clip(b.name, 100), email = clip(b.email, 200), phone = clip(b.phone, 40);
    const order = clip(b.order, 30), topic = clip(b.topic, 60), message = clip(b.message, 3000);
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter your name, a valid email and a message.' }, { status: 400 });
    }

    const lines = [
      `✉️ CONTACT FORM — ${topic || 'General'}`,
      ``,
      `👤 ${name}`,
      `📧 ${email}`,
      phone ? `📱 ${phone}` : null,
      order ? `🧾 Order: ${order}` : null,
      ``,
      message,
    ].filter(v => v !== null).join('\n');

    const jobs: Promise<unknown>[] = [];
    const tg = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
    if (tg && chat) {
      jobs.push(fetch(`https://api.telegram.org/bot${tg}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text: lines, disable_web_page_preview: true }),
      }));
    }
    const rk = process.env.RESEND_API_KEY, admin = process.env.ADMIN_EMAIL;
    if (rk && admin) {
      jobs.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${rk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Apex TCG <onboarding@resend.dev>',
          to: [admin],
          reply_to: email,
          subject: `Contact form: ${topic || 'General'} — ${name}${order ? ` (${order})` : ''}`,
          html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;font-size:14px;">${esc(lines)}</pre>`,
        }),
      }));
    }
    const results = await Promise.allSettled(jobs);
    const delivered = results.some(r => r.status === 'fulfilled' && (r.value as Response).ok);
    if (!delivered) {
      console.error('Contact form: no channel delivered', results);
      return NextResponse.json({ error: 'Could not send right now. Please email or WhatsApp us instead.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Contact form error:', err?.message ?? err);
    return NextResponse.json({ error: 'Could not send right now. Please email or WhatsApp us instead.' }, { status: 500 });
  }
}
