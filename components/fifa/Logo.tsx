export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="g26ball" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#0a2e8c" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#g26ball)" stroke="#ffc629" strokeWidth="2" />
        {/* stylised soccer-ball facets */}
        <path d="M20 9l5 3.6-1.9 5.9h-6.2L15 12.6 20 9z" fill="#070d1c" />
        <path d="M9.5 18.5l4.6 1.2 1 5.8-4.4 3.1-3-6.8 1.8-3.3z" fill="#070d1c" opacity="0.85" />
        <path d="M30.5 18.5l-4.6 1.2-1 5.8 4.4 3.1 3-6.8-1.8-3.3z" fill="#070d1c" opacity="0.85" />
      </svg>
      <span className="font-extrabold tracking-tight text-lg leading-none">
        <span className="text-white">Goal</span>
        <span className="text-gold">26</span>
      </span>
    </span>
  );
}
