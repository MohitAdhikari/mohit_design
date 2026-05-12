import { getGuideBySlug } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import SanityContent from '@/components/SanityContent';
import VideoEmbed from '@/components/VideoEmbed';
import { Metadata } from 'next';
import CopyButton from '@/components/CopyButton';

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

  const description = extractPlainText(guide.content) || `Comprehensive guide and codes for ${guide.gameName}.`;

  return {
    title: `${guide.title} | ${guide.gameName} Guide | PHONEOCEAN`,
    description,
    openGraph: {
      title: guide.title,
      description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/guides/${guide.slug?.current || slug}`,
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
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/guides/${guide.slug?.current || slug}`,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    image: [
      guide.thumbnail || 'https://picsum.photos/1200/630'
    ],
    datePublished: new Date(guide.lastUpdated).toISOString(),
    dateModified: new Date(guide.lastUpdated).toISOString(),
    author: [{
        '@type': 'Organization',
        name: 'PHONEOCEAN',
      }]
  };

  return (
    <article className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO BANNER */}
      <div className="relative w-full h-[40vh] md:h-[50vh] border-b border-gray-900 border-b-purple-500/30">
        <Image 
          src={guide.thumbnail || 'https://picsum.photos/1920/1080'}
          alt={guide.title}
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-[#050505] to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <span className="inline-block bg-purple-600 text-white text-[10px] font-mono tracking-widest uppercase px-3 py-1 mb-6 rounded-sm">
              {guide.gameName} Guide
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter leading-tight mb-6">
              {guide.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-400 text-xs font-mono gap-4 uppercase tracking-wider">
              <span>Updated • {format(new Date(guide.lastUpdated), 'MMMM dd, yyyy')}</span>
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

        {guide.codesList && guide.codesList.length > 0 && (
          <div className="mb-12 p-8 bg-white dark:bg-[#0a0a0a] border border-purple-300 dark:border-purple-500/30 rounded-2xl shadow-sm dark:shadow-[0_0_30px_rgba(157,0,255,0.05)]">
            <h2 className="text-2xl font-bold font-space-grotesk mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <span className="text-purple-600 dark:text-purple-400 font-mono tracking-tighter">{"//"}</span>
              Active Codes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.codesList.map((code: string, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] hover:border-purple-500/50 transition-colors rounded-xl">
                  <span className="font-mono text-gray-900 dark:text-white tracking-widest text-lg">{code}</span>
                  <CopyButton value={code} />
                </div>
              ))}
            </div>
          </div>
        )}

        <SanityContent content={guide.content} />
        
      </div>
    </article>
  );
}
