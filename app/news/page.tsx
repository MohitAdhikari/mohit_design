import { getNewsPosts } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';

export const metadata = {
  title: 'Latest News | PHONEOCEAN',
  description: 'Stay updated with the latest gaming and esports news, roster moves, and tournament coverage.',
};

export const revalidate = 60;

export default async function NewsPage() {
  const news = await getNewsPosts();

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="News Feed"
        title={<>Latest <span className="text-blue-600 dark:text-[#00E5FF]">News</span></>}
        description="Stay updated with the latest in esports — roster moves, tournament results, and breaking stories."
        accent="cyan"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {news.length} {news.length === 1 ? 'story' : 'stories'}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {news.map((post: any, i: number) => (
          <Reveal key={post._id} delay={(i % 3) * 90} className="h-full">
          <Link
            href={`/news/${post.slug.current}`}
            className="sheen-parent group relative flex flex-col h-full bg-white dark:bg-[#0E0E12] rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-blue-500/40 dark:hover:border-[#00E5FF]/40 transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,229,255,0.05)] overflow-hidden hover:-translate-y-1"
          >
            <div className="relative aspect-video overflow-hidden border-b border-gray-200 dark:border-gray-800/60">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 bg-[#00E5FF] text-[#0B0B0F] text-[10px] px-2.5 py-1 uppercase tracking-widest font-black rounded-md shadow-sm">
                {post.category}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between p-5">
              <h3 className="text-lg md:text-xl font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 line-clamp-3 mb-4 group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors">
                {post.title}
              </h3>
              <div className="mt-auto flex items-center justify-between text-[10px] md:text-xs text-gray-600 dark:text-gray-500 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span>{format(new Date(post.publishDate), 'MMM dd, yyyy')}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span>{post.authorName || 'PHONEOCEAN'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-[#00E5FF] group-hover:gap-2 transition-all">
                  Read <span className="text-base leading-none">→</span>
                </span>
              </div>
            </div>
          </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
