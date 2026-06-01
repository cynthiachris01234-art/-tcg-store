import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Allow the login page through
  if (pathname === '/admin/login') return NextResponse.next();

  // Check for auth cookie
  const token = req.cookies.get('admin_token')?.value;
  const secret = process.env.ADMIN_SECRET ?? 'tcgvault-admin';

  if (token !== secret) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
