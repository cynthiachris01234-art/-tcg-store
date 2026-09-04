import { NextResponse } from 'next/server';
import {
  validateApplication,
  storeApplication,
  notifyHiringTeam,
  isIntakeConfigured,
} from '@/lib/careers/application';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POSTING_PATH = '/careers/property-data-entry';

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Best-effort, per-instance. Enough to blunt casual spam; a serverless
// deployment should sit behind a platform-level limiter as well.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    const stale: string[] = [];
    hits.forEach((times, key) => {
      if (times.every((t: number) => now - t >= WINDOW_MS)) stale.push(key);
    });
    stale.forEach((key) => hits.delete(key));
  }
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

function wantsJson(req: Request): boolean {
  return (req.headers.get('accept') ?? '').includes('application/json');
}

/** Answers a JS submission with JSON, and a plain form post with a redirect. */
function respond(
  req: Request,
  status: number,
  payload: { ok: boolean; errors?: Record<string, string>; message?: string; reference?: string },
) {
  if (wantsJson(req)) {
    return NextResponse.json(payload, { status });
  }
  const url = new URL(req.url);
  if (payload.ok) {
    const to = new URL('/careers/thank-you', url.origin);
    if (payload.reference) to.searchParams.set('ref', payload.reference);
    return NextResponse.redirect(to, 303);
  }
  const back = new URL(POSTING_PATH, url.origin);
  // Field-level errors mean the applicant can fix it themselves; anything else
  // is on us and gets the "try again" wording.
  back.searchParams.set('error', payload.errors ? 'invalid' : 'server');
  back.hash = 'apply';
  return NextResponse.redirect(back, 303);
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return respond(req, 429, {
      ok: false,
      message: 'Too many applications submitted from this connection. Please try again later.',
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respond(req, 400, {
      ok: false,
      message: 'We could not read your submission. Please check your file and try again.',
    });
  }

  // Honeypot — a real applicant never fills a hidden field.
  if (typeof form.get('company_website') === 'string' && form.get('company_website') !== '') {
    // Accept silently so a bot gets no signal about what was rejected.
    return respond(req, 200, { ok: true });
  }

  const { fields, resume, errors } = validateApplication(form);

  if (Object.keys(errors).length > 0 || !resume) {
    return respond(req, 400, {
      ok: false,
      errors: errors as Record<string, string>,
      message: 'Please correct the highlighted fields.',
    });
  }

  if (!isIntakeConfigured()) {
    // Fail loudly rather than showing a success screen for an application that
    // was never stored.
    console.error(
      '[careers] Application rejected: intake is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
    return respond(req, 503, {
      ok: false,
      message:
        'Applications are temporarily unavailable. Please try again shortly — your details were not submitted.',
    });
  }

  const result = await storeApplication(fields, resume);

  if (!result.ok) {
    console.error('[careers] Failed to store application:', result.error);
    return respond(req, 500, {
      ok: false,
      message:
        'Something went wrong while submitting your application. Please try again — your details were not saved.',
    });
  }

  await notifyHiringTeam(fields, result.reference);

  return respond(req, 200, { ok: true, reference: result.reference });
}

/** Someone landing on the endpoint directly belongs back on the posting. */
export async function GET(req: Request) {
  return NextResponse.redirect(new URL(POSTING_PATH, new URL(req.url).origin), 307);
}
