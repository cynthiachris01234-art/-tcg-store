import { LANGUAGE_META } from '@/lib/brands';
import type { Language } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  language: Language;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
};

export function LanguageBadge({ language, size = 'sm' }: Props) {
  const meta = LANGUAGE_META[language];
  return (
    <span className={cn(
      'badge bg-white/10 border border-white/20 text-white font-semibold',
      sizeClasses[size]
    )}>
      {meta.flag} {meta.shortLabel}
    </span>
  );
}
