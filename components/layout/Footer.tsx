import Link from 'next/link';
import { Zap, Mail, Phone, Globe } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { BRAND_META, BRANDS, LANGUAGE_META, LANGUAGES } from '@/lib/brands';

const INSTAGRAM_HANDLE = 'apextcgshop';
const TIKTOK_HANDLE    = 'apextcg_distro';
const WHATSAPP_NUMBER  = '13322728148';
const DISPLAY_PHONE    = '+1 (332) 272-8148';

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
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href={`https://tiktok.com/@${TIKTOK_HANDLE}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-border hover:bg-white/20 transition-colors text-muted hover:text-white"
                title="TikTok"
              >
                <SiTiktok className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-bg-border hover:bg-green-500/20 transition-colors text-muted hover:text-green-400"
                title="WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="mailto:apextradingcardshop@gmail.com"
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
                <FaWhatsapp className="w-3.5 h-3.5" /> Chat on WhatsApp
              </a>
              <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 transition-colors">
                <FaInstagram className="w-3.5 h-3.5" /> @{INSTAGRAM_HANDLE}
              </a>
              <a href={`https://tiktok.com/@${TIKTOK_HANDLE}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
                <SiTiktok className="w-3.5 h-3.5" /> @{TIKTOK_HANDLE}
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
