'use client';

import Image from 'next/image';
import { LivePrice } from '@/components/promo/LivePromo';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { BRAND_META } from '@/lib/brands';
import type { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

const HERO_COUNT = 3;

export function PromoSection({ picks }: { picks: Product[] }) {
  const { addItem } = useCart();
  if (picks.length === 0) return null;
  const hero = picks.slice(0, HERO_COUNT);
  const more = picks.slice(HERO_COUNT);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="text-2xl font-black text-white">Featured Picks</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
        <Link href="/shop" className="text-xs font-semibold text-accent hover:opacity-80 whitespace-nowrap">
          Shop all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hero.map(product => (
          <PromoCard key={product.id} product={product} onAdd={() => addItem(product, 1)} />
        ))}
      </div>

      {more.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {more.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}

function PromoCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const [imgSrc, setImgSrc] = useState(product.image_url);
  const meta = BRAND_META[product.brand];

  return (
    <div
      className="card overflow-hidden group relative"
      style={{
        background: 'linear-gradient(135deg, #16120a 0%, #0d0d0d 60%)',
        border: `1px solid ${meta.primaryColor}55`,
      }}
    >
      <div className="absolute inset-0 opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 70% 20%, ${meta.primaryColor}40 0%, transparent 60%)` }} />

      <div className="relative flex gap-5 p-5">
        <div className="relative flex-shrink-0 w-36 h-48 rounded-xl overflow-hidden bg-black/40">
          <Image
            src={imgSrc}
            alt={product.set_name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="144px"
            priority
            onError={() => setImgSrc('/placeholder-box.png')}
          />
          {product.is_promo && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              🔥 PROMO
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: meta.primaryColor }}>
              {meta.name}
            </p>
            <h3 className="text-white font-black text-lg leading-tight line-clamp-2">{product.set_name}</h3>
            <p className="text-muted text-xs mt-2 leading-relaxed">
              {product.stock_quantity <= 3
                ? `Only ${product.stock_quantity} left — ships within 1–2 business days.`
                : 'In stock — ships within 1–2 business days.'}
            </p>
          </div>

          <div>
            <p className="mt-4"><LivePrice product={product} className="text-2xl font-black text-accent" /></p>
            <div className="flex gap-2 mt-3">
              <button onClick={onAdd}
                className="flex-1 btn-primary flex items-center justify-center gap-1.5 py-2 text-sm">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <Link href={`/product/${product.slug}`} className="btn-outline px-4 py-2 text-sm">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
