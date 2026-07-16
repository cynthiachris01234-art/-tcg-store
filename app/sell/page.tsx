import type { Metadata } from 'next';
import { Tag, Zap, DollarSign, ShieldCheck } from 'lucide-react';
import { SellForm } from '@/components/fifa/SellForm';

export const metadata: Metadata = {
  title: 'Sell Tickets',
  description: 'List your FIFA World Cup 2026 tickets for sale. Reach millions of fans, set your price, and get paid fast.',
};

const STEPS = [
  { icon: Tag, title: 'List in minutes', text: 'Pick your match, section and price. We suggest a competitive market rate.' },
  { icon: Zap, title: 'Reach millions', text: 'Your listing goes live instantly to fans searching across all 16 host cities.' },
  { icon: DollarSign, title: 'Get paid fast', text: 'Once the buyer receives valid tickets, your payout is released after the match.' },
];

export default function SellPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <span className="pill text-fifa-gold border-fifa-gold/30 bg-fifa-gold/10 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Seller Protection Included
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Sell your World Cup tickets</h1>
        <p className="text-muted mt-2 max-w-xl mx-auto">
          The easiest, safest way to sell your FIFA World Cup 2026 tickets to verified buyers worldwide.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(0,460px)] gap-10 items-start">
        <div className="space-y-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card p-5 flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fifa-blue/15 text-fifa-blue-light font-bold">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-fifa-blue-light" /> {s.title}
                </h3>
                <p className="text-sm text-muted mt-1">{s.text}</p>
              </div>
            </div>
          ))}
          <div className="card-blue p-5">
            <h3 className="font-bold text-white">Why sell on Goal26?</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-300">
              <li>• Industry-low 10% seller fee</li>
              <li>• Dynamic pricing suggestions from live market data</li>
              <li>• Guaranteed payment once tickets are delivered</li>
              <li>• Sell mobile tickets with instant transfer</li>
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold text-white mb-3">Create your listing</h2>
          <SellForm />
        </div>
      </div>
    </div>
  );
}
