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
  const heroImage = post.seo?.socialShareImage || post.thumbnail || 'https://picsum.photos/1200/630';
  const readingTimeMinutes = calculateReadingTime(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    ...(description ? { description } : {}),
    image: {
      '@type': 'ImageObject',
      url: heroImage,
      width: 1200,
      height: 630,
    },
    datePublished: publishedIso,
    dateModified: publishedIso,
    ...(articleSection ? { articleSection } : {}),
    ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: [{
        '@type': 'Person',
        name: authorName,
      }],
    publisher: {
      '@type': 'Organization',
      name: 'PHONEOCEAN',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${baseUrl}/news` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
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
      <div className="relative w-full h-[40vh] md:h-[60vh] border-b border-gray-900">
        <Image 
          src={optimizedImageUrl(post.thumbnail, 1920, 'https://picsum.photos/1920/1080')}
          alt={post.imageAlt || post.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#050505] to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter leading-tight mb-6 text-white">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-400 text-xs font-mono gap-4 uppercase tracking-wider">
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
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {(post.youtubeUrl || post.instagramUrl) && (
          <div className="mb-12">
            <VideoEmbed youtubeUrl={post.youtubeUrl} instagramUrl={post.instagramUrl} title={post.title} />
          </div>
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
