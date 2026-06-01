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
  const currency: Currency = 'USD';
  const [rates] = useState(initialRates);

  const setCurrency = useCallback((_c: Currency) => {}, []); // locked to USD

  const convert = useCallback(
    (usdAmount: number) => +usdAmount.toFixed(2),
    []
  );

  const format = useCallback(
    (usdAmount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    },
    []
  );

  return createElement(CurrencyContext.Provider, { value: { currency, setCurrency, convert, format, rates } }, children);
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
