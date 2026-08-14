import { getNewsPosts } from '@/lib/api';

// ISR budget guard: raised to conserve remaining ISR Write Units this month.
export const revalidate = 3600;

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

/**
 * Google News requires RFC3339 timestamps. `Date.toISOString()` includes
 * milliseconds (e.g. 2026-08-03T08:51:27.000Z), which Google's validator
 * flags — strip the fractional seconds to get 2026-08-03T08:51:27Z.
 */
function toRfc3339(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const siteName = 'PHONEOCEAN';

  const posts = await getNewsPosts();

  // Google News only indexes articles from the last 2 days.
  const cutoff = Date.now() - 1000 * 60 * 60 * 48;
  const recent = posts.filter((p: any) => new Date(p.publishDate || p._createdAt).getTime() >= cutoff);

  const urls = recent
    .map((post: any) => {
      const loc = `${baseUrl}/news/${post.slug.current}`;
      const pubDate = toRfc3339(new Date(post.publishDate || post._createdAt));
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
