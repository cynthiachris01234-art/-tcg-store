'use client';

import { useState } from 'react';
import { X, MessageCircle, Mail, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

const WHATSAPP = '13322728148';
const EMAIL    = 'apextradingcardshop@gmail.com';
const PHONE    = '+13322728148';

export function LiveChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Chat panel */}
      {open && (
        <div className="card w-72 shadow-2xl border border-bg-border overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="bg-accent px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-900 animate-pulse" />
              <p className="text-black font-bold text-sm">Chat with us</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-black/60 hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-2 bg-bg-card">
            <p className="text-muted text-xs mb-3">We typically reply within a few minutes. Choose how you'd like to reach us:</p>

            <a
              href={`https://wa.me/${WHATSAPP}?text=Hi!%20I%20have%20a%20question%20about%20an%20order.`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors group"
            >
              <FaWhatsapp className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">WhatsApp</p>
                <p className="text-muted text-xs">Fastest — usually instant</p>
              </div>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors group"
            >
              <Mail className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Email</p>
                <p className="text-muted text-xs">{EMAIL}</p>
              </div>
            </a>

            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-bg-border hover:bg-white/10 transition-colors group"
            >
              <Phone className="w-5 h-5 text-white/60 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Call / SMS</p>
                <p className="text-muted text-xs">+1 (332) 272-8148</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/30 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Live chat"
      >
        {open
          ? <X className="w-6 h-6 text-black" />
          : <MessageCircle className="w-6 h-6 text-black" />
        }
      </button>
    </div>
  );
}
