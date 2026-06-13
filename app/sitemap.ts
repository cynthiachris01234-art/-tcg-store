import type { MetadataRoute } from 'next';
import { BRANDS, LANGUAGES } from '@/lib/brands';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

const BASE = 'https://apextcg.shop';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/shop`,              lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/cases`,             lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/deals`,             lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/releases`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/special-sets`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/faq`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/shipping`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/returns`,           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,           lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const brandPages: MetadataRoute.Sitemap = BRANDS.map(brand => ({
    url: `${BASE}/shop/${brand}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const langPages: MetadataRoute.Sitemap = LANGUAGES.map(lang => ({
    url: `${BASE}/shop/language/${lang}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = MOCK_PRODUCTS.map(p => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticPages, ...brandPages, ...langPages, ...productPages];
}
