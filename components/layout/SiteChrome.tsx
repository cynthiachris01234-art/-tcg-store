'use client';

import { usePathname } from 'next/navigation';

// Route prefixes that ship their own header/footer and must not inherit the
// marketplace chrome (demo ribbon, navbar, footer).
const STANDALONE_PREFIXES = ['/careers'];

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const standalone = STANDALONE_PREFIXES.some(
    p => pathname === p || pathname.startsWith(`${p}/`),
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!standalone && header}
      <main className="flex-1">{children}</main>
      {!standalone && footer}
    </div>
  );
}
