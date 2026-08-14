import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getNewsPostBySlug,
  getAllNewsSlugs,
  getAppearanceSettings,
  resolveHighlightsStyle,
} from '@/lib/api'
import { calculateReadingTime } from '@/lib/readingTime'
import { formatDateIST, dayKeyIST } from '@/utils/formatDate'
import ArticleHeader from '@/components/article/ArticleHeader'
import ArticleHero from '@/components/article/ArticleHero'
import SanityContent from '@/components/SanityContent'
import VideoEmbed from '@/components/VideoEmbed'
import ShareButtons from '@/components/ShareButtons'
import TournamentDayContext from '@/components/article/TournamentDayContext'
import { getActiveEditionByTournamentId, getMatches, getStandings, getClosestStandingTable } from '@/lib/tournamentApi'

type Props = { params: Promise<{ slug: string }> }

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

function extractPlainText(content: any, max = 160): string {
  if (!content) return ''
  if (Array.isArray(content)) {
    return content
      .map((b: any) => (b?.children || []).map((c: any) => c?.text || '').join(' '))
      .join(' ')
      .trim()
      .slice(0, max)
  }
  return ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsPostBySlug(slug)
  if (!article) return {}

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'
  const title = article.seo?.seoTitle || article.title
  const description =
    article.seo?.metaDescription || article.excerpt || extractPlainText(article.content) ||
    `${article.title} — latest esports and gaming news on PHONEOCEAN.`
  const image = article.seo?.socialShareImage || article.thumbnail || `${baseUrl}/logo_phoneocean.png`
  const canonicalUrl = article.seo?.canonicalUrl || `${baseUrl}/news/${article.slug?.current || slug}`
  const publishDate = article.publishDate || article._createdAt || new Date().toISOString()
  const publishedIso = new Date(publishDate).toISOString()
  const modifiedIso = article._updatedAt ? new Date(article._updatedAt).toISOString() : publishedIso

  return {
    title: `${title} | PHONEOCEAN`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      type: 'article',
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, appearance] = await Promise.all([
    getNewsPostBySlug(slug),
    getAppearanceSettings(),
  ])
  if (!article) notFound()

  const highlightsStyle = resolveHighlightsStyle(article, appearance)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'
  const canonicalUrl = `${baseUrl}/news/${article.slug?.current || slug}`
  const publishDate = article.publishDate || article._createdAt || new Date().toISOString()
  const publishedIso = new Date(publishDate).toISOString()
  const modifiedIso = article._updatedAt ? new Date(article._updatedAt).toISOString() : publishedIso
  const authorName = article.author?.name || article.authorName || 'PHONEOCEAN Staff'
  const readingTimeMinutes = calculateReadingTime(article.wordCount ?? article.content)

  const badge = article.badge && article.badge !== 'None'
    ? (article.badge === 'CUSTOM' ? article.badgeCustom : article.badge)
    : null

  const categoryLabel = article.categoryRef?.title || article.category || null
  const categoryHref = article.categoryRef?.slug ? `/tags/${article.categoryRef.slug}` : null

  // Tournament match/standings articles get a live-data panel below the body:
  // every match played on the same day, or — if none is available yet —
  // the closest published standings table.
  let dayMatches: Awaited<ReturnType<typeof getMatches>> = []
  let closestStandings: Awaited<ReturnType<typeof getStandings>>[number] | null = null
  let editionTitle: string | null = null
  if (article.category === 'results' && article.tournament?._id) {
    const edition = await getActiveEditionByTournamentId(article.tournament._id)
    if (edition) {
      editionTitle = edition.title
      const [matches, standings] = await Promise.all([
        getMatches(edition._id),
        getStandings(edition._id),
      ])
      const articleDayKey = dayKeyIST(publishDate)
      dayMatches = matches.filter((m) => dayKeyIST(m.scheduledAt) === articleDayKey)
      if (!dayMatches.length) {
        closestStandings = getClosestStandingTable(standings, publishDate)
      }
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.thumbnail || `${baseUrl}/logo_phoneocean.png`],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    author: [{ '@type': 'Person', name: authorName }],
    publisher: {
      '@type': 'Organization',
      name: 'PHONEOCEAN',
      url: baseUrl,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo_phoneocean.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${baseUrl}/news` },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
    ],
  }

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

      <ArticleHeader
        badge={badge}
        categoryLabel={categoryLabel}
        categoryHref={categoryHref}
        title={article.title}
        authorName={authorName}
        isoDate={publishedIso}
        formattedDate={formatDateIST(publishDate)}
        readingTimeMinutes={readingTimeMinutes}
        shareTitle={article.title}
        shareUrl={canonicalUrl}
      />

      {!article.hideHeroImage && (
        <ArticleHero
          image={article.heroImage}
          fallbackUrl={article.thumbnail}
          alt={article.imageAlt || article.title}
          caption={article.imageCaption}
          credit={article.imageCredit}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
        {(article.youtubeUrl || article.instagramUrl) && (
          <div className="mb-10">
            <VideoEmbed youtubeUrl={article.youtubeUrl} instagramUrl={article.instagramUrl} title={article.title} />
          </div>
        )}

        {article.content && (
          <SanityContent content={article.content} highlightsStyle={highlightsStyle} />
        )}

        {(dayMatches.length > 0 || closestStandings) && (
          <TournamentDayContext
            editionTitle={editionTitle}
            tournamentSlug={article.tournament?.slug?.current}
            matches={dayMatches}
            standings={closestStandings}
          />
        )}

        {article.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((tag: any) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-[#00E5FF] hover:text-blue-600 dark:hover:text-[#00E5FF] transition-colors"
              >
                #{tag.title}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Share this article</span>
          <ShareButtons title={article.title} url={canonicalUrl} />
        </div>
      </div>
    </article>
  )
}
