import Link from 'next/link';
import { Zap, Mail, Twitter, Instagram } from 'lucide-react';
import { BRAND_META, BRANDS, LANGUAGE_META, LANGUAGES } from '@/lib/brands';

export function Footer() {
  return (
    <footer className="bg-bg-card border-t border-bg-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">TCG <span className="text-accent">Vault</span></span>
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              The best prices on sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes. Always 30% below market.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-bg-border hover:bg-white/10 transition-colors text-muted hover:text-white">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-bg-border hover:bg-white/10 transition-colors text-muted hover:text-white">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="mailto:support@tcgvault.com" className="p-2 rounded-lg bg-bg-border hover:bg-white/10 transition-colors text-muted hover:text-white">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop by Brand */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Shop by Brand</h4>
            <ul className="space-y-2">
              {BRANDS.map((b) => {
                const meta = BRAND_META[b];
                return (
                  <li key={b}>
                    <Link href={`/shop/${b}`} className="text-sm text-muted hover:text-white transition-colors"
                      style={{ '--hover-color': meta.primaryColor } as React.CSSProperties}>
                      {meta.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Shop by Language */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Language</h4>
            <ul className="space-y-2">
              {LANGUAGES.map((l) => {
                const meta = LANGUAGE_META[l];
                return (
                  <li key={l}>
                    <Link href={`/shop/language/${l}`} className="text-sm text-muted hover:text-white transition-colors flex items-center gap-2">
                      <span>{meta.flag}</span><span>{meta.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Help</h4>
            <ul className="space-y-2">
              {[
                { href: '/shipping',       label: 'Shipping Policy' },
                { href: '/returns',        label: 'Returns & Refunds' },
                { href: '/faq',            label: 'FAQ' },
                { href: '/contact',        label: 'Contact Us' },
                { href: '/privacy',        label: 'Privacy Policy' },
                { href: '/admin',          label: '⚙ Admin Panel' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">© {new Date().getFullYear()} TCG Vault. All rights reserved.</p>
          <p className="text-muted text-xs">
            Prices updated weekly. All products are 100% sealed & authentic.
          </p>
        </div>
      </div>
    </footer>
  );
}
