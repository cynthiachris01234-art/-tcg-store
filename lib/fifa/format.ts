// Formatting helpers for the FIFA marketplace (SSR-safe — fixed timezone).

export function formatPrice(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatPriceK(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return '$' + n;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse the fixed ISO (with offset) into display parts without depending on the
// runtime's local timezone — keeps server and client output identical.
function parts(iso: string) {
  // iso like 2026-07-19T15:00:00-04:00
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  return {
    year: +y, month: +mo, day: +d, hour: +h, minute: +mi,
    weekday: DAYS[date.getUTCDay()],
    monthName: MONTHS[+mo - 1],
  };
}

export function formatMatchDate(iso: string): string {
  const p = parts(iso);
  if (!p) return iso;
  return `${p.weekday} ${p.monthName} ${p.day}, ${p.year}`;
}

export function formatMatchDateShort(iso: string): string {
  const p = parts(iso);
  if (!p) return iso;
  return `${p.monthName} ${p.day}`;
}

export function formatKickoff(iso: string): string {
  const p = parts(iso);
  if (!p) return '';
  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  const ampm = p.hour < 12 ? 'AM' : 'PM';
  const mm = p.minute.toString().padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

export function relativeTimeAgo(minutes: number): string {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}
