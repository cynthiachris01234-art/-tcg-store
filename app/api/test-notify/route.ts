import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {
    env: {
      whatsapp_number:    process.env.WHATSAPP_NUMBER    ? '✅ set' : '❌ missing',
      callmebot_api_key:  process.env.CALLMEBOT_API_KEY  ? '✅ set' : '❌ missing',
      resend_api_key:     process.env.RESEND_API_KEY     ? '✅ set' : '❌ missing',
      admin_email:        process.env.ADMIN_EMAIL        ? `✅ ${process.env.ADMIN_EMAIL}` : '❌ missing',
    },
  };

  // Test WhatsApp
  try {
    const phone  = process.env.WHATSAPP_NUMBER;
    const apiKey = process.env.CALLMEBOT_API_KEY;
    if (phone && apiKey) {
      const msg = encodeURIComponent('✅ Apex TCG test — notifications are working!');
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${msg}&apikey=${apiKey}`;
      const res = await fetch(url);
      const text = await res.text();
      results.whatsapp = { status: res.status, response: text.slice(0, 200) };
    } else {
      results.whatsapp = 'skipped — env vars missing';
    }
  } catch (e: any) {
    results.whatsapp = { error: e.message };
  }

  // Test Email
  try {
    const apiKey     = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (apiKey && adminEmail) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     'Apex TCG <onboarding@resend.dev>',
          reply_to: 'apextradingcardshop@gmail.com',
          to:       [adminEmail],
          subject:  '✅ Apex TCG — test notification',
          html:     '<h2>Test successful!</h2><p>Your Apex TCG order notifications are working correctly.</p>',
        }),
      });
      const data = await res.json();
      results.email = { status: res.status, response: data };
    } else {
      results.email = 'skipped — env vars missing';
    }
  } catch (e: any) {
    results.email = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
