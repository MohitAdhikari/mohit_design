import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

interface ArticleHeaderProps {
  eyebrow?: string | null;
  badge?: string | null;
  title: string;
  authorName?: string | null;
  authorSlug?: string | null;
  isoDate?: string | null;
  formattedDate: string;
  readingTimeMinutes?: number | null;
  updatedLabel?: string | null;
  categoryLabel?: string | null;
  categoryHref?: string | null;
  shareTitle: string;
  shareUrl: string;
}

/**
 * Shared article header used by news posts, guides, and interviews.
 * Always renders the H1 ABOVE the hero image with theme-safe colors,
 * so it can never be invisible in light mode and spacing never drifts
 * between article types.
 */
export default function ArticleHeader({
  eyebrow,
  badge,
  title,
  authorName,
  authorSlug,
  isoDate,
  formattedDate,
  readingTimeMinutes,
  updatedLabel,
  categoryLabel,
  categoryHref,
  shareTitle,
  shareUrl,
}: ArticleHeaderProps) {
  return (
    <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 pt-8 md:pt-12 pb-6">
      {(eyebrow || badge || categoryLabel) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {badge && (
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 px-2.5 py-1 rounded">
              {badge}
            </span>
          )}
          {categoryLabel && (
            categoryHref ? (
              <Link
                href={categoryHref}
                className="inline-block text-[11px] font-bold tracking-widest uppercase text-blue-700 dark:text-[#00E5FF] hover:underline"
              >
                {categoryLabel}
              </Link>
            ) : (
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-blue-700 dark:text-[#00E5FF]">
                {categoryLabel}
              </span>
            )
          )}
          {eyebrow && !categoryLabel && (
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">
              {eyebrow}
            </span>
          )}
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-space-grotesk tracking-tight leading-tight text-balance text-gray-900 dark:text-white mb-5">
        {title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          {authorName && (
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              By {authorSlug ? (
                <Link href={`/tags/${authorSlug}`} className="hover:underline">{authorName}</Link>
              ) : authorName}
            </span>
          )}
          {authorName && <span aria-hidden>·</span>}
          <time dateTime={isoDate || undefined}>{formattedDate}</time>
          {typeof readingTimeMinutes === 'number' && (
            <>
              <span aria-hidden>·</span>
              <span>{readingTimeMinutes} min read</span>
            </>
          )}
          {updatedLabel && (
            <>
              <span aria-hidden>·</span>
              <span>Updated {updatedLabel}</span>
            </>
          )}
        </div>
        <div className="share-buttons-float">
          <ShareButtons title={shareTitle} url={shareUrl} />
        </div>
      </div>
    </header>
  );
}
