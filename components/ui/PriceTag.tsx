'use client';

import { useCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface Props {
  marketPriceUSD: number;
  ourPriceUSD: number;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
}

const sizes = {
  sm: { ours: 'text-base' },
  md: { ours: 'text-xl' },
  lg: { ours: 'text-3xl' },
};

export function PriceTag({ ourPriceUSD, size = 'md' }: Props) {
  const { format } = useCurrency();
  const s = sizes[size];

  return (
    <div className="flex items-baseline">
      <span className={cn('text-white font-bold', s.ours)}>
        {format(ourPriceUSD)}
      </span>
    </div>
  );
}
