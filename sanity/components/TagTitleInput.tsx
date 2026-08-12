import { useEffect, useState } from 'react'
import { useClient, useFormValue, set, PatchEvent, type StringInputProps } from 'sanity'
import { useRouter } from 'sanity/router'
import { Box, Button, Card, Inline, Stack, Text, TextInput } from '@sanity/ui'

interface ExistingTag {
  _id: string
  title: string
  slug: { current: string }
}

export function TagTitleInput(props: StringInputProps) {
  const { value = '', onChange, readOnly } = props
  const client = useClient({ apiVersion: '2023-01-01' })
  const router = useRouter()
  const document = useFormValue([]) as { _id?: string } | undefined
  const docId = document?._id || ''
  const [existing, setExisting] = useState<ExistingTag | null>(null)

  useEffect(() => {
    if (!value.trim()) {
      setExisting(null)
      return
    }
    const t = setTimeout(async () => {
      const id = docId.replace(/^drafts\./, '')
      const draftsId = id ? `drafts.${id}` : ''
      const res = await client.fetch<ExistingTag | null>(
        `*[_type == "tag" && title == $title && _id != $id && _id != $draftsId][0]{ _id, title, slug }`,
        { title: value.trim(), id, draftsId }
      )
      setExisting(res)
    }, 250)
    return () => clearTimeout(t)
  }, [value, client, docId])

  const useExisting = () => {
    if (!existing) return
    if (confirm('An existing tag with this title was found. Open it now?')) {
      router.navigateUrl({ path: `/intent/edit/id=${existing._id};type=tag/` })
    }
  }

  return (
    <Stack space={3}>
      <TextInput
        value={value}
        onChange={(e) => onChange(PatchEvent.from(set(e.currentTarget.value)))}
        readOnly={readOnly}
      />
      {existing && (
        <Card border radius={2} padding={3} tone="caution">
          <Stack space={3}>
            <Text size={2}>
              This tag already exists as <strong>“{existing.title}”</strong> (/{existing.slug.current}).
            </Text>
            <Inline space={2}>
              <Button
                mode="default"
                text="Use Existing"
                onClick={useExisting}
                size={1}
              />
              <Button
                mode="ghost"
                text="View Existing Tag"
                onClick={() =>
                  router.navigateUrl({ path: `/intent/edit/id=${existing._id};type=tag/` })
                }
                size={1}
              />
            </Inline>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
