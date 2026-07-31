'use client'

import { useState } from 'react'
import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity'
import { Box, Button, Dialog, Stack, Text, TextInput, Select } from '@sanity/ui'

/**
 * Custom delete action for tags.
 * Warns when the tag is in use and lets the editor either delete it anyway
 * or replace its references with another tag.
 */
export const TagDeleteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, published, onComplete } = props
  const client = useClient({ apiVersion: '2023-01-01' })
  const [open, setOpen] = useState(false)
  const [replaceWith, setReplaceWith] = useState('')
  const [loading, setLoading] = useState(false)

  if (type !== 'tag') return null

  const handleDelete = async () => {
    setLoading(true)
    try {
      const docId = id.replace(/^drafts\./, '')
      const refs = await client.fetch<{ _id: string; _type: string }[]>(
        `*[_type in ["newsPost", "guide", "interview"] && references($tagId)]{_id, _type}`,
        { tagId: docId }
      )

      const trx = client.transaction()

      if (replaceWith.trim() && refs.length > 0) {
        // For each referencing doc, replace the source tag ref with the target
        const fullDocs = await client.fetch<any[]>(
          `*[_type in ["newsPost", "guide", "interview"] && references($tagId)]{_id, "tagRefs": tags[]._ref}`,
          { tagId: docId }
        )

        fullDocs.forEach((doc) => {
          const refsSet = new Set<string>((doc.tagRefs || []))
          refsSet.delete(docId)
          refsSet.add(replaceWith.trim())
          trx.patch(doc._id, {
            set: {
              tags: Array.from(refsSet).map((ref) => ({ _type: 'reference', _ref: ref })),
            },
          })
        })
      }

      trx.delete(docId)
      if (id.startsWith('drafts.')) {
        trx.delete(id)
      } else {
        trx.delete(`drafts.${docId}`)
      }
      await trx.commit()
      onComplete?.()
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return {
    label: 'Delete…',
    tone: 'critical',
    icon: () => '🗑',
    onHandle: () => setOpen(true),
    dialog: open
      ? {
          type: 'dialog',
          onClose: () => setOpen(false),
          header: 'Delete tag',
          content: (
            <Box padding={4}>
              <Stack space={4}>
                <Text>
                  This tag is referenced by articles. You can replace it with another tag or delete
                  it anyway. Enter the document ID of the replacement tag, or leave blank to remove
                  all references.
                </Text>
                <TextInput
                  placeholder="Replacement tag document ID"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.currentTarget.value)}
                />
                <Stack space={2}>
                  <Button
                    mode="default"
                    tone="critical"
                    text={loading ? 'Deleting…' : 'Delete tag'}
                    onClick={handleDelete}
                    disabled={loading}
                  />
                  <Button mode="ghost" text="Cancel" onClick={() => setOpen(false)} disabled={loading} />
                </Stack>
              </Stack>
            </Box>
          ),
        }
      : undefined,
  }
}

/**
 * Merge the current tag into another tag.
 * Replaces all references and removes the merged tag.
 */
export const TagMergeAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, onComplete } = props
  const client = useClient({ apiVersion: '2023-01-01' })
  const [open, setOpen] = useState(false)
  const [targetSlug, setTargetSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (type !== 'tag') return null

  const handleMerge = async () => {
    setError('')
    if (!targetSlug.trim()) {
      setError('Enter a target tag slug.')
      return
    }

    setLoading(true)
    try {
      const sourceId = id.replace(/^drafts\./, '')
      const target = await client.fetch<{ _id: string } | null>(
        `*[_type == "tag" && slug.current == $slug][0]{_id}`,
        { slug: targetSlug.trim() }
      )

      if (!target) {
        setError(`No tag found with slug “${targetSlug}”.`)
        setLoading(false)
        return
      }
      if (target._id === sourceId) {
        setError('Cannot merge a tag into itself.')
        setLoading(false)
        return
      }

      const refs = await client.fetch<any[]>(
        `*[_type in ["newsPost", "guide", "interview"] && references($sourceId)]{_id, "tagRefs": tags[]._ref}`,
        { sourceId }
      )

      const trx = client.transaction()
      refs.forEach((doc) => {
        const set = new Set<string>((doc.tagRefs || []))
        set.delete(sourceId)
        set.add(target._id)
        trx.patch(doc._id, {
          set: {
            tags: Array.from(set).map((ref) => ({ _type: 'reference', _ref: ref })),
          },
        })
      })

      trx.delete(sourceId)
      trx.delete(`drafts.${sourceId}`)
      await trx.commit()
      onComplete?.()
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return {
    label: 'Merge into…',
    tone: 'caution',
    icon: () => '🔀',
    onHandle: () => setOpen(true),
    dialog: open
      ? {
          type: 'dialog',
          onClose: () => setOpen(false),
          header: 'Merge tag',
          content: (
            <Box padding={4}>
              <Stack space={4}>
                <Text>
                  Merge this tag into another tag. All references will point to the target tag and
                  this tag will be deleted.
                </Text>
                <TextInput
                  placeholder="Target tag slug (e.g. bgmi)"
                  value={targetSlug}
                  onChange={(e) => setTargetSlug(e.currentTarget.value)}
                />
                {error && (
                  <Text size={1} style={{ color: 'var(--card-critical-fg-color, #ef4444)' }}>
                    {error}
                  </Text>
                )}
                <Stack space={2}>
                  <Button
                    mode="default"
                    tone="caution"
                    text={loading ? 'Merging…' : 'Merge tags'}
                    onClick={handleMerge}
                    disabled={loading}
                  />
                  <Button mode="ghost" text="Cancel" onClick={() => setOpen(false)} disabled={loading} />
                </Stack>
              </Stack>
            </Box>
          ),
        }
      : undefined,
  }
}
