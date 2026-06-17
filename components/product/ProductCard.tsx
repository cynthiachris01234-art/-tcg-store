'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Bell } from 'lucide-react';
import type { Product } from '@/types';
import { BRAND_META } from '@/lib/brands';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { PriceTag } from '@/components/ui/PriceTag';
import { StockBadge } from '@/components/ui/StockBadge';
import { useCart } from '@/lib/cart';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: Props) {
  const { addItem } = useCart();
  const meta = BRAND_META[product.brand];
  const [imgSrc, setImgSrc] = useState(product.image_url || '/placeholder-box.png');

  return (
    <div className={cn(
      'card group relative overflow-hidden transition-all duration-300',
      'hover:shadow-card-hover hover:-translate-y-1',
      className
    )}>
      {/* Brand accent border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: meta.primaryColor }} />

      {/* Pre-order / Sealed badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
        {product.is_promo && (
          <span className="badge bg-red-500/20 text-red-400 border border-red-500/40 font-bold">🔥 PROMO</span>
        )}
        {product.is_pre_order && (
          <span className="badge bg-accent/20 text-accent border border-accent/40">PRE-ORDER</span>
        )}
        {product.product_type === 'case' && (
          <span className="badge bg-mtg-gold/20 text-mtg-gold border border-mtg-gold/30">CASE</span>
        )}
        {product.product_type === 'upc' && (
          <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">UPC</span>
        )}
        {product.product_type === 'spc' && (
          <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">SPC</span>
        )}
        {product.product_type === 'etb' && (
          <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30">ETB</span>
        )}
        {product.product_type === 'bundle' && (
          <span className="badge bg-green-500/20 text-green-300 border border-green-500/30">BUNDLE</span>
        )}
        {product.product_type === 'premium_collection' && (
          <span className="badge bg-pink-500/20 text-pink-300 border border-pink-500/30">PC</span>
        )}
        {product.product_type === 'display_case' && (
          <span className="badge bg-orange-500/20 text-orange-300 border border-orange-500/30">DISPLAY</span>
        )}
        {product.product_type === 'poster_collection' && (
          <span className="badge bg-teal-500/20 text-teal-300 border border-teal-500/30">POSTER</span>
        )}
        <span className="badge bg-success/10 text-success border border-success/20">SEALED</span>
      </div>

      {/* Language badge */}
      <div className="absolute top-3 right-3 z-10">
        <LanguageBadge language={product.language} />
      </div>

      {/* Product image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[3/4] bg-bg overflow-hidden">
          <Image
            src={imgSrc}
            alt={`${product.set_name} ${product.product_type === 'case' ? 'Case' : 'Booster Box'}`}
            fill
            unoptimized
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgSrc(
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560"><rect width="400" height="560" fill="#0d0d0d"/><rect y="0" width="400" height="3" fill="${meta.primaryColor}" opacity="0.7"/><text x="200" y="255" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${meta.primaryColor}">${product.set_name}</text><text x="200" y="285" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#666">${product.set_code}</text></svg>`
      )}`
    )}
          />
          {/* Shine overlay */}
          <div className="absolute inset-0 bg-card-shine opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Brand pill */}
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: meta.primaryColor }}>
          {meta.name}
        </span>

        {/* Set name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-white font-semibold text-sm leading-tight hover:text-accent transition-colors line-clamp-2">
            {product.set_name}
          </h3>
        </Link>

        {/* Set code + type */}
        <p className="text-muted text-xs">
          {product.set_code} · {
            product.product_type === 'case'               ? 'Case (6 Boxes)' :
            product.product_type === 'etb'                ? 'Elite Trainer Box' :
            product.product_type === 'upc'                ? 'Ultra Premium Collection' :
            product.product_type === 'spc'                ? 'Super Premium Collection' :
            product.product_type === 'bundle'             ? `Booster Bundle${product.pack_count ? ` (${product.pack_count} Packs)` : ''}` :
            product.product_type === 'premium_collection' ? 'Premium Collection' :
            product.product_type === 'display_case'       ? 'Display Case' :
            product.product_type === 'poster_collection'  ? 'Poster Collection' :
            `Booster Box${product.pack_count ? ` (${product.pack_count} Packs)` : ''}`
          }
        </p>

        {/* Stock */}
        <StockBadge quantity={product.stock_quantity} isPreOrder={product.is_pre_order} />

        {/* Price */}
        <PriceTag
          marketPriceUSD={product.market_price_usd}
          ourPriceUSD={product.our_price_usd}
          size="sm"
          showSavings={!!product.is_promo}
        />

        {/* Action button */}
        {product.stock_quantity > 0 && !product.is_pre_order ? (
          <button
            onClick={() => addItem(product)}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        ) : product.is_pre_order ? (
          <Link
            href={`/product/${product.slug}`}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm text-center"
          >
            Pre-Order Now
          </Link>
        ) : (
          <Link
            href={`/product/${product.slug}`}
            className="w-full btn-outline flex items-center justify-center gap-2 py-2 text-sm"
          >
            <Bell className="w-4 h-4" />
            Notify Me
          </Link>
        )}
      </div>
    </div>
  );
}
