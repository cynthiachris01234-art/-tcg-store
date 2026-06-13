import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart';
import { CurrencyProvider } from '@/lib/currency';
import { PageTracker } from '@/components/PageTracker';
import { LiveChat } from '@/components/LiveChat';
import { JsonLd } from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apextcg.shop'),
  title: {
    default: 'Apex TCG — Sealed Pokémon, One Piece & MTG Boxes at 40% Off',
    template: '%s | Apex TCG',
  },
  description:
    'Buy 100% sealed Pokémon, One Piece, Magic: The Gathering, and Yu-Gi-Oh! booster boxes and cases in English, Japanese, and Korean. Always 40% below market price. Based in New York.',
  keywords: [
    'pokemon booster box cheap', 'buy sealed pokemon boxes', 'one piece tcg booster box',
    'mtg booster box discount', 'yugioh booster box', 'japanese pokemon box',
    'sealed tcg wholesale', 'pokemon case', 'cheap tcg cards', 'buy tcg boxes online',
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
    title: 'Apex TCG — Sealed Pokémon, One Piece & MTG Boxes at 40% Off',
    description: 'Buy 100% sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes and cases. Always 40% below market price. Free shipping available.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Apex TCG — Sealed TCG Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex TCG — Sealed TCG Boxes at 40% Off',
    description: 'Buy sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes at 40% below market price.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'SDnAq82m2LRX8Nk3ak0jligOp3NjgoJUhtT1BoI2KV4',
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
        {/* Fixed background image — dark TCG card aesthetic */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551306667-f32e7af055f2?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.12,
          }}
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
          description: 'Sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes and cases at 40% below market price.',
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
            'https://instagram.com/apextcgshop',
            'https://tiktok.com/@apextcg_distro',
          ],
          priceRange: '$$',
          currenciesAccepted: 'USD',
          paymentAccepted: 'Credit Card, PayPal, Cash App, Apple Pay, Wise',
        }} />
        <CurrencyProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
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
