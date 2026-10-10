/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'ygoprodeck.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' },
      // Official TCG brand CDNs
      { protocol: 'https', hostname: 'd1i787aglh9bmb.cloudfront.net' },
      { protocol: 'https', hostname: 'media.wizards.com' },
      { protocol: 'https', hostname: 'en.onepiece-cardgame.com' },
      { protocol: 'https', hostname: 'img.yugioh-card.com' },
      { protocol: 'https', hostname: 'www.yugioh-card.com' },
      // TCGPlayer product image CDN
      { protocol: 'https', hostname: 'product-images.tcgplayer.com' },
      // Other retailer images
      { protocol: 'https', hostname: 'jumpichiban.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pokemoncenter.com' },
      { protocol: 'https', hostname: 'assets.pokemon.com' },
      { protocol: 'https', hostname: 'www.pokemon.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  // Neutral URLs so ad blockers don't block /api/stripe and /api/paypal fetches.
  async rewrites() {
    return [
      { source: '/api/pay/card', destination: '/api/stripe/checkout' },
      { source: '/api/pay/card-confirm', destination: '/api/stripe/confirm' },
      { source: '/api/pay/wallet', destination: '/api/paypal/checkout' },
      { source: '/api/pay/wallet-capture', destination: '/api/paypal/capture' },
      { source: '/api/pay/wallet-left', destination: '/api/paypal/abandon' },
    ];
  },
};

module.exports = nextConfig;
