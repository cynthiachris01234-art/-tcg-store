'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/cart';

// After PayPal sends the customer back, capture the payment on the server.
// The order reaches the store only once PayPal confirms the money was taken.
export function PayPalConfirm({ orderId, token }: { orderId: string; token: string }) {
  const { clearCart } = useCart();
  const [state, setState] = useState<'checking' | 'paid' | 'pending' | 'declined' | 'error'>('checking');
  const [amount, setAmount] = useState<number | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let pending: any = null;
    try { pending = JSON.parse(localStorage.getItem('apex-pending-paypal') || 'null'); } catch {}
    const order = pending && pending.id === orderId ? pending : { id: orderId, customer: {}, items: [] };

    fetch('/api/pay/wallet-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, order }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.paid) {
          setAmount(typeof d.amount === 'number' ? d.amount : null);
          setState('paid');
          clearCart();
          try { ['apex-pending-paypal', 'apex-comeback'].forEach(k => localStorage.removeItem(k)); } catch {}
        } else if (d.status === 'declined' || d.status === 'cancelled') setState('declined');
        else if (d.error) setState('error');
        else setState('pending');
      })
      .catch(() => setState('error'));
  }, [orderId, token, clearCart]);

  if (state === 'checking') {
    return (
      <div className="card p-5 mb-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <p className="text-white text-sm">Confirming your PayPal payment…</p>
      </div>
    );
  }
  if (state === 'paid') {
    return (
      <div className="card p-5 mb-4 border-green-500/40 bg-green-500/5 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-white font-bold">Payment confirmed{amount != null ? ` — $${amount.toFixed(2)}` : ''}</p>
          <p className="text-muted text-xs">PayPal will email you a receipt. We&apos;ll ship within 1–2 business days.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-5 mb-4 border-yellow-500/40 bg-yellow-500/5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-muted space-y-2">
        <p>
          {state === 'declined'
            ? 'This PayPal payment was not taken. Nothing was charged.'
            : state === 'pending'
              ? 'PayPal is still processing your payment. We’ll confirm your order by email as soon as it clears.'
              : 'We couldn’t confirm your payment automatically. If you were charged, contact us with your order number — your payment is safe.'}
        </p>
        {state === 'declined' && <Link href="/checkout" className="text-accent hover:underline">Back to checkout</Link>}
      </div>
    </div>
  );
}
