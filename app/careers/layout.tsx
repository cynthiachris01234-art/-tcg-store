import { BrandMark } from './BrandMark';
import { COMPANY } from './data';

// The careers section is visually self-contained: it renders its own header and
// footer (the marketplace chrome is suppressed for /careers in SiteChrome) and
// paints an opaque light background over the site's dark ambient layers.
export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#f4f6f9] text-[#1b2735]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <BrandMark />
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#5b6b80]">
            Careers
          </span>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-8 text-center">
          <BrandMark />
          <p className="text-xs text-[#6b7a8d]">
            © {COMPANY.copyrightYear} {COMPANY.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
