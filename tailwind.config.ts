import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* APEX TCG base — pure black with gold accents */
        bg:      { DEFAULT: '#000000', card: '#0d0d0d', border: '#1e1e1e' },
        surface: '#111111',
        muted:   '#6b7280',

        /* APEX TCG signature colors */
        gold:   { DEFAULT: '#C8962A', light: '#E5B84D', dark: '#8B6418', glow: 'rgba(200,150,42,0.35)' },
        silver: { DEFAULT: '#C8C8D0', dark: '#888898' },

        /* Brand palettes */
        pokemon: { DEFAULT: '#facc15', blue: '#3b82f6', dark: '#0a0800' },
        onepiece:{ DEFAULT: '#ef4444', black: '#000000', gold: '#f59e0b' },
        mtg:     { DEFAULT: '#d97706', gold: '#fbbf24', dark: '#100a00' },
        yugioh:  { DEFAULT: '#7c3aed', gold: '#fbbf24', dark: '#060010' },

        /* Accent = APEX gold */
        accent:  { DEFAULT: '#C8962A', hover: '#B5841E' },
        success: '#22c55e',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':     'linear-gradient(135deg, #000000 0%, #0d0d0d 50%, #111111 100%)',
        'apex-gradient':     'linear-gradient(135deg, #000000 0%, #1a1100 50%, #000000 100%)',
        'card-shine':        'linear-gradient(135deg, rgba(200,150,42,0.06) 0%, transparent 50%)',
        'gold-shimmer':      'linear-gradient(90deg, transparent 0%, rgba(200,150,42,0.15) 50%, transparent 100%)',
        'pokemon-gradient':  'linear-gradient(135deg, #0a0800 0%, #1a1200 100%)',
        'onepiece-gradient': 'linear-gradient(135deg, #000000 0%, #2a0000 100%)',
        'mtg-gradient':      'linear-gradient(135deg, #100a00 0%, #2a1800 100%)',
        'yugioh-gradient':   'linear-gradient(135deg, #060010 0%, #180030 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'card':         '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.8), 0 0 1px rgba(200,150,42,0.2)',
        'gold':         '0 0 24px rgba(200,150,42,0.4)',
        'gold-sm':      '0 0 12px rgba(200,150,42,0.25)',
        'glow-pokemon':  '0 0 20px rgba(250,204,21,0.3)',
        'glow-onepiece': '0 0 20px rgba(239,68,68,0.3)',
        'glow-mtg':      '0 0 20px rgba(217,119,6,0.3)',
        'glow-yugioh':   '0 0 20px rgba(124,58,237,0.3)',
        'glow-accent':   '0 0 20px rgba(200,150,42,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
