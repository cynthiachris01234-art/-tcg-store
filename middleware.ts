import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminCookie } from '@/lib/adminAuth';

const isAdmin = (req: NextRequest) => isAdminCookie(req.cookies.get('admin_token')?.value);

// Admin-only API calls. Customer-facing calls on the same paths stay public
// (placing an order is POST /api/orders; page-view beacons are POST /api/track).
function isAdminApi(pathname: string, method: string): boolean {
  if (pathname.startsWith('/api/admin/')) return pathname !== '/api/admin/login';
  if (pathname === '/api/orders') return method === 'GET' || method === 'DELETE';
  if (pathname === '/api/track') return method === 'GET';
  if (pathname === '/api/test-notify') return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (isAdminApi(pathname, req.method) && !(await isAdmin(req))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin pages (login page itself is open)
  if (pathname === '/admin/login') return NextResponse.next();
  if (!(await isAdmin(req))) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/orders', '/api/track', '/api/test-notify'],
};
