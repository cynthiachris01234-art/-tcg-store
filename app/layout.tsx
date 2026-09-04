import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteNavbar } from '@/components/fifa/SiteNavbar';
import { SiteFooter } from '@/components/fifa/SiteFooter';
import { DemoBanner } from '@/components/fifa/DemoBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fifatickets.site'),
  title: {
    default: 'Goal26 — Ticket Marketplace Design Concept (Demo)',
    template: '%s | Goal26 (Demo)',
  },
  description:
    'Goal26 is a design-concept demo of a sports ticket resale marketplace, themed around the 2026 World Cup. A portfolio/UI prototype only — not affiliated with FIFA, no real tickets are sold and no payments are processed.',
  keywords: [
    'world cup 2026 tickets', 'fifa 2026 resale', 'world cup final tickets',
    'metlife stadium tickets', 'world cup hospitality', 'buy world cup tickets',
    'sell world cup tickets', 'world cup seating map',
  ],
  openGraph: {
    siteName: 'Goal26 (Design Concept)',
    type: 'website',
    locale: 'en_US',
    title: 'Goal26 — Ticket Marketplace Design Concept (Demo)',
    description: 'A portfolio/UI design concept for a sports ticket resale marketplace. Not affiliated with FIFA; no real tickets or payments.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg">
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
      </body>
    </html>
  );
}
