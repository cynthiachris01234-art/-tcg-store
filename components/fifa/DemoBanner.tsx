import { Palette } from 'lucide-react';

// Always-visible, non-dismissible ribbon making it unambiguous that this is a
// design/portfolio demo — not affiliated with FIFA and not a real ticket seller.
export function DemoBanner() {
  return (
    <div className="bg-fifa-gold text-fifa-navy">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-center text-[11px] sm:text-xs font-semibold">
        <Palette className="w-3.5 h-3.5 shrink-0" />
        <span>
          Design demo &amp; portfolio concept — <span className="font-extrabold">not affiliated with or endorsed by FIFA</span>.
          No real tickets are sold and no payments are processed.
        </span>
      </div>
    </div>
  );
}
