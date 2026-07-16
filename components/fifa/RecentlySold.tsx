import { CheckCircle2 } from 'lucide-react';
import { getRecentlySold } from '@/lib/fifa/listings';
import { formatPrice, relativeTimeAgo } from '@/lib/fifa/format';

export function RecentlySold() {
  const sold = getRecentlySold().slice(0, 8);
  return (
    <div className="card divide-y divide-bg-border overflow-hidden">
      {sold.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white truncate">{s.matchLabel}</div>
            <div className="text-xs text-muted truncate">
              {s.category} · {s.quantity} ticket{s.quantity > 1 ? 's' : ''} · {s.city}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-fifa-green text-sm font-bold justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" /> {formatPrice(s.price)}
            </div>
            <div className="text-[11px] text-muted">{relativeTimeAgo(s.soldMinutesAgo)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
