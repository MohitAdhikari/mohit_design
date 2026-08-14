import { revalidatePath, revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'crypto'
import { client } from '@/lib/sanityClient'

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
  guide: ['/', '/guides', '/codes', '/codes/blox-fruits'],
  interview: ['/', '/interviews'],
  tournamentEdition: ['/', '/esports'],
  tournament: ['/esports'],
  match: ['/esports'],
  standing: ['/esports'],
  homepage: ['/'],
  siteSettings: ['/'],
}

/**
 * On-demand ISR revalidation, called by a Sanity webhook on document
 * publish/update. This lets page-level `revalidate` windows stay long
 * (reducing ISR Write Units) while content still updates instantly.
 *
 * Configure in Sanity (manage.sanity.io → project → API → Webhooks):
 *   URL: https://<site>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *   Trigger on: Create, Update, Delete
 *   Filter: !(_id in path("drafts.**")) && _type in ["newsPost","guide","interview","tournamentEdition","tournament","match","standing","homepage","siteSettings"]
 *
 *   IMPORTANT: the `!(_id in path("drafts.**"))` clause is required.
 *   Without it, Sanity Studio's autosave (which fires every few seconds
 *   while a document is being edited, before it's ever published) will
 *   trigger this webhook and burn ISR Write Units on every keystroke-save,
 *   not just on real publishes. This route also guards against that
 *   below, but fixing the filter at the source avoids the network round
 *   trip entirely.
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

  const id: string | undefined = body?._id

  // CRITICAL ISR budget guard: Sanity Studio autosaves the DRAFT document
  // every few seconds while someone is typing — if the webhook trigger
  // isn't scoped to exclude drafts, each autosave fires this route and
  // burns 5-8 ISR Write Units per call. A real publish always mutates the
  // non-draft `_id` (no "drafts." prefix), so bail out early on drafts.
  if (id?.startsWith('drafts.')) {
    return Response.json({ revalidated: false, reason: 'draft-skipped', id })
  }

  const type: string | undefined = body?._type
  const slug: string | undefined = body?.slug?.current
  const editionRef: string | undefined = body?.edition?._ref

  const paths = new Set<string>(type ? TYPE_PATHS[type] ?? [] : ['/'])

  if (slug) {
    if (type === 'newsPost') paths.add(`/news/${slug}`)
    if (type === 'guide') paths.add(`/guides/${slug}`)
    if (type === 'tournamentEdition' || type === 'tournament') paths.add(`/esports/${slug}`)
  }

  // Match / standing documents need the parent tournament slug to revalidate
  // the bracket, matches, and standings sub-routes.
  if ((type === 'match' || type === 'standing') && (editionRef || id)) {
    const lookupId = editionRef ?? id
    const tourSlug = await client.fetch(
      `*[_id == $id][0]{ 'slug': edition->tournament->slug.current }`,
      { id: lookupId },
    )
    if (tourSlug) {
      paths.add(`/esports/${tourSlug}`)
      paths.add(`/esports/${tourSlug}/bracket`)
      paths.add(`/esports/${tourSlug}/matches`)
      paths.add(`/esports/${tourSlug}/standings`)
    }
  }

  for (const path of paths) revalidatePath(path)

  // Also revalidate shared data tags used by unstable_cache-wrapped fetchers.
  revalidateTag('homepage-feed', 'max')

  return Response.json({ revalidated: true, type, slug, paths: [...paths], now: Date.now() })
}

export async function GET() {
  return new Response('Use POST from the Sanity webhook.', { status: 405 })
}
