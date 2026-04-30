import { MetadataRoute } from 'next';
import { getAllPosts, getInterviews, getGuides } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.com';

  const posts = await getAllPosts();
  const interviews = await getInterviews();
  const guides = await getGuides();

  const newsUrls = posts.map((post: any) => ({
    url: `${baseUrl}/news/${post.slug.current}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const interviewUrls = interviews.map((interview: any) => ({
    url: `${baseUrl}/interviews`, // Assuming interviews don't have individual pages yet based on current routing
    lastModified: new Date(interview.publishDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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
      lastModified: new Date(),
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
