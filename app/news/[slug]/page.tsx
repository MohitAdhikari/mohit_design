import { getNewsPostBySlug } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
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
        
        <div className="mt-16 pt-8 border-t border-gray-900 flex items-center justify-between">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this article</span>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
