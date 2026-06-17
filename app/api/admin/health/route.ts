import { NextResponse } from 'next/server';

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
  return NextResponse.json({ ok: missing.length === 0, checks, missing });
}
