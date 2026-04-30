import { getNewsPosts } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function NewsPage() {
  const news = await getNewsPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8 md:mb-12 border-b border-gray-300 dark:border-gray-800/50 pb-6">
        <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase text-gray-900 dark:text-white">Latest News</h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 font-mono tracking-tight">Stay updated with the latest in esports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {news.map((post) => (
          <Link href={`/news/${post.slug.current}`} key={post._id} className="group flex flex-col space-y-4 bg-white dark:bg-[#0E0E12] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/40 hover:border-blue-500/30 transition-colors shadow-sm dark:shadow-none">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md">
              <Image 
                src={post.thumbnail} 
                alt={post.title} 
                fill 
                className="object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 md:group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#0B0B0F]/90 backdrop-blur-sm text-[10px] px-2 py-1 uppercase tracking-widest font-mono text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm dark:shadow-none">
                {post.category}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between py-1 px-1">
              <h3 className="text-lg md:text-xl font-bold font-space-grotesk leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-gray-100 line-clamp-3">
                {post.title}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] md:text-xs text-gray-600 dark:text-gray-500 font-mono uppercase tracking-wider">
                <span>{format(new Date(post.publishDate), 'MMM dd, yyyy')}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                <span>{post.authorName || 'PHONEOCEAN'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
