import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Enable Next.js Draft Mode and redirect to the requested article.
 * Called by the Sanity Studio "Preview" document action.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const type = searchParams.get('type')
  const slug = searchParams.get('slug')

  const expectedSecret =
    process.env.SANITY_PREVIEW_SECRET || process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET

  if (expectedSecret && secret !== expectedSecret) {
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
