import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';

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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
