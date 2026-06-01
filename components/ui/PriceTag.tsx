'use client';

import { useCurrency } from '@/lib/currency';
import { calcSavings } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface Props {
  marketPriceUSD: number;
  ourPriceUSD: number;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
}

const sizes = {
  sm: { market: 'text-xs', ours: 'text-base', badge: 'text-xs' },
  md: { market: 'text-sm', ours: 'text-xl',   badge: 'text-xs' },
  lg: { market: 'text-base',ours: 'text-3xl', badge: 'text-sm' },
};

export function PriceTag({ marketPriceUSD, ourPriceUSD, size = 'md', showSavings = true }: Props) {
  const { format } = useCurrency();
  const { amount, percent } = calcSavings(marketPriceUSD, ourPriceUSD);
  const s = sizes[size];

  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn('text-muted line-through', s.market)}>
        Market {format(marketPriceUSD)}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-white font-bold', s.ours)}>
          {format(ourPriceUSD)}
        </span>
        {showSavings && (
          <span className={cn('badge bg-success/20 text-success border border-success/30', s.badge)}>
            -{percent}%
          </span>
        )}
      </div>
      {showSavings && (
        <span className={cn('text-success', s.badge)}>
          You save {format(amount)}
        </span>
      )}
    </div>
  );
}
