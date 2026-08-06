import { getGuideBySlug, getAppearanceSettings, resolveHighlightsStyle } from '@/lib/api';
import Image from 'next/image';
import { optimizedImageUrl } from '@/lib/sanityImage';
import { formatDateCompactIST, formatDateTimeIST } from '@/utils/formatDate';
import { notFound } from 'next/navigation';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
import { Metadata } from 'next';
import ShareButtons from '@/components/ShareButtons';
import CodeCopyBox from '@/components/blocks/CodeCopyBox';
import { sortCodeEntries } from '@/lib/codeEntries';
import { calculateReadingTime } from '@/lib/readingTime';

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
  const [guide, appearance] = await Promise.all([
    getGuideBySlug(slug),
    getAppearanceSettings(),
  ]);

  if (!guide) {
    notFound();
  }

  const highlightsStyle = resolveHighlightsStyle(guide, appearance);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const canonicalUrl = `${baseUrl}/guides/${guide.slug?.current || slug}`;
  const publishDate = guide.publishDate || guide._createdAt || guide.lastUpdated || new Date().toISOString();
  const publishedIso = new Date(publishDate).toISOString();
  const showUpdatedDate = Boolean(guide.showUpdatedDate && guide.lastUpdated);
  const modifiedIso = guide.lastUpdated ? new Date(guide.lastUpdated).toISOString() : publishedIso;
  const authorName = guide.author?.name || 'PHONEOCEAN Staff';
  const readingTimeMinutes = calculateReadingTime(guide.content);

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
      {/* HERO BANNER */}
      <div className="relative w-full h-[40vh] md:h-[50vh] border-b border-gray-900 border-b-purple-500/30">
        <Image 
          src={optimizedImageUrl(guide.thumbnail, 1920, 'https://picsum.photos/1920/1080')}
          alt={guide.thumbnailAlt || guide.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <span className="inline-block bg-purple-600 text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1 mb-6 rounded-sm">
              {guide.gameName} Guide
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter leading-tight mb-6 text-white">
              {guide.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-400 text-xs font-mono gap-4 uppercase tracking-wider">
              <span>By {authorName}</span>
              <span>•</span>
              <span>{formatDateTimeIST(publishDate)}</span>
              <span>•</span>
              <span>{readingTimeMinutes} min read</span>
              {showUpdatedDate && (
                <>
                  <span>•</span>
                  <span>Updated {formatDateCompactIST(guide.lastUpdated)}</span>
                </>
              )}
            </div>
            <div className="mt-6">
              <ShareButtons title={guide.title} url={canonicalUrl} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {(guide.youtubeUrl || guide.instagramUrl) && (
          <div className="mb-12">
            <VideoEmbed youtubeUrl={guide.youtubeUrl} instagramUrl={guide.instagramUrl} title={guide.title} />
          </div>
        )}

        {(() => {
          const entries = (guide.codeEntries && guide.codeEntries.length > 0)
            ? guide.codeEntries
            : (guide.codesList || []).map((code: string) => ({ code }));
          if (entries.length === 0) return null;
          const sorted = sortCodeEntries(entries);
          return (
            <div className="mb-12 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] border border-purple-300 dark:border-purple-500/30 rounded-2xl shadow-sm dark:shadow-[0_0_30px_rgba(157,0,255,0.05)]">
              <h2 className="text-2xl font-bold font-space-grotesk mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <span className="text-purple-600 dark:text-purple-400 font-mono tracking-tighter">{"//"}</span>
                Active Codes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sorted.map((entry: any, idx: number) => (
                  <CodeCopyBox
                    key={idx}
                    code={entry.code}
                    reward={entry.reward}
                    showReward={entry.showReward ?? true}
                    isNew={entry.isNew}
                    isExpired={entry.isExpired}
                    expiresAt={entry.expiresAt}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        <SanityContent content={guide.content} highlightsStyle={highlightsStyle} />
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this guide</span>
          <ShareButtons title={guide.title} url={canonicalUrl} />
        </div>

      </div>
    </article>
  );
}
