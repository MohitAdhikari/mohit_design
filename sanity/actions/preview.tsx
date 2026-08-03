'use client'

import { EyeOpenIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

interface DocLike {
  _type?: string
  slug?: { current?: string }
}

export const PreviewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const doc = (props.draft ?? props.published) as DocLike | undefined
  const type = doc?._type
  const slug = doc?.slug?.current

  if (type !== 'newsPost' && type !== 'guide') {
    return null
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'
  const secret = process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET
  const path = type === 'newsPost' ? `/news/${slug}` : `/guides/${slug}`

  const query = new URLSearchParams({ type, slug: slug || '' })
  if (secret) query.set('secret', secret)
  const url = `${baseUrl}/api/preview?${query.toString()}`

  return {
    label: 'Preview',
    icon: EyeOpenIcon,
    disabled: !slug,
    tone: 'primary',
    onHandle: () => {
      if (slug) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      props.onComplete()
    },
  }
}
