// POST /api/track — lightweight page-view beacon
// GET  /api/track — return aggregated analytics for admin dashboard

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY   ?? '';

function getSupabase() {
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

// ── POST: record a page view ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: true }); // silently skip if not configured

    const body = await req.json().catch(() => ({}));
    const page: string = body.page ?? '/';

    // Pull geo / IP from Vercel request headers (available in production)
    const country    = req.headers.get('x-vercel-ip-country')        ?? req.headers.get('cf-ipcountry') ?? null;
    const region     = req.headers.get('x-vercel-ip-country-region') ?? null;
    const city       = req.headers.get('x-vercel-ip-city')           ?? null;
    const forwarded  = req.headers.get('x-forwarded-for');
    const realIp     = req.headers.get('x-real-ip');
    const ip         = forwarded ? forwarded.split(',')[0].trim() : (realIp ?? null);
    const userAgent  = req.headers.get('user-agent')?.slice(0, 200) ?? null;
    const referrer   = (body.referrer as string | undefined)?.slice(0, 500) ?? null;

    // Skip bot/crawler traffic
    if (userAgent && /bot|crawl|spider|slurp|google|bing|baidu|yandex|facebookexternalhit/i.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    await supabase.from('page_views').insert({ page, country, city, ip });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never error out — analytics should never break the site
    console.error('Track error:', err);
    return NextResponse.json({ ok: true });
  }
}

// ── GET: aggregated analytics for admin ───────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured', rows: [] });

    // days param (default 30)
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get('days') ?? 30), 365);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const { data, error } = await supabase
      .from('page_views')
      .select('ts, page, country, city, ip')
      .gte('ts', since)
      .order('ts', { ascending: false })
      .limit(10_000);

    if (error) throw error;
    const rows = data ?? [];

    // ── Aggregations ──
    const totalViews = rows.length;
    const uniqueIps  = new Set(rows.map(r => r.ip).filter(Boolean)).size;

    // Country counts
    const countryMap: Record<string, number> = {};
    for (const r of rows) {
      if (r.country) countryMap[r.country] = (countryMap[r.country] ?? 0) + 1;
    }
    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([country, views]) => ({ country, views }));

    // Page counts
    const pageMap: Record<string, number> = {};
    for (const r of rows) {
      pageMap[r.page] = (pageMap[r.page] ?? 0) + 1;
    }
    const topPages = Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([page, views]) => ({ page, views }));

    // Daily views (last N days)
    const dailyMap: Record<string, number> = {};
    for (const r of rows) {
      const day = r.ts.slice(0, 10); // "YYYY-MM-DD"
      dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    }
    const dailyViews = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, views]) => ({ date, views }));

    // Recent raw visits (last 50, partial IP)
    const recentVisits = rows.slice(0, 50).map(r => ({
      ts:      r.ts,
      page:    r.page,
      country: r.country,
      city:    r.city,
      ip:      r.ip ? r.ip.replace(/\.\d+$/, '.***') : null, // mask last octet
    }));

    return NextResponse.json({
      days,
      totalViews,
      uniqueIps,
      topCountries,
      topPages,
      dailyViews,
      recentVisits,
    });
  } catch (err: any) {
    console.error('Analytics GET error:', err);
    return NextResponse.json({ error: err.message, rows: [] }, { status: 500 });
  }
}
