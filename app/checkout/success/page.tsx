import Link from 'next/link';
import { CheckCircle2, MessageCircle, Mail, ArrowRight, Clock } from 'lucide-react';

export const metadata = { title: 'Order Confirmed — Apex TCG' };

const METHOD_LABELS: Record<string, { icon: string; label: string; detail: string }> = {
  zelle:    { icon: '💚', label: 'Zelle',            detail: 'We\'ll text you our Zelle number/email' },
  cashapp:  { icon: '💵', label: 'CashApp',          detail: 'We\'ll send you our $CashTag' },
  venmo:    { icon: '🔵', label: 'Venmo',            detail: 'We\'ll send you our Venmo handle' },
  paypal:   { icon: '💙', label: 'PayPal',           detail: 'We\'ll send you a PayPal payment request' },
  applepay: { icon: '🍎', label: 'Apple Pay',        detail: 'We\'ll send you an Apple Pay request' },
  wise:     { icon: '🌍', label: 'Wise Transfer',    detail: 'We\'ll send our Wise account details' },
  wire:     { icon: '🏦', label: 'Bank Wire / ACH',  detail: 'We\'ll send our bank account details' },
};

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; method?: string };
}) {
  const method = searchParams.method ?? 'zelle';
  const methodInfo = METHOD_LABELS[method] ?? METHOD_LABELS.zelle;

  return (
    <div className="max-w-xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Order Placed!</h1>
        <p className="text-muted text-base">Your order is confirmed and reserved for you.</p>
        {searchParams.order && (
          <p className="text-muted text-sm mt-2">
            Order ID: <span className="text-accent font-mono font-bold text-base">{searchParams.order}</span>
          </p>
        )}
      </div>

      {/* Payment instructions */}
      <div className="card p-5 mb-4 border-accent/40 bg-accent/5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{methodInfo.icon}</span>
          <div>
            <p className="text-white font-bold">Pay via {methodInfo.label}</p>
            <p className="text-muted text-xs">{methodInfo.detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          We will contact you within 2 hours with payment details
        </div>
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="https://wa.me/13322728148"
          target="_blank" rel="noopener noreferrer"
          className="card p-4 flex flex-col items-center gap-2 hover:border-green-400/50 transition-all group"
        >
          <MessageCircle className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          <span className="text-white text-sm font-semibold">WhatsApp Us</span>
          <span className="text-muted text-xs">+1 (332) 272-8148</span>
        </a>
        <a
          href="mailto:support@apextcg.shop"
          className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-all group"
        >
          <Mail className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-white text-sm font-semibold">Email Us</span>
          <span className="text-muted text-xs">support@apextcg.shop</span>
        </a>
      </div>

      {/* What's next */}
      <div className="card p-5 mb-6 space-y-3 text-sm">
        <p className="text-white font-bold">What happens next?</p>
        {[
          { n: '1', text: 'We receive your order and verify stock' },
          { n: '2', text: `We send you the ${methodInfo.label} payment link via WhatsApp/email` },
          { n: '3', text: 'You complete payment — we ship within 1–2 business days' },
          { n: '4', text: 'You receive a tracking number once dispatched' },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
            <span className="text-muted">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop" className="btn-primary flex items-center justify-center gap-2">
          Keep Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/" className="btn-outline flex items-center justify-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
