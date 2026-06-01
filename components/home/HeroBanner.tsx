'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Globe, TrendingDown } from 'lucide-react';
import { useState } from 'react';

// Confirmed booster-box images – one per brand, served from official CDNs
const HERO_BOXES = [
  {
    brand: 'pokémon',
    color: '#FFCC00',
    shadow: 'rgba(255,204,0,0.40)',
    deg: -7,
    src: 'https://product-images.tcgplayer.com/fit-in/400x558/654137.jpg',
    fallback: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="296" height="414"><rect width="296" height="414" fill="#111"/><text x="148" y="207" text-anchor="middle" font-family="system-ui" font-size="18" font-weight="700" fill="#FFCC00">Pokémon</text></svg>')}`,
    alt: 'Pokémon ME Phantasmal Flames Booster Display',
  },
  {
    brand: 'one piece',
    color: '#E8232A',
    shadow: 'rgba(232,35,42,0.40)',
    deg: 4,
    src: 'https://product-images.tcgplayer.com/fit-in/400x558/515080.jpg',
    fallback: 'https://product-images.tcgplayer.com/fit-in/400x558/450086.jpg',
    alt: 'One Piece OP06 Wings of the Captain Booster Box',
  },
  {
    brand: 'magic',
    color: '#C8962A',
    shadow: 'rgba(200,150,42,0.45)',
    deg: -3,
    src: 'https://media.wizards.com/2025/images/daily/en_ZcV8b56jf0.webp',
    fallback: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="296" height="414"><rect width="296" height="414" fill="#111"/><text x="148" y="207" text-anchor="middle" font-family="system-ui" font-size="18" font-weight="700" fill="#C8962A">Magic</text></svg>')}`,
    alt: 'Magic: The Gathering Final Fantasy Play Booster Box',
  },
  {
    brand: 'yu-gi-oh',
    color: '#6B4CE6',
    shadow: 'rgba(107,76,230,0.40)',
    deg: 7,
    src: 'https://img.yugioh-card.com/asia/wp-content/uploads/2026/01/cg2069_ED.png',
    fallback: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="296" height="414"><rect width="296" height="414" fill="#111"/><text x="148" y="207" text-anchor="middle" font-family="system-ui" font-size="18" font-weight="700" fill="#6B4CE6">Yu-Gi-Oh!</text></svg>')}`,
    alt: 'Yu-Gi-Oh! Legacy of Chaos Booster Box',
  },
];

function HeroBox({ box, priority = false }: { box: typeof HERO_BOXES[0]; priority?: boolean }) {
  const [src, setSrc] = useState(box.src);
  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:z-40"
      style={{
        width: 148,
        height: 206,
        transform: `rotate(${box.deg}deg)`,
        boxShadow: `0 24px 60px ${box.shadow}, 0 6px 20px rgba(0,0,0,0.7)`,
        border: `1px solid ${box.color}30`,
      }}
    >
      <Image
        src={src}
        alt={box.alt}
        fill
        unoptimized
        className="object-cover"
        priority={priority}
        onError={() => setSrc(box.fallback)}
      />
      {/* Brand colour overlay bottom */}
      <div
        className="absolute bottom-0 inset-x-0 py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.15em]"
        style={{
          background: `linear-gradient(transparent, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.85))`,
          color: box.color,
        }}
      >
        {box.brand}
      </div>
    </div>
  );
}

export function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden min-h-[580px] flex items-center"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,150,42,0.12) 0%, #000000 60%)' }}
    >
      {/* Ambient glow — left */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,150,42,0.18) 0%, transparent 70%)' }}
      />
      {/* Ambient glow — right */}
      <div
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,150,42,0.06) 0%, transparent 70%)' }}
      />

      {/* Subtle gold grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#C8962A 1px, transparent 1px), linear-gradient(90deg, #C8962A 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Left: Text Content ─────────────────────────────────────── */}
          <div className="flex-1 max-w-xl">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border"
              style={{ background: 'rgba(200,150,42,0.12)', borderColor: 'rgba(200,150,42,0.35)' }}
            >
              <TrendingDown className="w-3.5 h-3.5" style={{ color: '#E5B84D' }} />
              <span className="text-sm font-semibold" style={{ color: '#E5B84D' }}>
                Always 30% Below Market Price
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
              Sealed TCG<br />
              <span className="text-gold-gradient">Booster Boxes</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl mb-8 leading-relaxed">
              Pokémon · One Piece · Magic: The Gathering · Yu-Gi-Oh!<br />
              English, Japanese &amp; Korean · Shipped worldwide
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/releases" className="btn-outline flex items-center gap-2 text-base px-8 py-3.5">
                New Releases
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Package,      text: '100% Sealed & Authentic' },
                { icon: TrendingDown, text: 'Prices synced weekly'    },
                { icon: Globe,        text: 'EN · JP · KR'            },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-400">
                  <Icon className="w-4 h-4" style={{ color: '#C8962A' }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Booster Box Collage ─────────────────────────────── */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative w-[380px] h-[460px]">

              {/* Radial glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(200,150,42,0.12) 0%, transparent 80%)' }}
              />

              {/* Pokémon — top left */}
              <div className="absolute top-0 left-4">
                <HeroBox box={HERO_BOXES[0]} priority />
              </div>

              {/* One Piece — top right */}
              <div className="absolute top-8 right-4">
                <HeroBox box={HERO_BOXES[1]} priority />
              </div>

              {/* MTG — bottom left */}
              <div className="absolute bottom-0 left-16">
                <HeroBox box={HERO_BOXES[2]} />
              </div>

              {/* Yu-Gi-Oh — bottom right */}
              <div className="absolute bottom-6 right-8">
                <HeroBox box={HERO_BOXES[3]} />
              </div>

              {/* Floating badge */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold z-30 whitespace-nowrap"
                style={{ background: 'rgba(0,0,0,0.80)', color: '#E5B84D', border: '1px solid rgba(200,150,42,0.40)', backdropFilter: 'blur(8px)' }}
              >
                4 Brands · 60+ Products
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
