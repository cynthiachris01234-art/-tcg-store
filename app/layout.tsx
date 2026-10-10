import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { FlashSaleBanner } from '@/components/promo/LivePromo';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart';
import { CurrencyProvider } from '@/lib/currency';
import { PageTracker } from '@/components/PageTracker';
import { LiveChat } from '@/components/LiveChat';
import { JsonLd } from '@/components/JsonLd';
import { MetaPixel } from '@/components/MetaPixel';
import { Clarity } from '@/components/Clarity';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apextcg.shop'),
  title: {
    default: 'Apex TCG — Sealed Pokémon, One Piece & MTG Boxes',
    template: '%s | Apex TCG',
  },
  description:
    'Buy 100% sealed Pokémon, One Piece, Magic: The Gathering, and Yu-Gi-Oh! booster boxes and cases in English, Japanese, and Korean. Based in New York.',
  keywords: [
    'pokemon booster box', 'buy sealed pokemon boxes', 'one piece tcg booster box',
    'mtg booster box', 'yugioh booster box', 'japanese pokemon box',
    'sealed tcg', 'pokemon case', 'tcg cards', 'buy tcg boxes online',
    'apex tcg', 'pokemon evolving skies box', 'one piece romance dawn',
  ],
  authors: [{ name: 'Apex TCG', url: 'https://apextcg.shop' }],
  creator: 'Apex TCG',
  publisher: 'Apex TCG',
  alternates: { canonical: 'https://apextcg.shop' },
  openGraph: {
    siteName: 'Apex TCG',
    type: 'website',
    locale: 'en_US',
    url: 'https://apextcg.shop',
    title: 'Apex TCG — Sealed Pokémon, One Piece & MTG Boxes',
    description: 'Buy 100% sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes and cases. Free shipping available.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Apex TCG — Sealed TCG Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex TCG — Sealed TCG Boxes',
    description: 'Buy sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'SDnAq82m2LRX8Nk3ak0jligOp3NjgoJUhtT1BoI2KV4',
    other: { 'msvalidate.01': '701FE03C9F457CB0A19696321799187D' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <MetaPixel />
        <Clarity />
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none bg-[#070707]"
        />
        {/* Gradient overlay — fades top/bottom for depth */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(200,150,42,0.06) 0%, transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: 'Apex TCG',
          url: 'https://apextcg.shop',
          logo: 'https://apextcg.shop/logo.png',
          description: 'Sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes and cases.',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '447 Broadway',
            addressLocality: 'New York',
            addressRegion: 'NY',
            postalCode: '10013',
            addressCountry: 'US',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-332-272-8148',
            contactType: 'customer service',
            availableLanguage: ['English'],
          },
          sameAs: [
            'https://instagram.com/apextcg_distribution',
            'https://www.facebook.com/people/Apex-TCG-Distribution/61582030211913/',
            'https://tiktok.com/@apextcg_distro',
            'https://t.me/apextcgshop',
          ],
          priceRange: '$$',
          currenciesAccepted: 'USD',
          paymentAccepted: 'Wise, Venmo, Apple Pay',
        }} />
        <CurrencyProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <FlashSaleBanner />
              <TopBar />
              <Navbar />
              <PageTracker />
              <main className="flex-1">{children}</main>
              <Footer />
              <LiveChat />
            </div>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
