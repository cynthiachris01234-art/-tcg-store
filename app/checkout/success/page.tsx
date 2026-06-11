import Link from 'next/link';
import { CheckCircle2, ArrowRight, Clock, Phone } from 'lucide-react';

export const metadata = { title: 'Order Confirmed — Apex TCG' };

const METHOD_LABELS: Record<string, { icon: string; label: string; detail: string; isPaid?: boolean }> = {
  card:     { icon: '💳', label: 'Credit / Debit Card', detail: 'Payment confirmed — your order is being processed', isPaid: true },
  wise:     { icon: '🌍', label: 'Wise Transfer',        detail: 'We\'ll send our Wise account details' },
  applepay: { icon: '🍎', label: 'Apple Pay',            detail: 'We\'ll send you an Apple Pay payment request' },
  cashapp:  { icon: '💵', label: 'Cash App',             detail: 'We\'ll send you our $Cashtag' },
  paypal:   { icon: '🅿️', label: 'PayPal',              detail: 'We\'ll send you a PayPal payment request' },
};

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; method?: string };
}) {
  const method = searchParams.method ?? 'wise';
  const info   = METHOD_LABELS[method] ?? METHOD_LABELS.wise;
  const isPaid = info.isPaid ?? false;

  const nextSteps = isPaid
    ? [
        { n: '1', text: 'Your payment was captured — order is confirmed' },
        { n: '2', text: 'We verify stock and prepare your shipment' },
        { n: '3', text: 'Your order ships within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ]
    : [
        { n: '1', text: 'We receive your order and verify stock' },
        { n: '2', text: `We send your ${info.label} payment details via SMS, WhatsApp or email` },
        { n: '3', text: 'You complete payment — we ship within 1–2 business days' },
        { n: '4', text: 'You receive a tracking number once dispatched' },
      ];

  return (
    <div className="max-w-xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isPaid ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
          <CheckCircle2 className={`w-10 h-10 ${isPaid ? 'text-green-400' : 'text-green-400'}`} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          {isPaid ? 'Payment Successful!' : 'Order Placed!'}
        </h1>
        <p className="text-muted text-base">
          {isPaid ? 'Your card was charged and your order is confirmed.' : 'Your order is confirmed and reserved for you.'}
        </p>
        {searchParams.order && (
          <p className="text-muted text-sm mt-2">
            Order ID: <span className="text-accent font-mono font-bold text-base">{searchParams.order}</span>
          </p>
        )}
      </div>

      {/* Payment status */}
      <div className={`card p-5 mb-4 ${isPaid ? 'border-green-500/40 bg-green-500/5' : 'border-accent/40 bg-accent/5'}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <p className="text-white font-bold">
              {isPaid ? `Paid via ${info.label}` : `Pay via ${info.label}`}
            </p>
            <p className="text-muted text-xs">{info.detail}</p>
          </div>
        </div>
        {!isPaid && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            We will contact you within 2 hours with payment details
          </div>
        )}
        {isPaid && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Payment captured — order is processing
          </div>
        )}
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a href="tel:+13322728148"
          className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-all group">
          <Phone className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-white text-xs font-semibold text-center">Call / SMS</span>
          <span className="text-muted text-[10px] text-center">+1 332-272-8148</span>
        </a>
        <a href="https://wa.me/13322728148" target="_blank" rel="noopener noreferrer"
          className="card p-4 flex flex-col items-center gap-2 hover:border-green-400/50 transition-all group">
          <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
          <span className="text-white text-xs font-semibold">WhatsApp</span>
          <span className="text-muted text-[10px]">+1 332-272-8148</span>
        </a>
        <a href="mailto:apextradingcardshop@gmail.com"
          className="card p-4 flex flex-col items-center gap-2 hover:border-accent/50 transition-all group">
          <span className="text-2xl group-hover:scale-110 transition-transform">📧</span>
          <span className="text-white text-xs font-semibold">Email</span>
          <span className="text-muted text-[10px] text-center">apextradingcardshop@gmail.com</span>
        </a>
      </div>

      {/* What's next */}
      <div className="card p-5 mb-6 space-y-3 text-sm">
        <p className="text-white font-bold">What happens next?</p>
        {nextSteps.map(({ n, text }) => (
          <div key={n} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
            <span className="text-muted leading-relaxed">{text}</span>
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
