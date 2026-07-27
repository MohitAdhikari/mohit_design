import { getNewsPostBySlug } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
import ShareButtons from '@/components/ShareButtons';
import { Metadata } from 'next';

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

  const description = extractPlainText(post.content) || 'PHONEOCEAN gaming news.';

  return {
    title: `${post.title} | PHONEOCEAN`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/news/${post.slug?.current || slug}`,
      images: [
        {
          url: post.thumbnail || 'https://picsum.photos/1200/630',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.thumbnail || 'https://picsum.photos/1200/630'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/news/${post.slug?.current || slug}`,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.com';
  const canonicalUrl = `${baseUrl}/news/${post.slug?.current || slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: [
      post.thumbnail || 'https://picsum.photos/1200/630'
    ],
    datePublished: new Date(post.publishDate).toISOString(),
    dateModified: new Date(post.publishDate).toISOString(),
    author: [{
        '@type': 'Person',
        name: post.authorName || 'PHONEOCEAN Staff',
      }]
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO BANNER */}
      <div className="relative w-full h-[40vh] md:h-[60vh] border-b border-gray-900">
        <Image 
          src={post.thumbnail || 'https://picsum.photos/1920/1080'}
          alt={post.title}
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#050505] to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <span className="inline-block bg-blue-600 text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1 mb-6 rounded-sm">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-400 text-xs font-mono gap-4 uppercase tracking-wider">
              <span>By {post.authorName || 'PHONEOCEAN Staff'}</span>
              <span>•</span>
              <span>{format(new Date(post.publishDate), 'MMMM dd, yyyy')}</span>
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

        <SanityContent content={post.content} />
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this article</span>
          <ShareButtons title={post.title} url={canonicalUrl} />
        </div>
      </div>
    </article>
  );
}
