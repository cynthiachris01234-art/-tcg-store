'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/cart';

// After Stripe redirects back, ask the server to verify the payment with
// Stripe and record the order. The order only reaches the store once Stripe
// says it's paid.
export function StripeConfirm({ orderId, sessionId }: { orderId: string; sessionId: string }) {
  const { clearCart } = useCart();
  const [state, setState] = useState<'checking' | 'paid' | 'unpaid' | 'error'>('checking');
  const [amount, setAmount] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let pending: any = null;
    try { pending = JSON.parse(localStorage.getItem('apex-pending-stripe') || 'null'); } catch {}
    const order = pending && pending.id === orderId ? pending : { id: orderId, customer: {}, items: [] };

    fetch('/api/pay/card-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, order }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.paid) {
          setAmount(typeof d.amount === 'number' ? d.amount : null);
          setState('paid');
          clearCart();
          try { localStorage.removeItem('apex-pending-stripe'); localStorage.removeItem('apex-comeback'); } catch {}
        } else if (d.error) setState('error');
        else setState('unpaid');
      })
      .catch(() => setState('error'));
  }, [orderId, sessionId, clearCart]);

  if (state === 'checking') {
    return (
      <div className="card p-5 mb-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <p className="text-white text-sm">Confirming your payment with Stripe…</p>
      </div>
    );
  }
  if (state === 'paid') {
    return (
      <div className="card p-5 mb-4 border-green-500/40 bg-green-500/5 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-white font-bold">Payment confirmed{amount != null ? ` — $${amount.toFixed(2)}` : ''}</p>
          <p className="text-muted text-xs">A receipt is on its way to your email. We&apos;ll ship within 1–2 business days.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-5 mb-4 border-yellow-500/40 bg-yellow-500/5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <p className="text-muted text-sm">
        {state === 'unpaid'
          ? 'Your payment hasn’t completed yet. If you were charged, contact us with your order number and we’ll sort it out.'
          : 'We couldn’t confirm your payment automatically. If you were charged, contact us with your order number — your payment is safe.'}
      </p>
    </div>
  );
}
