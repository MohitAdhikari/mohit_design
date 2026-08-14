import Link from 'next/link'
import { getTags } from '@/lib/api'
import { Metadata } from 'next'

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

const pathSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'
  return {
    title: 'Tags | PHONEOCEAN',
    description: 'Browse all tags and topics covered by PHONEOCEAN.',
    openGraph: {
      title: 'Tags | PHONEOCEAN',
      description: 'Browse all tags and topics covered by PHONEOCEAN.',
      url: `${baseUrl}/tags`,
    },
    alternates: { canonical: `${baseUrl}/tags` },
  }
}

export default async function TagsIndexPage() {
  const tags = await getTags()

  return (
    <div className="pb-20">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0E0E12] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-[#00E5FF] mb-3">
            TOPICS
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk text-gray-900 dark:text-white tracking-tighter leading-tight">
            All Tags
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore every tag and topic in the archive.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag._id}
                href={`/tags/${pathSegment(tag.pathSlug || tag.slug)}`}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111116] text-sm font-medium text-gray-900 dark:text-gray-100 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-colors"
              >
                <span>{tag.title}</span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-500">
                  {tag.articleCount} articles
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-wider py-20">
            No tags found.
          </p>
        )}
      </div>
    </div>
  )
}
