import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/supabase';
import { BRAND_META } from '@/lib/brands';
import { JsonLd } from '@/components/JsonLd';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { StockBadge } from '@/components/ui/StockBadge';
import { ProductActions } from './ProductActions';
import { LivePrice, ProductPromos } from '@/components/promo/LivePromo';
import { formatDate } from '@/lib/utils';
import { Shield, Package, Calendar, Tag } from 'lucide-react';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  try {
    const p = await getProductBySlug(params.id);
    if (!p) return {};
    const labels: Record<string, string> = { case: 'Case', etb: 'Elite Trainer Box', upc: 'Ultra Premium Collection', spc: 'Super Premium Collection', bundle: 'Booster Bundle', premium_collection: 'Premium Collection', display_case: 'Display Case', poster_collection: 'Poster Collection', booster_pack: 'Booster Pack', blister: 'Blister Pack', build_battle: 'Build & Battle Box', booster_box: 'Booster Box' };
    const typeLabel = labels[p.product_type] ?? 'Booster Box';
    const title = `${p.set_name} ${typeLabel} — ${p.language.toUpperCase()}`;
    const description = `Buy the ${p.set_name} ${typeLabel} (${p.language.toUpperCase()}) sealed and authentic at $${p.our_price_usd.toFixed(2)}. Fast shipping from Apex TCG, New York.`;
    return {
      title,
      description,
      alternates: { canonical: `https://apextcg.shop/product/${p.slug}` },
      openGraph: { title, description, url: `https://apextcg.shop/product/${p.slug}`, images: p.image_url ? [{ url: p.image_url }] : [] },
    };
  } catch { return {}; }
}

export default async function ProductPage({ params }: Props) {
  let product;
  try { product = await getProductBySlug(params.id); }
  catch { notFound(); }

  if (!product) notFound();

  const meta = BRAND_META[product.brand];

  const isSingleCard = product.product_type === 'single_card';

  const conditionLabel: Record<string, string> = {
    nm: 'Near Mint (NM)', lp: 'Lightly Played (LP)',
    mp: 'Moderately Played (MP)', hp: 'Heavily Played (HP)',
    damaged: 'Damaged', sealed: 'Factory Sealed',
  };

  const details = isSingleCard
    ? [
        { icon: Tag,      label: 'Set',         value: `${product.set_name} (${product.set_code})` },
        ...(product.card_number ? [{ icon: Package,  label: 'Card Number', value: product.card_number }] : []),
        ...(product.rarity      ? [{ icon: Tag,      label: 'Rarity',      value: product.rarity      }] : []),
        ...(product.printing    ? [{ icon: Package,  label: 'Printing',    value: product.printing    }] : []),
        { icon: Shield,   label: 'Condition',   value: conditionLabel[product.condition] ?? product.condition },
        ...(product.language    ? [{ icon: Calendar, label: 'Language',    value: product.language.toUpperCase() }] : []),
      ]
    : [
        { icon: Tag,      label: 'Set Code',     value: product.set_code },
        { icon: Package,  label: 'Type',         value: (() => {
          switch (product.product_type) {
            case 'case':               return `Case (${product.box_count ?? 6} Booster Boxes)`;
            case 'etb':                return 'Elite Trainer Box';
            case 'upc':                return 'Ultra Premium Collection';
            case 'spc':                return 'Super Premium Collection';
            case 'bundle':             return `Booster Bundle${product.pack_count ? ` (${product.pack_count} Packs)` : ''}`;
            case 'premium_collection': return 'Premium Collection';
            case 'display_case':       return 'Display Case';
            case 'poster_collection':  return 'Poster Collection';
            case 'booster_pack':       return 'Booster Pack';
            case 'blister':            return `Blister Pack${product.pack_count && product.pack_count > 1 ? ` (${product.pack_count} Packs)` : ''}`;
            case 'build_battle':       return 'Build & Battle Box';
            default:                   return `Booster Box${product.pack_count ? ` (${product.pack_count} Packs)` : ' (36 Packs)'}`;
          }
        })() },
        { icon: Shield,   label: 'Condition',    value: 'Factory Sealed' },
        { icon: Calendar, label: 'Release Date', value: formatDate(product.release_date) },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${product.set_name} ${product.product_type === 'booster_box' ? 'Booster Box' : product.product_type.toUpperCase()} (${product.language.toUpperCase()})`,
        description: `${product.set_name} — 100% factory sealed. ${product.language.toUpperCase()} edition. Sold by Apex TCG.`,
        image: product.image_url,
        brand: { '@type': 'Brand', name: BRAND_META[product.brand]?.name ?? product.brand },
        sku: product.set_code,
        offers: {
          '@type': 'Offer',
          url: `https://apextcg.shop/product/${product.slug}`,
          priceCurrency: 'USD',
          price: product.our_price_usd.toFixed(2),
          availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Apex TCG' },
          itemCondition: 'https://schema.org/NewCondition',
        },
      }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Image */}
        <div className="relative">
          <div className={`${meta.bgClass} rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 border border-bg-border`}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${meta.primaryColor}15 0%, transparent 70%)` }} />
            <Image
              src={product.image_url || '/placeholder-box.png'}
              alt={product.set_name}
              width={400}
              height={400}
              className="object-contain relative z-10 drop-shadow-2xl animate-float"
            />
          </div>

          {/* Badges overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_promo && (
              <span className="badge bg-red-600 text-white border border-red-400 font-extrabold text-sm px-3 py-1 shadow-lg shadow-red-600/40">
                🔥 PROMO
              </span>
            )}
            {product.is_pre_order && (
              <span className="badge bg-accent/20 text-accent border border-accent/40 text-sm px-3 py-1">PRE-ORDER</span>
            )}
            {product.product_type === 'case' && (
              <span className="badge bg-mtg-gold/20 text-mtg-gold border border-mtg-gold/30 text-sm px-3 py-1">CASE · EXTRA 5% OFF</span>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <LanguageBadge language={product.language} size="md" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Brand */}
          <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: meta.primaryColor }}>
            {meta.name}
          </span>

          {/* Name */}
          <h1 className="text-3xl font-bold text-white leading-tight">
            {isSingleCard && product.card_name ? product.card_name : product.set_name}
          </h1>

          {/* Stock */}
          <StockBadge quantity={product.stock_quantity} isPreOrder={product.is_pre_order} releaseDate={product.release_date} />

          {/* Promo banner — highlights the deal right above the price */}
          {product.is_promo && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-center gap-3">
              <span className="text-2xl leading-none">🔥</span>
              <div>
                <p className="text-red-400 font-extrabold text-sm tracking-wide">LIMITED-TIME PROMO</p>
              </div>
            </div>
          )}

          <ProductPromos product={product} />

          {/* Price section */}
          <div className="card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Price</span>
              <LivePrice product={product} />
            </div>
            {isSingleCard && (product.low_price_usd || product.mid_price_usd || product.high_price_usd) && (
              <div className="border-t border-bg-border pt-2 grid grid-cols-3 gap-2 text-center">
                {product.low_price_usd  != null && <div><p className="text-muted text-xs">Low</p><p className="text-white text-sm font-medium">${product.low_price_usd.toFixed(2)}</p></div>}
                {product.mid_price_usd  != null && <div><p className="text-muted text-xs">Mid</p><p className="text-white text-sm font-medium">${product.mid_price_usd.toFixed(2)}</p></div>}
                {product.high_price_usd != null && <div><p className="text-muted text-xs">High</p><p className="text-white text-sm font-medium">${product.high_price_usd.toFixed(2)}</p></div>}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card p-4 space-y-3">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-muted text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions (client component) */}
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
