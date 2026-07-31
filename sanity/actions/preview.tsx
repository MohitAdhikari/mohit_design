'use client'

import { EyeOpenIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * "Preview" document action for News Posts and Guides.
 * Opens a live draft preview in a new tab before the document is published.
 * The route enables Next.js Draft Mode and redirects to the article page.
 */
export const PreviewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { type, draft, published } = props

  if (type !== 'newsPost' && type !== 'guide') {
    return null
  }

  const doc = draft || published
  const slug = (doc?.slug as { current?: string } | undefined)?.current

  if (!slug) {
    return null
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'
  const secret = process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET
  const path = type === 'newsPost' ? `/news/${slug}` : `/guides/${slug}`
  const query = new URLSearchParams({ type, slug })
  if (secret) query.set('secret', secret)

  const url = `${baseUrl}/api/preview?${query.toString()}`

  return {
    label: 'Preview',
    icon: EyeOpenIcon,
    onHandle: () => {
      window.open(url, '_blank', 'noopener,noreferrer')
      props.onComplete()
    },
  }
}
