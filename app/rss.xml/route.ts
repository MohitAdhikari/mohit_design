import { getPublicNewsPosts, getInterviews, getGuides } from '@/lib/api';

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';

  const [news, interviews, guides] = await Promise.all([
    getPublicNewsPosts(),
    getInterviews(),
    getGuides(),
  ]);

  const newsItems = news.map((post: any) => ({
    title: post.title,
    url: `${baseUrl}/news/${post.slug.current}`,
    date: post.publishDate || post._createdAt,
    description: post.excerpt || `Read ${post.title} on PHONEOCEAN.`,
  }));

  const interviewItems = interviews.map((i: any) => ({
    title: `${i.playerOrCeoName} - ${i.eventName}`,
    url: `${baseUrl}/interviews`,
    date: i.publishDate || i._createdAt,
    description: `Exclusive interview with ${i.playerOrCeoName} at ${i.eventName}.`,
  }));

  const guideItems = guides.map((guide: any) => ({
    title: guide.title,
    url: `${baseUrl}/guides/${guide.slug.current}`,
    date: guide.publishDate || guide._createdAt || guide.lastUpdated,
    description: `Guide for ${guide.gameName}: ${guide.title}`,
  }));

  const allItems = [...newsItems, ...interviewItems, ...guideItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const lastBuildDate = new Date().toUTCString();
  const itemsXml = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PHONEOCEAN</title>
    <link>${baseUrl}</link>
    <description>Gaming news, esports updates and exclusive interviews.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
