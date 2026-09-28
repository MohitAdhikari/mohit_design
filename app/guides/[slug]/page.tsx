import { getGuideBySlug, getGuides, getPublicNewsPosts, getAppearanceSettings, resolveHighlightsStyle } from '@/lib/api';
import { formatDateIST } from '@/utils/formatDate';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
import { Metadata } from 'next';
import ShareButtons from '@/components/ShareButtons';
import CodeCopyBox from '@/components/blocks/CodeCopyBox';
import { sortCodeEntries } from '@/lib/codeEntries';
import { calculateReadingTime } from '@/lib/readingTime';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleHero from '@/components/article/ArticleHero';
import { optimizedImageUrl } from '@/lib/sanityImage';

function isRedeemCodesGuide(g: any): boolean {
  return Boolean(g?.guideType === 'codes' || g?.codeEntries?.length || g?.codesList?.length || g?.isRedeemCodes);
}

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

function extractPlainText(content: any, max = 160): string {
  if (!content) return '';
  if (typeof content === 'string') return content.slice(0, max);
  if (Array.isArray(content)) {
    return content
      .map((b: any) => (b?.children || []).map((c: any) => c?.text || '').join(' '))
      .join(' ')
      .trim()
      .slice(0, max);
  }
  return '';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: 'Guide Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const description = extractPlainText(guide.content) || `Comprehensive guide and codes for ${guide.gameName}.`;
  const publishDate = guide.publishDate || guide._createdAt || guide.lastUpdated || new Date().toISOString();
  const publishedIso = new Date(publishDate).toISOString();
  const modifiedIso = guide.lastUpdated ? new Date(guide.lastUpdated).toISOString() : publishedIso;

  return {
    title: `${guide.title} | ${guide.gameName} Guide | PHONEOCEAN`,
    description,
    openGraph: {
      title: guide.title,
      description,
      type: 'article',
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      url: `${baseUrl}/guides/${guide.slug?.current || slug}`,
      images: [
        {
          url: guide.thumbnail || 'https://picsum.photos/1200/630',
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description,
      images: [guide.thumbnail || 'https://picsum.photos/1200/630'],
    },
    alternates: {
      canonical: `${baseUrl}/guides/${guide.slug?.current || slug}`,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [guide, appearance, allGuides, allNews] = await Promise.all([
    getGuideBySlug(slug),
    getAppearanceSettings(),
    getGuides(),
    getPublicNewsPosts(),
  ]);

  if (!guide) {
    notFound();
  }

  // Redeem-code guides get a "more codes" rail + one related news pick from
  // the same game category, so a code page never dead-ends the reader.
  const isRedeemGuide = isRedeemCodesGuide(guide);
  const sameGameCodes = allGuides.filter(
    (g: any) => g._id !== guide._id && isRedeemCodesGuide(g) && g.gameName === guide.gameName,
  );
  const otherCodes = allGuides.filter(
    (g: any) => g._id !== guide._id && isRedeemCodesGuide(g) && g.gameName !== guide.gameName,
  );
  const moreRedeemCodes = isRedeemGuide ? [...sameGameCodes, ...otherCodes].slice(0, 3) : [];

  const relatedCategoryArticle = isRedeemGuide
    ? allNews.find((n: any) => (n.category || '').toLowerCase() === (guide.gameName || '').toLowerCase())
    : null;

  const highlightsStyle = resolveHighlightsStyle(guide, appearance);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const canonicalUrl = `${baseUrl}/guides/${guide.slug?.current || slug}`;
  const publishDate = guide.publishDate || guide._createdAt || guide.lastUpdated || new Date().toISOString();
  const publishedIso = new Date(publishDate).toISOString();
  const showUpdatedDate = Boolean(guide.showUpdatedDate && guide.lastUpdated);
  const modifiedIso = guide.lastUpdated ? new Date(guide.lastUpdated).toISOString() : publishedIso;
  const authorName = guide.author?.name || 'PHONEOCEAN Staff';
  const readingTimeMinutes = calculateReadingTime(guide.wordCount ?? guide.content);

  const codeEntriesRaw = (guide.codeEntries && guide.codeEntries.length > 0)
    ? guide.codeEntries
    : (guide.codesList || []).map((code: string) => ({ code }));
  const sortedCodeEntries = sortCodeEntries(codeEntriesRaw);
  const codePosition = guide.codePosition === 'bottom' ? 'bottom' : 'top';

  const codesBlock = sortedCodeEntries.length > 0 ? (
    <div className={codePosition === 'top' ? 'mb-12' : 'mt-12'}>
      <div className="p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border border-purple-300 dark:border-purple-500/30 rounded-2xl shadow-sm dark:shadow-[0_0_30px_rgba(157,0,255,0.05)]">
        <h2 className="text-2xl font-bold font-space-grotesk mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
          <span className="text-purple-600 dark:text-purple-400 font-mono tracking-tighter">{"//"}</span>
          Active Codes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedCodeEntries.map((entry: any, idx: number) => (
            <CodeCopyBox
              key={idx}
              code={entry.code}
              reward={entry.reward}
              showReward={entry.showReward ?? true}
              isNew={entry.isNew}
              isExpired={entry.isExpired}
              isRedeemed={entry.isRedeemed}
              expiresAt={entry.expiresAt}
            />
          ))}
        </div>
      </div>
    </div>
  ) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    image: [
      guide.thumbnail || `${baseUrl}/logo_phoneocean.png`,
    ],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    author: [{
        '@type': 'Person',
        name: authorName,
      }],
    publisher: {
      '@type': 'Organization',
      name: 'PHONEOCEAN',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo_phoneocean.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${baseUrl}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: canonicalUrl },
    ],
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticleHeader
        eyebrow={`${guide.gameName} Guide`}
        title={guide.title}
        authorName={authorName}
        isoDate={publishedIso}
        formattedDate={formatDateIST(publishDate)}
        readingTimeMinutes={readingTimeMinutes}
        updatedLabel={showUpdatedDate ? formatDateIST(guide.lastUpdated) : null}
        shareTitle={guide.title}
        shareUrl={canonicalUrl}
      />

      <ArticleHero
        image={guide.heroImage}
        fallbackUrl={guide.thumbnail}
        alt={guide.thumbnailAlt || guide.title}
        caption={guide.thumbnailCaption}
        credit={guide.thumbnailCredit}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {(guide.youtubeUrl || guide.instagramUrl) && (
          <div className="mb-12">
            <VideoEmbed youtubeUrl={guide.youtubeUrl} instagramUrl={guide.instagramUrl} title={guide.title} />
          </div>
        )}

        {codePosition === 'top' && codesBlock}

        <SanityContent content={guide.content} highlightsStyle={highlightsStyle} />

        {codePosition === 'bottom' && codesBlock}
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this guide</span>
          <ShareButtons title={guide.title} url={canonicalUrl} />
        </div>

        {moreRedeemCodes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold font-space-grotesk mb-4 text-gray-900 dark:text-white">
              More {guide.gameName} Redeem Codes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {moreRedeemCodes.map((rc: any) => (
                <Link
                  key={rc._id}
                  href={`/guides/${rc.slug.current}`}
                  className="group flex flex-col bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/50 rounded-xl overflow-hidden hover:border-[#00FF66]/40 transition-colors"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={optimizedImageUrl(rc.thumbnail, 500)}
                      alt={rc.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] text-[#00FF66] font-black tracking-widest uppercase">{rc.gameName}</span>
                    <h3 className="text-sm font-bold font-space-grotesk text-gray-900 dark:text-gray-100 line-clamp-2 mt-1 group-hover:text-[#00FF66] transition-colors">
                      {rc.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {relatedCategoryArticle && (
          <div className="mt-8">
            <Link
              href={`/news/${relatedCategoryArticle.slug.current}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800/50 hover:border-[#00E5FF]/40 transition-colors"
            >
              <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/50">
                <Image
                  src={optimizedImageUrl(relatedCategoryArticle.thumbnail, 300)}
                  alt={relatedCategoryArticle.title}
                  fill
                  sizes="80px"
                  loading="lazy"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#00E5FF] font-black tracking-widest uppercase">
                  Related {relatedCategoryArticle.category}
                </span>
                <h3 className="text-sm font-bold font-space-grotesk text-gray-900 dark:text-gray-100 line-clamp-2 mt-1 group-hover:text-[#00E5FF] transition-colors">
                  {relatedCategoryArticle.title}
                </h3>
              </div>
            </Link>
          </div>
        )}

      </div>
    </article>
  );
}
