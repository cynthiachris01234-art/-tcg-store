import type { BrandMeta, Brand } from '@/types';

export const BRAND_META: Record<Brand, BrandMeta> = {
  pokemon: {
    id: 'pokemon',
    name: 'Pokémon TCG',
    tagline: 'Gotta catch every booster box',
    gradient: 'bg-pokemon-gradient',
    primaryColor: '#facc15',
    secondaryColor: '#3b82f6',
    glowClass: 'shadow-glow-pokemon',
    borderClass: 'border-pokemon',
    textClass: 'text-pokemon',
    bgClass: 'bg-pokemon-gradient',
  },
  onepiece: {
    id: 'onepiece',
    name: 'One Piece TCG',
    tagline: 'Set sail for the Grand Line',
    gradient: 'bg-onepiece-gradient',
    primaryColor: '#ef4444',
    secondaryColor: '#0a0a0f',
    glowClass: 'shadow-glow-onepiece',
    borderClass: 'border-onepiece',
    textClass: 'text-onepiece',
    bgClass: 'bg-onepiece-gradient',
  },
  mtg: {
    id: 'mtg',
    name: 'Magic: The Gathering',
    tagline: 'Tap into legendary power',
    gradient: 'bg-mtg-gradient',
    primaryColor: '#d97706',
    secondaryColor: '#fbbf24',
    glowClass: 'shadow-glow-mtg',
    borderClass: 'border-mtg',
    textClass: 'text-mtg',
    bgClass: 'bg-mtg-gradient',
  },
  yugioh: {
    id: 'yugioh',
    name: 'Yu-Gi-Oh!',
    tagline: 'It\'s time to duel',
    gradient: 'bg-yugioh-gradient',
    primaryColor: '#7c3aed',
    secondaryColor: '#fbbf24',
    glowClass: 'shadow-glow-yugioh',
    borderClass: 'border-yugioh',
    textClass: 'text-yugioh',
    bgClass: 'bg-yugioh-gradient',
  },
};

export const BRANDS: Brand[] = ['pokemon', 'onepiece', 'mtg', 'yugioh'];

export const LANGUAGE_META = {
  en: { code: 'en', label: 'English', flag: '🇺🇸', shortLabel: 'EN' },
  jp: { code: 'jp', label: 'Japanese', flag: '🇯🇵', shortLabel: 'JP' },
  kr: { code: 'kr', label: 'Korean', flag: '🇰🇷', shortLabel: 'KR' },
} as const;

export const LANGUAGES = ['en', 'jp', 'kr'] as const;
