'use client';

import { createContext, useContext, useState, useCallback, ReactNode, createElement } from 'react';
import type { Currency, ExchangeRates } from '@/types';

// ─── Static fallback rates (refreshed by cron) ───────────────────────────────

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  JPY: 155.0,
  KRW: 1340.0,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
};

export const CURRENCIES: Currency[] = ['USD', 'CAD', 'EUR', 'JPY', 'KRW'];

// ─── Context ─────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  rates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  convert: (n) => n,
  format: (n) => `$${n.toFixed(2)}`,
  rates: FALLBACK_RATES,
});

export function CurrencyProvider({
  children,
  initialRates = FALLBACK_RATES,
}: {
  children: ReactNode;
  initialRates?: Record<Currency, number>;
}) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates] = useState(initialRates);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tcg_currency', c);
    }
  }, []);

  const convert = useCallback(
    (usdAmount: number) => +(usdAmount * rates[currency]).toFixed(2),
    [currency, rates]
  );

  const format = useCallback(
    (usdAmount: number) => {
      const converted = usdAmount * rates[currency];
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
      }).format(converted);
    },
    [currency, rates]
  );

  return createElement(CurrencyContext.Provider, { value: { currency, setCurrency, convert, format, rates } }, children);
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
