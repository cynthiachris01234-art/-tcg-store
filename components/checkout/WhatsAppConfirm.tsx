'use client';

import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';

const WHATSAPP = '13322728148';
const LABELS: Record<string, string> = { wise: 'Wise', venmo: 'Venmo', applepay: 'Apple Pay' };

// Big "Confirm on WhatsApp" step after placing an order. The message is typed
// in for the customer: order number, items, total and payment method.
export function WhatsAppConfirm({ orderId, method, amount }: { orderId: string; method: string; amount?: string }) {
  const [items, setItems] = useState<{ setName: string; quantity: number }[]>([]);

  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem('apex-whatsapp-order') || 'null');
      if (o?.id === orderId && Array.isArray(o.items)) setItems(o.items);
    } catch {}
  }, [orderId]);

  const pay = LABELS[method] ?? method;
  const text = [
    `Hi Apex TCG! I'd like to confirm my order ${orderId}.`,
    ...items.map(i => `• ${i.quantity}× ${i.setName}`),
    amount ? `Total: $${amount}` : null,
    `Payment: ${pay}`,
    `Please send me the ${pay} payment details.`,
  ].filter(Boolean).join('\n');
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  return (
    <div className="card p-5 mb-4 border-[#25D366]/50 bg-[#25D366]/5">
      <p className="text-white font-bold text-lg mb-1">Last step — confirm your order on WhatsApp</p>
      <p className="text-muted text-sm mb-4">
        Your order is reserved. Tap below and send the message — we&apos;ll reply with our <strong className="text-white">{pay}</strong> payment
        details{amount && <> for <strong className="text-white">${amount}</strong></>}.
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-[#25D366] hover:brightness-110 transition">
        <FaWhatsapp className="w-5 h-5" /> Confirm my order on WhatsApp
      </a>
      <p className="text-muted text-xs mt-3">
        Or message <a href={`https://wa.me/${WHATSAPP}`} className="text-accent hover:underline">+1 (332) 272-8148</a> with your order number{' '}
        <strong className="text-white">{orderId}</strong>.
      </p>
    </div>
  );
}
