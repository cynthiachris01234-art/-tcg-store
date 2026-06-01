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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function daysUntil(dateString: string): number {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function stockStatusLabel(qty: number, isPreOrder: boolean): string {
  if (isPreOrder) return 'Pre-Order';
  if (qty === 0) return 'Out of Stock';
  if (qty <= 5) return `Only ${qty} left`;
  return 'In Stock';
}

export function stockStatusColor(qty: number, isPreOrder: boolean): string {
  if (isPreOrder) return 'text-accent';
  if (qty === 0) return 'text-danger';
  if (qty <= 5) return 'text-yellow-400';
  return 'text-success';
}
