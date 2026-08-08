import { getNewsPostBySlug, getAppearanceSettings, resolveHighlightsStyle } from '@/lib/api';
import Image from 'next/image';
import { optimizedImageUrl } from '@/lib/sanityImage';
import { formatDateTimeIST } from '@/utils/formatDate';
import { notFound } from 'next/navigation';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
import ShareButtons from '@/components/ShareButtons';
import { Metadata } from 'next';
import { calculateReadingTime } from '@/lib/readingTime';

function extractPlainText(content: any, max = 160): string {
  if (!content) return '';
  if (typeof content === 'string') return content.slice(0, max);
  if (Array.isArray(content)) {
    const text = content
      .map((block: any) =>
        (block?.children || [])
          .map((c: any) => c?.text || '')
          .join(' ')
      )
      .join(' ')
      .trim();
    return text.slice(0, max);
  }
  return '';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  // Prefer CMS-authored SEO fields, then excerpt, then extracted body text.
  const description =
    post.seo?.metaDescription || post.excerpt || extractPlainText(post.content) || 'PHONEOCEAN gaming news.';
  const seoTitle = post.seo?.seoTitle || `${post.title} | PHONEOCEAN`;
  const shareImage = post.seo?.socialShareImage || post.thumbnail || 'https://picsum.photos/1200/630';
  const imageAlt = post.imageAlt || post.title;
  const pageUrl = `${baseUrl}/news/${post.slug?.current || slug}`;
  // Only override canonical if the editor explicitly set one (e.g. syndicated content).
  const canonical = post.seo?.canonicalUrl || pageUrl;
  const keywords = [
    post.seo?.focusKeyword,
    ...(post.tags?.map((t: any) => t?.title).filter(Boolean) || []),
  ].filter(Boolean) as string[];
  const publishDate = post.publishDate || post._createdAt || new Date().toISOString();
  const publishedIso = new Date(publishDate).toISOString();

  return {
    title: seoTitle,
    description,
    ...(keywords.length ? { keywords } : {}),
    authors: [{ name: post.author?.name || post.authorName || 'PHONEOCEAN Staff' }],
    openGraph: {
      title: seoTitle,
      description,
      type: 'article',
      publishedTime: publishedIso,
      modifiedTime: publishedIso,
      url: pageUrl,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: [shareImage],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, appearance] = await Promise.all([
    getNewsPostBySlug(slug),
    getAppearanceSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const highlightsStyle = resolveHighlightsStyle(post, appearance);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const canonicalUrl = `${baseUrl}/news/${post.slug?.current || slug}`;
  const publishDate = post.publishDate || post._createdAt || new Date().toISOString();
  const publishedIso = new Date(publishDate).toISOString();

  const authorName = post.author?.name || post.authorName || 'PHONEOCEAN Staff';
  const articleSection = post.categoryRef?.title || post.category;
  const keywords = (post.tags?.map((t: any) => t?.title).filter(Boolean) || []) as string[];
  const description = post.seo?.metaDescription || post.excerpt || extractPlainText(post.content) || undefined;
  const heroImage = post.hideHeroImage ? null : (post.seo?.socialShareImage || post.thumbnail || 'https://picsum.photos/1200/630');
  const readingTimeMinutes = calculateReadingTime(post.content);

  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt || '',
    image: [post.thumbnail || `${baseUrl}/logo_phoneocean.png`],
    datePublished: new Date(post.publishDate || post._createdAt).toISOString(),
    dateModified: new Date(post._updatedAt || post.publishDate || post._createdAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || post.authorName || 'PHONEOCEAN Staff',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PHONEOCEAN',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo_phoneocean.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/news/${post.slug?.current}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${baseUrl}/news` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${baseUrl}/news/${post.slug?.current}` },
    ],
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* HERO BANNER — image only, conditional */}
      {!post.hideHeroImage && (
        <div className="relative w-full min-h-[50vh] md:min-h-[60vh] border-b border-gray-200 dark:border-gray-900">
          <Image
            src={optimizedImageUrl(post.thumbnail, 1920, 'https://picsum.photos/1920/1080')}
            alt={post.imageAlt || post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      )}

      {/* TITLE BLOCK — always rendered */}
      <div className={post.hideHeroImage
        ? 'border-b border-gray-200 dark:border-gray-900 pt-8 pb-6 sm:pt-12 sm:pb-10'
        : 'relative -mt-[140px] sm:-mt-[180px] z-10'
      }>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-12">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-block bg-blue-600 text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-sm">
              {post.category}
            </span>
            {post.badge && post.badge !== 'None' && (
              <span className="inline-block bg-[#2A2A32] text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-sm">
                {post.badge === 'CUSTOM' ? post.badgeCustom : post.badge}
              </span>
            )}
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter leading-tight mb-4 sm:mb-6 text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] ${
            post.hideHeroImage ? 'text-gray-900 dark:text-white' : 'text-white'
          }`}>
            {post.title}
          </h1>
          <div className={`flex flex-wrap items-center text-xs font-mono gap-4 uppercase tracking-wider ${
            post.hideHeroImage ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'
          }`}>
            <span>By {authorName}</span>
            <span>•</span>
            <span>{formatDateTimeIST(publishDate)}</span>
            <span>•</span>
            <span>{readingTimeMinutes} min read</span>
          </div>
          <div className="mt-6">
            <ShareButtons title={post.title} url={canonicalUrl} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {(post.youtubeUrl || post.instagramUrl) && (
          <div className="mb-12">
            <VideoEmbed youtubeUrl={post.youtubeUrl} instagramUrl={post.instagramUrl} title={post.title} />
          </div>
        )}

        {post.bodyImage?.url && (
          <figure className="my-8">
            <div className="relative w-full aspect-video">
              <Image
                src={optimizedImageUrl(post.bodyImage?.url || post.thumbnail, 1200)}
                alt={post.bodyImage?.alt || post.imageAlt || post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                loading="lazy"
                className="object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            {(post.bodyImage?.caption || post.bodyImage?.credit) && (
              <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-sans">
                {post.bodyImage?.caption}
                {post.bodyImage?.credit && (
                  <span className="italic"> — {post.bodyImage.credit}</span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        <SanityContent content={post.content} highlightsStyle={highlightsStyle} />
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this article</span>
          <ShareButtons title={post.title} url={canonicalUrl} />
        </div>
      </div>
    </article>
  );
}
