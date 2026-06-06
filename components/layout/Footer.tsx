import Link from 'next/link';
import { Zap, Mail, Phone, Globe } from 'lucide-react';
import { BRAND_META, BRANDS, LANGUAGE_META, LANGUAGES } from '@/lib/brands';

const INSTAGRAM_HANDLE = 'apextcg_warehouse';
const TIKTOK_HANDLE    = 'apextcg_distro';
const WHATSAPP_NUMBER  = '13322728148';
const DISPLAY_PHONE    = '+1 (332) 272-8148';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-bg-card border-t border-bg-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl text-white">Apex <span className="text-accent">TCG</span></span>
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              The best prices on sealed Pokémon, One Piece, MTG, and Yu-Gi-Oh! booster boxes. Always 40% below market.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-border hover:bg-pink-500/20 transition-colors text-muted hover:text-pink-400"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-border hover:bg-white/20 transition-colors text-muted hover:text-white"
                title="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-border hover:bg-green-500/20 transition-colors text-muted hover:text-green-400"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@apextcg.shop"
                className="p-2 rounded-lg bg-bg-border hover:bg-white/10 transition-colors text-muted hover:text-white"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            {/* Phone */}
            <a href={`tel:${DISPLAY_PHONE}`} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
              <Phone className="w-4 h-4 text-accent" />
              {DISPLAY_PHONE}
            </a>
          </div>

          {/* Shop by Brand */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Shop by Brand</h4>
            <ul className="space-y-2">
              {BRANDS.map((b) => {
                const meta = BRAND_META[b];
                return (
                  <li key={b}>
                    <Link href={`/shop/${b}`} className="text-sm text-muted hover:text-white transition-colors">
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

          {/* Help + Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Help</h4>
            <ul className="space-y-2">
              {[
                { href: '/shipping',   label: 'Shipping Policy' },
                { href: '/returns',    label: 'Returns & Refunds' },
                { href: '/faq',        label: 'FAQ' },
                { href: '/contact',    label: 'Contact Us' },
                { href: '/privacy',    label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact quick links */}
            <div className="mt-5 space-y-2">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors">
                <WhatsAppIcon className="w-3.5 h-3.5" /> Chat on WhatsApp
              </a>
              <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                <InstagramIcon className="w-3.5 h-3.5" /> @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-bg-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">© {new Date().getFullYear()} Apex TCG. All rights reserved.</p>

          {/* Language selector — small */}
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-muted" />
            <div className="flex items-center gap-1.5">
              {LANGUAGES.map((l) => {
                const meta = LANGUAGE_META[l];
                return (
                  <Link key={l} href={`/shop/language/${l}`}
                    className="text-muted hover:text-white transition-colors text-xs flex items-center gap-0.5">
                    <span>{meta.flag}</span>
                    <span>{l.toUpperCase()}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="text-muted text-xs">Prices updated weekly. 100% sealed & authentic.</p>
        </div>
      </div>
    </footer>
  );
}
