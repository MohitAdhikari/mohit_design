import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { timingSafeEqual } from 'crypto'

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // Buffers must be equal length for timingSafeEqual — pad to avoid a
  // length-based short-circuit leaking information via timing.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA) // burn constant time on the mismatch path too
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

/**
 * Enable Next.js Draft Mode and redirect to the requested article.
 * Called by the Sanity Studio "Preview" document action.
 *
 * The preview secret is mandatory — if it isn't configured on the server,
 * previews are disabled entirely rather than left open to anyone.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const type = searchParams.get('type')
  const slug = searchParams.get('slug')

  const expectedSecret =
    process.env.SANITY_PREVIEW_SECRET || process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET

  if (!expectedSecret) {
    return new Response('Preview is not configured. Set SANITY_PREVIEW_SECRET.', { status: 503 })
  }

  if (!secret || !constantTimeEquals(secret, expectedSecret)) {
    return new Response('Invalid preview secret', { status: 401 })
  }

  if (!type || !slug) {
    return new Response('Missing type or slug', { status: 400 })
  }

  let path = '/'
  if (type === 'newsPost') {
    path = `/news/${slug}`
  } else if (type === 'guide') {
    path = `/guides/${slug}`
  } else {
    return new Response('Unsupported preview type', { status: 400 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
