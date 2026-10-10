'use client';

import { stockStatusLabel, stockStatusColor, shortDate, isComingSoon } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  quantity: number;
  isPreOrder: boolean;
  /** Release date — if it's still in the future (and not a pre-order), shows "Coming Soon". */
  releaseDate?: string;
}

// Client component so the release-date check runs at view time: an unreleased
// product flips from "Coming Soon" to its stock status on release day, even on
// pages that were cached at deploy time.
export function StockBadge({ quantity, isPreOrder, releaseDate }: Props) {
  if (releaseDate && isComingSoon({ release_date: releaseDate, is_pre_order: isPreOrder })) {
    return (
      <span className="text-xs font-semibold flex items-center gap-1 text-accent">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Coming Soon · {shortDate(releaseDate)}
      </span>
    );
  }
  const label = stockStatusLabel(quantity, isPreOrder);
  const color = stockStatusColor(quantity, isPreOrder);
  return (
    <span className={cn('text-xs font-semibold flex items-center gap-1', color)}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        isPreOrder          ? 'bg-accent'   :
        quantity === 0      ? 'bg-danger'   :
        quantity <= 5       ? 'bg-yellow-400' : 'bg-success'
      )} />
      {label}
    </span>
  );
}
