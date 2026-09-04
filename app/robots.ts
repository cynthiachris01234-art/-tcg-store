import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/careers/thank-you', '/careers/apply'],
      },
    ],
    sitemap: 'https://apextcg.shop/sitemap.xml',
  };
}
