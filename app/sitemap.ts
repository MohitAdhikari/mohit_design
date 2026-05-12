import { MetadataRoute } from 'next';
import { getNewsPosts, getInterviews, getGuides } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.com';

  const posts = await getNewsPosts();
  const interviews = await getInterviews();
  const guides = await getGuides();

  const newsUrls = posts.map((post: any) => ({
    url: `${baseUrl}/news/${post.slug.current}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Interviews currently share a single index page; include latest publish date as lastmod
  const interviewsLastMod = interviews.length
    ? new Date(
        Math.max(...interviews.map((i: any) => new Date(i.publishDate).getTime()))
      )
    : new Date();

  const guideUrls = guides.map((guide: any) => ({
    url: `${baseUrl}/guides/${guide.slug.current}`,
    lastModified: new Date(guide.lastUpdated),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/interviews`,
      lastModified: interviewsLastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...newsUrls,
    ...guideUrls,
  ];
}
