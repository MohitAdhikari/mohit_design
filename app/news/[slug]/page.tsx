import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from '@/lib/tournamentApi'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  const { metaTitle, metaDescription, ogImage } = article.seo ?? {
    metaTitle: null,
    metaDescription: null,
    ogImage: null,
  }
  const title = metaTitle || article.title
  const description = metaDescription || article.excerpt || ''
  const image = ogImage || article.thumbnailUrl || ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: 'article',
      publishedTime: article.publishDate || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const badge = article.badge && article.badge !== 'None'
    ? (article.badge === 'CUSTOM' ? article.badgeCustom : article.badge)
    : null

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* Badge */}
      {badge && (
        <span className="inline-block text-xs font-bold tracking-widest text-yellow-400 border border-yellow-500 px-2 py-0.5 rounded mb-4">
          {badge}
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-zinc-400 mb-8">
        {article.publishDate && (
          <time dateTime={article.publishDate}>
            {new Date(article.publishDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        )}
        {(article.authorName || article.author?.name) && (
          <>
            <span>·</span>
            <span>{article.author?.name || article.authorName}</span>
          </>
        )}
        {article.category && (
          <>
            <span>·</span>
            <span className="text-yellow-400">{article.category}</span>
          </>
        )}
      </div>

      {/* Hero Image */}
      {!article.hideHeroImage && article.thumbnailUrl && (
        <figure className="mb-8 rounded-xl overflow-hidden">
          <Image
            src={article.thumbnailUrl}
            alt={article.imageAlt || article.title}
            width={800}
            height={450}
            className="w-full object-cover"
            priority
          />
          {article.imageCaption && (
            <figcaption className="text-xs text-zinc-500 mt-2 text-center">
              {article.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Body */}
      {article.content && (
        <div className="prose prose-invert prose-yellow max-w-none">
          <PortableText value={article.content} />
        </div>
      )}
    </main>
  )
}
