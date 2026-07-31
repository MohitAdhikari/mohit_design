import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTagBySlug } from '@/lib/api'
import { optimizedImageUrl } from '@/lib/sanityImage'
import { format } from 'date-fns'
import { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'

  if (!tag) {
    return { title: 'Tag Not Found | PHONEOCEAN' }
  }

  const title = tag.seo?.seoTitle || `${tag.title} | PHONEOCEAN Tags`
  const description = tag.seo?.metaDescription || tag.description || `Articles tagged with ${tag.title} on PHONEOCEAN.`
  const ogImage = tag.seo?.openGraphImage || `${baseUrl}/opengraph-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/tags/${tag.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/tags/${tag.slug}`,
    },
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="pb-20">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0E0E12] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-[#00E5FF] mb-3">
            TAG
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk text-gray-900 dark:text-white tracking-tighter leading-tight mb-4">
            {tag.title}
          </h1>
          {tag.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">{tag.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm font-mono text-gray-500 dark:text-gray-500 uppercase tracking-wider">
            <span>/{tag.slug}</span>
            <span>•</span>
            <span>{tag.articleCount} {tag.articleCount === 1 ? 'Article' : 'Articles'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tag.articles && tag.articles.length > 0 ? (
          <div className="grid gap-6">
            {tag.articles.map((article: any) => {
              const href = article._type === 'guide' ? `/guides/${article.slug}` : `/news/${article.slug}`
              const category = article._type === 'guide' ? `${article.gameName} Guide` : article.category
              return (
                <Link
                  key={article._id}
                  href={href}
                  className="group flex flex-col sm:flex-row gap-5 bg-white dark:bg-[#111116] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-blue-500/40 dark:hover:border-[#00E5FF]/40 transition-all hover:-translate-y-1 shadow-sm"
                >
                  {article.thumbnail && (
                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                      <Image
                        src={optimizedImageUrl(article.thumbnail, 400)}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 200px"
                        loading="lazy"
                        className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-[#00E5FF] mb-2">
                      {category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-space-grotesk text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors leading-tight">
                      {article.title}
                    </h2>
                    <time className="mt-3 text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-wider">
                      {format(new Date(article.publishDate || article._createdAt), 'MMMM dd, yyyy')}
                    </time>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider py-20">
            No articles found for this tag.
          </p>
        )}
      </div>
    </div>
  )
}
