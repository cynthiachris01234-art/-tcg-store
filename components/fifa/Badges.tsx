import { Zap, Smartphone, Star, Flame, TrendingDown, AlertTriangle, BadgeCheck } from 'lucide-react';
import type { ListingTag, SectionCategory, Stage } from '@/lib/fifa/types';
import { SECTION_BY_CATEGORY } from '@/lib/fifa/listings';

export function InstantDeliveryBadge() {
  return (
    <span className="badge bg-fifa-green/15 text-fifa-green border border-fifa-green/30">
      <Zap className="w-3 h-3" /> Instant
    </span>
  );
}

export function MobileTicketBadge() {
  return (
    <span className="badge bg-fifa-blue/15 text-fifa-blue-light border border-fifa-blue/30">
      <Smartphone className="w-3 h-3" /> Mobile
    </span>
  );
}

export function TagBadge({ tag }: { tag: ListingTag }) {
  if (!tag) return null;
  if (tag === 'Best Value')
    return (
      <span className="badge bg-fifa-green text-white">
        <TrendingDown className="w-3 h-3" /> Best Value
      </span>
    );
  if (tag === 'Hot Deal')
    return (
      <span className="badge text-white" style={{ background: 'linear-gradient(135deg,#ff7a00,#e4002b)' }}>
        <Flame className="w-3 h-3" /> Hot Deal
      </span>
    );
  return (
    <span className="badge bg-fifa-gold/20 text-fifa-gold border border-fifa-gold/40">
      <AlertTriangle className="w-3 h-3" /> Only a Few Left
    </span>
  );
}

export function SellerRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Star className="w-3.5 h-3.5 fill-fifa-gold text-fifa-gold" />
      <span className="font-semibold text-gray-200">{rating.toFixed(1)}</span>
      <span className="text-muted">({reviews.toLocaleString()})</span>
    </span>
  );
}

export function VerifiedSeller() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-fifa-blue-light">
      <BadgeCheck className="w-3.5 h-3.5" /> Verified
    </span>
  );
}

const STAGE_STYLES: Record<Stage, string> = {
  'Final': 'bg-fifa-gold text-fifa-navy',
  'Third Place': 'bg-amber-700/30 text-amber-300 border border-amber-500/30',
  'Semi-final': 'bg-fifa-red/20 text-red-300 border border-fifa-red/40',
  'Quarter-final': 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30',
  'Round of 16': 'bg-fifa-blue/20 text-fifa-blue-light border border-fifa-blue/40',
  'Round of 32': 'bg-fifa-blue/15 text-blue-200 border border-fifa-blue/30',
  'Group Stage': 'bg-white/8 text-gray-300 border border-white/10',
};

export function StageBadge({ stage, group }: { stage: Stage; group?: string }) {
  return (
    <span className={`badge ${STAGE_STYLES[stage]}`}>
      {stage}
      {group ? ` · Group ${group}` : ''}
    </span>
  );
}

const CAT_COLOR: Record<string, string> = {
  Field: '#ffc629',
  Club: '#c084fc',
  Lower: '#1763ff',
  Mid: '#22c55e',
  Upper: '#38bdf8',
};

export function CategoryDot({ category }: { category: SectionCategory }) {
  const tier = SECTION_BY_CATEGORY[category]?.tier ?? 'Mid';
  return <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLOR[tier] }} />;
}

export function categoryColor(category: SectionCategory): string {
  const tier = SECTION_BY_CATEGORY[category]?.tier ?? 'Mid';
  return CAT_COLOR[tier];
}
