'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useClient, set, type ArrayOfObjectsInputProps } from 'sanity'
import { Box, Button, Card, Flex, Inline, Stack, Text, TextInput } from '@sanity/ui'

interface TagSuggestion {
  _id: string
  title: string
  slug: { current: string }
}

interface TagRef {
  _key: string
  _type: 'reference'
  _ref: string
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 96)
}

function makeKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(36).slice(2, 14)
}

export function TagsInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, readOnly } = props
  const client = useClient({ apiVersion: '2023-01-01' })

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [allTags, setAllTags] = useState<TagSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    client
      .fetch<TagSuggestion[]>(`*[_type == "tag"] | order(title asc) { _id, title, slug }`)
      .then((tags) => setAllTags(tags || []))
  }, [client])

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSuggestions([])
        return
      }
      setLoading(true)
      const pattern = `${q.trim()}*`
      const results = await client.fetch<TagSuggestion[]>(
        `*[_type == "tag" && (title match $pattern || slug.current match $pattern)] | order(title asc) [0...8] {
          _id, title, slug
        }`,
        { pattern }
      )
      setSuggestions(results || [])
      setLoading(false)
    },
    [client]
  )

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(query), 150)
    return () => clearTimeout(t)
  }, [query, fetchSuggestions])

  const addTag = (tagId: string) => {
    const refs = (value as TagRef[]) || []
    if (refs.some((r) => r._ref === tagId)) return
    const next: TagRef[] = [...refs, { _key: makeKey(), _type: 'reference', _ref: tagId }]
    onChange([set(next)])
    setQuery('')
    inputRef.current?.focus()
  }

  const removeTag = (tagId: string) => {
    const refs = (value as TagRef[]) || []
    const next = refs.filter((r) => r._ref !== tagId)
    onChange([set(next)])
  }

  const createTag = async () => {
    const title = query.trim()
    if (!title) return

    const existingByTitle = allTags.find((t) => t.title.toLowerCase() === title.toLowerCase())
    if (existingByTitle) {
      addTag(existingByTitle._id)
      return
    }

    setCreating(true)

    let baseSlug = slugify(title)
    let slug = baseSlug
    let attempt = 1

    // Ensure unique slug
    while (true) {
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "tag" && slug.current == $slug][0]{_id}`,
        { slug }
      )
      if (!existing) break
      attempt += 1
      slug = `${baseSlug}-${attempt}`
    }

    const newTag = await client.create({
      _type: 'tag',
      title,
      slug: { current: slug, _type: 'slug' },
    })

    addTag(newTag._id)
    setCreating(false)
  }

  const selectedTags = ((value as TagRef[]) || []).map((r) => r._ref)
  const filteredSuggestions = suggestions.filter((s) => !selectedTags.includes(s._id))
  const exactMatchByTitle = allTags.some((s) => s.title.toLowerCase() === query.trim().toLowerCase())
  const exactMatchBySlug = allTags.some((s) => s.slug.current.toLowerCase() === slugify(query.trim()).toLowerCase())

  return (
    <Stack space={3}>
      <Text size={1} muted>
        Type to find tags or create a new one inline. Existing tags are shown as chips.
      </Text>
      <Flex gap={2} wrap="wrap">
        {((value as TagRef[]) || []).map((ref) => {
          const tag = allTags.find((s) => s._id === ref._ref)
          const label = tag?.title || ref._ref.slice(0, 8)
          return (
            <Card key={ref._key} tone="primary" padding={2} radius={2}>
              <Inline space={2}>
                <Text size={1} weight="medium">
                  {label}
                </Text>
                {!readOnly && (
                  <Button
                    mode="bleed"
                    tone="critical"
                    size={0}
                    text="×"
                    onClick={() => removeTag(ref._ref)}
                  />
                )}
              </Inline>
            </Card>
          )
        })}
      </Flex>

      {!readOnly && (
        <Box style={{ position: 'relative' }}>
          <TextInput
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="BG, KRAFTON, Free Fire…"
            disabled={creating}
          />

          {(filteredSuggestions.length > 0 || (query.trim() && !(exactMatchByTitle || exactMatchBySlug))) && (
            <Card
              border
              radius={2}
              shadow={1}
              padding={2}
              style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, right: 0, marginTop: 4 }}
            >
              <Stack space={2}>
                {loading && <Text size={1} muted>Searching…</Text>}

                {filteredSuggestions.map((tag) => (
                  <Button
                    key={tag._id}
                    mode="bleed"
                    justify="flex-start"
                    onClick={() => addTag(tag._id)}
                    text={`${tag.title} /${tag.slug.current}`}
                    size={1}
                  />
                ))}

                {query.trim() && !exactMatchByTitle && !exactMatchBySlug && !loading && (
                  <Button
                    mode="ghost"
                    tone="primary"
                    justify="flex-start"
                    onClick={createTag}
                    disabled={creating}
                    text={creating ? 'Creating…' : `+ Create "${query.trim()}"`}
                    size={1}
                  />
                )}
              </Stack>
            </Card>
          )}
        </Box>
      )}
    </Stack>
  )
}
