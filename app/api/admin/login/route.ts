import { NextResponse } from 'next/server';
import { adminSecret, adminSessionToken, safeEqual } from '@/lib/adminAuth';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const secret = adminSecret();

  if (!secret || typeof password !== 'string' || !safeEqual(password, secret)) {
    await sleep(1500);   // slows down password guessing
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', await adminSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('admin_token');
  return res;
}
