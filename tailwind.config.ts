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
        /* FIFA World Cup 2026 — deep navy base */
        bg:      { DEFAULT: '#070d1c', card: '#0c1426', border: '#1c2942' },
        surface: '#0f1a30',
        muted:   '#8a98b5',

        /* FIFA signature palette — royal blue, white & gold */
        fifa: {
          blue:     '#1763ff',
          'blue-light': '#3b82f6',
          'blue-dark':  '#0a2e8c',
          navy:     '#070d1c',
          gold:     '#ffc629',
          'gold-dark': '#d4a017',
          red:      '#e4002b',
          green:    '#00a651',
        },

        /* Gold accents (shared with legacy components) */
        gold:   { DEFAULT: '#ffc629', light: '#ffd95e', dark: '#d4a017', glow: 'rgba(255,198,41,0.35)' },
        silver: { DEFAULT: '#C8C8D0', dark: '#888898' },

        /* Legacy brand palettes (kept for unused TCG pages) */
        pokemon: { DEFAULT: '#facc15', blue: '#3b82f6', dark: '#0a0800' },
        onepiece:{ DEFAULT: '#ef4444', black: '#000000', gold: '#f59e0b' },
        mtg:     { DEFAULT: '#d97706', gold: '#fbbf24', dark: '#100a00' },
        yugioh:  { DEFAULT: '#7c3aed', gold: '#fbbf24', dark: '#060010' },

        /* Accent = FIFA blue */
        accent:  { DEFAULT: '#1763ff', hover: '#3b82f6' },
        success: '#22c55e',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':     'linear-gradient(135deg, #070d1c 0%, #0a2e8c 55%, #1763ff 100%)',
        'fifa-gradient':     'linear-gradient(135deg, #070d1c 0%, #0a1f5c 50%, #070d1c 100%)',
        'pitch-gradient':    'radial-gradient(ellipse at 50% 0%, rgba(23,99,255,0.20) 0%, transparent 60%)',
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
        'card':         '0 4px 24px rgba(0,0,0,0.55)',
        'card-hover':   '0 10px 44px rgba(0,0,0,0.7), 0 0 0 1px rgba(23,99,255,0.25)',
        'gold':         '0 0 24px rgba(255,198,41,0.4)',
        'gold-sm':      '0 0 12px rgba(255,198,41,0.25)',
        'blue':         '0 0 24px rgba(23,99,255,0.45)',
        'blue-sm':      '0 0 12px rgba(23,99,255,0.3)',
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
