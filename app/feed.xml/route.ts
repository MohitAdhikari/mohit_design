import { getPublicNewsPosts } from '@/lib/api';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const posts = await getPublicNewsPosts();

  const items = posts.slice(0, 50).map((post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/news/${post.slug.current}</link>
      <guid>${baseUrl}/news/${post.slug.current}</guid>
      <pubDate>${new Date(post.publishDate || post._createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      ${post.thumbnail ? `<enclosure url="${post.thumbnail}" type="image/jpeg" />` : ''}
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PHONEOCEAN</title>
    <link>${baseUrl}</link>
    <description>Gaming News, Esports Updates & Exclusive Interviews</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 's-maxage=3600' },
  });
}
