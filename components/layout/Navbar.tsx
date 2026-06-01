'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { CURRENCIES } from '@/lib/currency';
import { BRAND_META, BRANDS, LANGUAGE_META, LANGUAGES } from '@/lib/brands';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop',     label: 'All Products' },
  { href: '/cases',    label: 'Cases' },
  { href: '/releases', label: 'New Releases' },
  { href: '/deals',    label: '🔥 Deals' },
];

function ApexLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gold A-frame icon */}
      <g>
        <polygon points="22,4 36,40 28,40 22,24 16,40 8,40" fill="url(#apexGold)" />
        <line x1="13" y1="31" x2="31" y2="31" stroke="url(#apexGold)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Outer gold arc */}
        <circle cx="22" cy="22" r="19" stroke="url(#apexGoldBorder)" strokeWidth="2" fill="none" />
      </g>
      {/* APEX text — silver/chrome */}
      <text x="50" y="28" fontFamily="system-ui, 'Arial Black', sans-serif" fontWeight="900" fontSize="22" letterSpacing="1" fill="url(#apexSilver)">APEX</text>
      {/* TCG text — gold */}
      <text x="51" y="46" fontFamily="system-ui, 'Arial Black', sans-serif" fontWeight="800" fontSize="13" letterSpacing="5" fill="url(#apexGoldText)">— TCG —</text>
      <defs>
        <linearGradient id="apexGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0CC6A" />
          <stop offset="50%" stopColor="#C8962A" />
          <stop offset="100%" stopColor="#8B6418" />
        </linearGradient>
        <linearGradient id="apexGoldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E5B84D" />
          <stop offset="50%" stopColor="#C8962A" />
          <stop offset="100%" stopColor="#6B4C10" />
        </linearGradient>
        <linearGradient id="apexSilver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#D0D0D8" />
          <stop offset="100%" stopColor="#909098" />
        </linearGradient>
        <linearGradient id="apexGoldText" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E5B84D" />
          <stop offset="100%" stopColor="#C8962A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const { itemCount } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gold/20" style={{ boxShadow: '0 1px 0 rgba(200,150,42,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <ApexLogo className="h-9 w-auto group-hover:scale-105 transition-transform duration-200" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* Shop by Brand dropdown */}
            <div className="relative" onMouseEnter={() => setBrandOpen(true)} onMouseLeave={() => setBrandOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                Shop by Brand <ChevronDown className="w-4 h-4" />
              </button>
              {brandOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 card p-2 shadow-card-hover">
                  {BRANDS.map((b) => {
                    const meta = BRAND_META[b];
                    return (
                      <Link
                        key={b}
                        href={`/shop/${b}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ color: meta.primaryColor }}
                      >
                        <span className="font-semibold text-sm">{meta.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

{NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="hidden sm:block bg-black border border-gold/30 text-sm text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-gold cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-gold" style={{ background: 'linear-gradient(135deg,#E5B84D,#C8962A)' }}>
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-black px-4 py-4 space-y-1">
          <p className="text-xs text-muted uppercase tracking-widest mb-2">Shop by Brand</p>
          {BRANDS.map((b) => {
            const meta = BRAND_META[b];
            return (
              <Link key={b} href={`/shop/${b}`} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5"
                style={{ color: meta.primaryColor }}>
                <span className="font-semibold text-sm">{meta.name}</span>
              </Link>
            );
          })}
          <div className="border-t border-gold/20 my-3" />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5">
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gold/20 mt-3 pt-3">
            <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full bg-black border border-gold/30 text-sm text-gray-300 rounded-lg px-3 py-2">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </nav>
  );
}
