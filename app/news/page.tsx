import Link from 'next/link'
import { getArticles } from '@/lib/tournamentApi'

export default async function NewsPage() {
  const articles = await getArticles()

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-10">News</h1>

      {articles.length === 0 && (
        <p className="text-zinc-400">No articles published yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <Link key={article._id} href={`/news/${article.slug.current}`} className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-colors">
            {article.thumbnailUrl && (
              <img
                src={article.thumbnailUrl}
                alt={article.imageAlt || article.title}
                className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity"
              />
            )}
            <div className="p-4">
              <p className="text-xs text-zinc-500 mb-2">
                {article.publishDate && new Date(article.publishDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
              <h2 className="text-white font-semibold text-base leading-snug group-hover:text-yellow-400 transition-colors line-clamp-2">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-zinc-400 text-sm mt-2 line-clamp-3">{article.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
