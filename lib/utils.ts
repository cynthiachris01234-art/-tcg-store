import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(dateString: string): string {
  // Dates are stored as plain "YYYY-MM-DD". Format in UTC so a visitor behind
  // UTC (e.g. the US) doesn't see the previous day.
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export function daysUntil(dateString: string): number {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// A product whose release date is still in the future and that is NOT offered
// as a pre-order is "Coming Soon": visible, but not orderable. It unlocks on its
// own once the release date arrives — no manual change needed.
export function isComingSoon(p: { release_date?: string; is_pre_order?: boolean }): boolean {
  if (p.is_pre_order || !p.release_date) return false;
  return p.release_date > new Date().toISOString().slice(0, 10);
}

// "Oct 2" style short date for badges.
export function shortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function stockStatusLabel(qty: number, isPreOrder: boolean): string {
  if (isPreOrder) return 'Pre-Order';
  if (qty === 0) return 'Sold Out';
  if (qty <= 5) return `Only ${qty} left`;
  return `${qty} in stock`;
}

export function stockStatusColor(qty: number, isPreOrder: boolean): string {
  if (isPreOrder) return 'text-accent';
  if (qty === 0) return 'text-danger';
  if (qty <= 5) return 'text-yellow-400';
  return 'text-success';
}
