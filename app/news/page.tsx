import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublicNewsPosts } from '@/lib/api'
import { optimizedImageUrl } from '@/lib/sanityImage'
import { formatDateCompactIST } from '@/utils/formatDate'
import PageHeader from '@/components/PageHeader'

// ISR budget guard: on-demand only, see /api/revalidate (newsPost docs
// revalidate '/news' on publish).
export const revalidate = false

export const metadata: Metadata = {
  title: 'News | PHONEOCEAN',
  description: 'The latest esports and gaming news, tournament results, and roster updates.',
}

export default async function NewsPage() {
  const articles = await getPublicNewsPosts()

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="Latest Coverage"
        title={<>Esports &amp; Gaming <span className="text-blue-600 dark:text-[#00E5FF]">News</span></>}
        description="Breaking news, tournament results, roster changes, and press releases from the world of competitive gaming."
        accent="cyan"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </span>
        }
      />

      {articles.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No articles published yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article: any) => {
          const badge = article.badge && article.badge !== 'None'
            ? (article.badge === 'CUSTOM' ? article.badgeCustom : article.badge)
            : null;
          return (
            <Link
              key={article._id}
              href={`/news/${article.slug.current}`}
              className="group flex flex-col h-full border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_30px_rgba(0,229,255,0.08)] hover:border-blue-500/40 dark:hover:border-[#00E5FF]/40 transition-all hover:-translate-y-1 duration-300"
            >
              <div className="relative aspect-video overflow-hidden border-b border-gray-200 dark:border-gray-800/60">
                <Image
                  src={optimizedImageUrl(article.thumbnail, 700)}
                  alt={article.imageAlt || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {badge && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-yellow-500 text-black text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
                    {badge}
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-wider mb-2">
                  {article.publishDate && formatDateCompactIST(article.publishDate)}
                  {article.category && <span className="text-blue-600 dark:text-[#00E5FF]"> · {article.category}</span>}
                </p>
                <h2 className="text-gray-900 dark:text-white font-bold text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors line-clamp-2 font-space-grotesk">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  )
}
