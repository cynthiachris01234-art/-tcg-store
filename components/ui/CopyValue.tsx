'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// One-tap copy for the amount / reference the customer must type into Melio,
// so the payment matches the order exactly.
export function CopyValue({ value, label, big }: { value: string; label: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the value is still shown on screen */ }
  }

  return (
    <button type="button" onClick={copy}
      className="w-full text-left rounded-xl bg-bg border border-bg-border hover:border-accent/60 p-3 transition-colors group">
      <p className="text-muted text-[11px] uppercase tracking-widest">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span className={big ? 'text-accent font-black text-2xl' : 'text-white font-mono font-bold text-lg'}>
          {value}
        </span>
        {copied
          ? <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          : <Copy className="w-4 h-4 text-muted group-hover:text-accent flex-shrink-0" />}
      </div>
      <p className="text-[10px] text-muted mt-0.5">{copied ? 'Copied!' : 'Tap to copy'}</p>
    </button>
  );
}
