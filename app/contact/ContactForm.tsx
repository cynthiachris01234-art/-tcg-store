'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const TOPICS = ['Question about a product', 'My order', 'Wholesale / bulk order', 'Returns & refunds', 'Other'];

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setState('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Could not send. Please try again.');
      setState('sent');
    } catch (err: any) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <div className="card p-8 text-center border-green-500/30 bg-green-500/5">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <p className="text-white font-bold text-lg">Message sent!</p>
        <p className="text-muted text-sm mt-1">We usually reply within 2 hours. Keep an eye on your email.</p>
      </div>
    );
  }

  const input = 'w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted/50 ' +
    'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <h2 className="text-white font-bold text-lg">Send us a message</h2>
      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-muted text-xs mb-1.5" htmlFor="c-name">Name</label>
          <input id="c-name" name="name" required maxLength={100} className={input} />
        </div>
        <div>
          <label className="block text-muted text-xs mb-1.5" htmlFor="c-email">Email</label>
          <input id="c-email" name="email" type="email" required maxLength={200} className={input} />
        </div>
        <div>
          <label className="block text-muted text-xs mb-1.5" htmlFor="c-phone">Phone / WhatsApp (optional)</label>
          <input id="c-phone" name="phone" type="tel" maxLength={40} className={input} />
        </div>
        <div>
          <label className="block text-muted text-xs mb-1.5" htmlFor="c-order">Order number (optional)</label>
          <input id="c-order" name="order" placeholder="APX-XXXXXX" maxLength={30} className={input} />
        </div>
      </div>
      <div>
        <label className="block text-muted text-xs mb-1.5" htmlFor="c-topic">Topic</label>
        <select id="c-topic" name="topic" className={input} defaultValue={TOPICS[0]}>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-muted text-xs mb-1.5" htmlFor="c-message">Message</label>
        <textarea id="c-message" name="message" required rows={5} maxLength={3000} className={input} />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={state === 'sending'}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 font-bold disabled:opacity-60">
        {state === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send message</>}
      </button>
    </form>
  );
}
