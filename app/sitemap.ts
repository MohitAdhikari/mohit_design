import { MetadataRoute } from 'next';
import { getPublicNewsPosts, getInterviews, getGuides, getTags } from '@/lib/api';
import { getTournaments } from '@/lib/tournamentApi';

const pathSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';

  const posts = await getPublicNewsPosts();
  const interviews = await getInterviews();
  const guides = await getGuides();
  const tags = await getTags();
  const tournaments = await getTournaments().catch(() => []);

  const tournamentUrls = tournaments.map((t: any) => ({
    url: `${baseUrl}/esports/${t.slug.current}`,
    lastModified: new Date(t.latestEdition?.endDate || t.latestEdition?.startDate || t._createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const newsUrls = posts.map((post: any) => ({
    url: `${baseUrl}/news/${post.slug.current}`,
    lastModified: new Date(post.publishDate || post._createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Interviews currently share a single index page; include latest publish date as lastmod
  const interviewsLastMod = interviews.length
    ? new Date(
        Math.max(...interviews.map((i: any) => new Date(i.publishDate || i._createdAt).getTime()))
      )
    : new Date();

  const guideUrls = guides.map((guide: any) => ({
    url: `${baseUrl}/guides/${guide.slug.current}`,
    lastModified: new Date(guide.lastUpdated || guide.publishDate || guide._createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const tagUrls = tags.map((tag: any) => ({
    url: `${baseUrl}/tags/${pathSegment(tag.pathSlug || tag.slug)}`,
    lastModified: new Date(tag.lastUsed || tag._createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const tagsLastMod = tags.length
    ? new Date(Math.max(...tags.map((t: any) => new Date(t.lastUsed || t._createdAt).getTime())))
    : new Date();

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
      url: `${baseUrl}/tags`,
      lastModified: tagsLastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
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
      url: `${baseUrl}/esports`,
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
    ...tagUrls,
    ...tournamentUrls,
  ];
}
