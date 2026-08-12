import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/dashboard/', '/api/'],
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/news-sitemap.xml`],
  };
}
