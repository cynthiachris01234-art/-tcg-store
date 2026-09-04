'use client';

import { usePathname } from 'next/navigation';
import { SiteNavbar } from '@/components/fifa/SiteNavbar';
import { SiteFooter } from '@/components/fifa/SiteFooter';
import { DemoBanner } from '@/components/fifa/DemoBanner';
import { CareersHeader } from '@/components/careers/CareersHeader';
import { CareersFooter } from '@/components/careers/CareersFooter';

const JOB_POSTING_PREFIX = '/careers/property-data-entry';

/**
 * Picks the shell for the current route.
 *
 * The marketplace pages are a dark, FIFA-themed design demo and carry a
 * non-affiliation ribbon. The careers site is a separate, live surface for
 * Levy Real Estate, so it must not inherit that chrome, that ribbon, or the
 * navy background.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isCareers = pathname === '/careers' || pathname.startsWith('/careers/');

  if (isCareers) {
    return (
      <div className="careers-root flex min-h-screen flex-col bg-levy-sand text-levy-ink">
        <CareersHeader showJobNav={pathname.startsWith(JOB_POSTING_PREFIX)} />
        <main className="flex-1">{children}</main>
        <CareersFooter />
      </div>
    );
  }

  return (
    <>
      {/* Ambient background — navy field with subtle grid + glow */}
      <div aria-hidden className="fixed inset-0 -z-10 bg-fifa-gradient" />
      <div aria-hidden className="fixed inset-0 -z-10 bg-grid opacity-60" />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% -10%, rgba(23,99,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 90% 10%, rgba(255,198,41,0.08) 0%, transparent 45%)',
        }}
      />
      <div className="flex flex-col min-h-screen">
        <DemoBanner />
        <SiteNavbar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
