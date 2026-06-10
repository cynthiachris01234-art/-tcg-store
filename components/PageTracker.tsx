'use client';

// Lightweight page-view tracker — fires a beacon to /api/track on every navigation.
// No external services. Data goes straight to your Supabase page_views table.

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function PageTracker() {
  const pathname  = usePathname();
  const lastSent  = useRef<string>('');

  useEffect(() => {
    // Skip admin routes to avoid polluting analytics with your own visits
    if (pathname.startsWith('/admin')) return;
    // Don't double-fire on the same path
    if (pathname === lastSent.current) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      page:     pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });

    // sendBeacon is non-blocking and survives page unloads
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
