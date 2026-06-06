import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingContacts } from '@/components/layout/FloatingContacts';
import { CartProvider } from '@/lib/cart';
import { CurrencyProvider } from '@/lib/currency';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'APEX TCG — Booster Boxes & Cases at 30% Off Market Price',
    template: '%s | APEX TCG',
  },
  description:
    'Buy sealed Pokémon, One Piece, Magic: The Gathering, and Yu-Gi-Oh! booster boxes and cases in English, Japanese, and Korean — always 30% below market price.',
  keywords: ['pokemon booster box', 'one piece tcg', 'mtg booster box', 'yugioh box', 'japanese tcg', 'sealed tcg'],
  openGraph: {
    siteName: 'TCG Vault',
    type: 'website',
    locale: 'en_US',
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
        <CurrencyProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <TopBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingContacts />
            </div>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
