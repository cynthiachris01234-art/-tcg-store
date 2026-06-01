import { stockStatusLabel, stockStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  quantity: number;
  isPreOrder: boolean;
}

export function StockBadge({ quantity, isPreOrder }: Props) {
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
