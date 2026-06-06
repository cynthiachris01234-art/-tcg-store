'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Star, Clock } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

const PROMO_IDS = ['poke-30th-en-box', 'poke-svah-etb-en'];

export function PromoSection() {
  const { addItem } = useCart();
  const promos = MOCK_PRODUCTS.filter(p => PROMO_IDS.includes(p.id));

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Featured Promos</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {promos.map(product => (
          <PromoCard key={product.id} product={product} onAdd={() => addItem(product, 1)} />
        ))}
      </div>
    </section>
  );
}

function PromoCard({ product, onAdd }: { product: any; onAdd: () => void }) {
  const [imgSrc, setImgSrc] = useState(product.image_url);
  const savings = Math.round((1 - product.our_price_usd / product.market_price_usd) * 100);

  const is30th = product.id === 'poke-30th-en-box';

  return (
    <div
      className="card overflow-hidden group relative"
      style={{
        background: is30th
          ? 'linear-gradient(135deg, #1a0a2e 0%, #0d0d0d 60%)'
          : 'linear-gradient(135deg, #0a1a2e 0%, #0d0d0d 60%)',
        border: is30th ? '1px solid rgba(200,150,42,0.4)' : '1px solid rgba(59,130,246,0.3)',
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: is30th
            ? 'radial-gradient(ellipse at 30% 20%, rgba(200,150,42,0.3) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.25) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex gap-5 p-5">
        {/* Image */}
        <div className="relative flex-shrink-0 w-36 h-48 rounded-xl overflow-hidden bg-black/40">
          <Image
            src={imgSrc}
            alt={product.set_name}
            fill
            unoptimized
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc('https://product-images.tcgplayer.com/fit-in/400x558/242811.jpg')}
          />
          {/* Badge */}
          {product.is_pre_order && (
            <div className="absolute top-2 left-2 bg-accent text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> PRE-ORDER
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            {is30th ? (
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">🎉 Limited Edition</p>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">⭐ Featured Product</p>
            )}

            <h3 className="text-white font-black text-lg leading-tight">{product.set_name}</h3>
            <p className="text-muted text-xs mt-1">
              {product.language.toUpperCase()} · {product.pack_count ? `${product.pack_count} packs` : 'Elite Trainer Box'}
            </p>

            {is30th && (
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Worldwide simultaneous release. Every card foil. 30 Pikachu variants. Releasing <span className="text-white font-semibold">Sep 16, 2026</span>.
              </p>
            )}
            {!is30th && (
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Featuring fan-favourite hero Pokémon. Exclusive ETB with premium accessories.
              </p>
            )}
          </div>

          <div>
            {/* Price */}
            <div className="flex items-end gap-3 mt-4">
              <div>
                <p className="text-muted text-xs line-through">${product.market_price_usd.toFixed(2)}</p>
                <p className="text-2xl font-black text-accent">${product.our_price_usd.toFixed(2)}</p>
              </div>
              <span className="mb-1 text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                -{savings}% OFF
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onAdd}
                disabled={product.stock_quantity === 0 && !product.is_pre_order}
                className="flex-1 btn-primary flex items-center justify-center gap-1.5 py-2 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.is_pre_order ? 'Pre-Order' : 'Add to Cart'}
              </button>
              <Link
                href={`/product/${product.slug}`}
                className="btn-outline px-4 py-2 text-sm"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
