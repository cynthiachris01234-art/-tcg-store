'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Landing page for the abandoned-checkout email: rebuilds the customer's cart,
// saves the free-shipping token, then sends them to checkout.
function Recover() {
  const params = useSearchParams();
  useEffect(() => {
    const pairs = (params.get('i') ?? '').split(',').filter(Boolean).map(pair => {
      const [id, q] = pair.split(':');
      return { id, quantity: Math.max(1, Math.min(99, Number(q) || 1)) };
    }).filter(p => p.id);
    const token = params.get('t');
    if (token) {
      try { localStorage.setItem('apex-comeback', token); } catch {}
    }
    if (!pairs.length) {
      window.location.replace('/shop');
      return;
    }
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: pairs.map(p => p.id) }),
    })
      .then(r => r.json())
      .then((d: { products?: { id: string }[] }) => {
        const byId = new Map((d.products ?? []).map(p => [p.id, p]));
        const items = pairs
          .map(p => {
            const product = byId.get(p.id);
            return product ? { product, quantity: p.quantity } : null;
          })
          .filter(Boolean);
        try {
          if (items.length) localStorage.setItem('apex-cart-restore', JSON.stringify({ items }));
        } catch {}
        window.location.replace(items.length ? '/checkout' : '/shop');
      })
      .catch(() => { window.location.replace('/shop'); });
  }, [params]);
  return null;
}

export default function RecoverCartPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
      <p className="text-white font-semibold">Restoring your cart…</p>
      <p className="text-muted text-sm mt-1">Free shipping is being applied.</p>
      <Suspense fallback={null}><Recover /></Suspense>
    </div>
  );
}
