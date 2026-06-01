/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

module.exports = nextConfig;
