'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const SHELF_BOXES = [
  {
    src: 'https://product-images.tcgplayer.com/fit-in/400x558/654137.jpg',
    alt: 'Pokémon Phantasmal Flames',
    brand: 'Pokémon',
    color: '#FFCC00',
    href: '/shop/pokemon',
  },
  {
    src: 'https://en.onepiece-cardgame.com/images/products/boosters/op01/mv_01.jpg',
    alt: 'One Piece Romance Dawn JP',
    brand: 'One Piece',
    color: '#E8232A',
    href: '/shop/onepiece',
  },
  {
    src: 'https://product-images.tcgplayer.com/fit-in/400x558/612358.jpg',
    alt: 'Pokémon Stellar Crown',
    brand: 'Pokémon',
    color: '#FFCC00',
    href: '/shop/pokemon',
  },
  {
    src: 'https://media.wizards.com/2025/images/daily/en_ZcV8b56jf0.webp',
    alt: 'MTG Final Fantasy',
    brand: 'Magic',
    color: '#C8962A',
    href: '/shop/mtg',
  },
  {
    src: 'https://en.onepiece-cardgame.com/images/products/boosters/op11/mv_01.jpg',
    alt: 'One Piece OP11 JP',
    brand: 'One Piece',
    color: '#E8232A',
    href: '/shop/onepiece',
  },
  {
    src: 'https://product-images.tcgplayer.com/fit-in/400x558/648729.jpg',
    alt: 'Pokémon Surging Sparks',
    brand: 'Pokémon',
    color: '#FFCC00',
    href: '/shop/pokemon',
  },
  {
    src: 'https://img.yugioh-card.com/asia/wp-content/uploads/2026/01/cg2069_ED.png',
    alt: 'Yu-Gi-Oh! Legacy of Chaos',
    brand: 'Yu-Gi-Oh!',
    color: '#6B4CE6',
    href: '/shop/yugioh',
  },
  {
    src: 'https://en.onepiece-cardgame.com/images/products/boosters/op13/mv_01.jpg',
    alt: 'One Piece OP13 JP',
    brand: 'One Piece',
    color: '#E8232A',
    href: '/shop/onepiece',
  },
];

function ShelfBox({ box }: { box: typeof SHELF_BOXES[0] }) {
  const [src, setSrc] = useState(box.src);
  return (
    <Link
      href={box.href}
      className="group flex-shrink-0 relative"
      style={{ width: 120, height: 170 }}
    >
      <div
        className="w-full h-full rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-105"
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`,
          border: `1px solid ${box.color}20`,
        }}
      >
        <Image
          src={src}
          alt={box.alt}
          fill
          unoptimized
          className="object-cover"
          onError={() => setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="170"><rect width="120" height="170" fill="#111"/><text x="60" y="85" text-anchor="middle" font-family="system-ui" font-size="11" fill="${box.color}">${box.brand}</text></svg>`)}`)}
        />
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${box.color}30, transparent 60%)` }}
        />
      </div>
      {/* Brand label on hover */}
      <div
        className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 uppercase tracking-widest"
        style={{ color: box.color }}
      >
        {box.brand}
      </div>
    </Link>
  );
}

export function BoxShelf() {
  return (
    <section className="py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-muted text-xs uppercase tracking-[0.2em] mb-8 font-semibold">
          Featured Products
        </p>

        {/* Shelf surface */}
        <div className="relative">
          {/* Box row */}
          <div className="flex items-end justify-center gap-4 sm:gap-6 pb-4">
            {SHELF_BOXES.map((box, i) => (
              <ShelfBox key={i} box={box} />
            ))}
          </div>

          {/* Shelf plank */}
          <div
            className="h-[6px] w-full rounded-full mt-4"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(200,150,42,0.15) 20%, rgba(200,150,42,0.3) 50%, rgba(200,150,42,0.15) 80%, transparent)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
          {/* Shelf shadow */}
          <div
            className="h-[2px] w-full mt-1 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, transparent)' }}
          />
        </div>
      </div>
    </section>
  );
}
