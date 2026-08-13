import { revalidatePath, revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'crypto'

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

// Maps a Sanity document _type to the site paths/tags that should be
// invalidated immediately when a document of that type is published.
const TYPE_PATHS: Record<string, string[]> = {
  newsPost: ['/', '/news'],
  guide: ['/', '/guides'],
  interview: ['/', '/interviews'],
  tournamentEdition: ['/', '/esports'],
  tournament: ['/esports'],
  homepage: ['/'],
  siteSettings: ['/'],
}

/**
 * On-demand ISR revalidation, called by a Sanity webhook on document
 * publish/update. This lets page-level `revalidate` windows stay long
 * (reducing ISR Write Units) while content still updates instantly.
 *
 * Configure in Sanity: Studio → API → Webhooks
 *   URL: https://<site>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *   Trigger on: Create, Update, Delete
 *   Filter: _type in ["newsPost","guide","interview","tournamentEdition","tournament","homepage","siteSettings"]
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET
  if (!expectedSecret) {
    return new Response('Revalidation is not configured. Set SANITY_REVALIDATE_SECRET.', { status: 503 })
  }
  if (!secret || !constantTimeEquals(secret, expectedSecret)) {
    return new Response('Invalid revalidate secret', { status: 401 })
  }

  let body: any = null
  try {
    body = await request.json()
  } catch {
    // no body — fall through to a generic homepage revalidation
  }

  const type: string | undefined = body?._type
  const slug: string | undefined = body?.slug?.current

  const paths = new Set<string>(type ? TYPE_PATHS[type] ?? [] : ['/'])

  if (slug) {
    if (type === 'newsPost') paths.add(`/news/${slug}`)
    if (type === 'guide') paths.add(`/guides/${slug}`)
    if (type === 'tournamentEdition' || type === 'tournament') paths.add(`/esports/${slug}`)
  }

  for (const path of paths) revalidatePath(path)

  // Also revalidate shared data tags used by unstable_cache-wrapped fetchers.
  revalidateTag('homepage-feed', 'max')

  return Response.json({ revalidated: true, type, slug, paths: [...paths], now: Date.now() })
}

export async function GET() {
  return new Response('Use POST from the Sanity webhook.', { status: 405 })
}
