'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  TextArea,
  TextInput,
  Badge,
  Spinner,
} from '@sanity/ui'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { nanoid } from 'nanoid'
import { parseArticleText, type ImportedBlock, type ParseResult } from '../../../lib/articleImport/parser'
import { buildSeoSuggestion, slugify, type SeoSuggestion } from '../../../lib/articleImport/seo'

const API_VERSION = '2024-04-28'

interface TagDoc {
  _id: string
  title: string
}

/** Minimal, dependency-free preview of the parsed Portable Text blocks —
 * enough to sanity-check headings/lists/quotes/tables/links before
 * creating the draft. Not a full renderer; the real look-and-feel is
 * whatever SanityContent renders on the live site. */
function BlockPreview({ blocks }: { blocks: ImportedBlock[] }) {
  if (blocks.length === 0) {
    return <Text size={1} muted>Nothing parsed yet — paste an article on the left.</Text>
  }
  return (
    <Stack space={3}>
      {blocks.map((b) => {
        if (b._type === 'standingsTable') {
          return (
            <Card key={b._key} padding={3} radius={2} tone="primary" border>
              <Text size={1} weight="semibold">📊 Table: {b.title || 'Untitled table'}</Text>
              <Box marginTop={2}>
                <Text size={1} muted style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {b.rawText}
                </Text>
              </Box>
            </Card>
          )
        }
        const text = b.children.map((c) => c.text).join('')
        if (b.style === 'h2') return <Heading key={b._key} size={2}>{text}</Heading>
        if (b.style === 'h3') return <Heading key={b._key} size={1}>{text}</Heading>
        if (b.style === 'blockquote') {
          return (
            <Card key={b._key} padding={3} radius={2} tone="caution" borderLeft>
              <Text size={1} style={{ fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</Text>
            </Card>
          )
        }
        if (b.listItem === 'bullet') return <Text key={b._key} size={2}>• {text}</Text>
        if (b.listItem === 'number') return <Text key={b._key} size={2}>1. {text}</Text>
        return <Text key={b._key} size={2}>{text}</Text>
      })}
    </Stack>
  )
}

export default function PasteArticleTool() {
  const client = useClient({ apiVersion: API_VERSION })
  const router = useRouter()

  const [rawText, setRawText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult>({ blocks: [], warnings: [], detectedTitle: null })
  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [seo, setSeo] = useState<SeoSuggestion | null>(null)
  const [allTags, setAllTags] = useState<TagDoc[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [createdDocId, setCreatedDocId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    client.fetch<TagDoc[]>(`*[_type == "tag"]{_id, title} | order(title asc)`).then(setAllTags).catch(() => {})
  }, [client])

  // Re-parse whenever the pasted text changes.
  useEffect(() => {
    const result = parseArticleText(rawText)
    setParseResult(result)
    if (!titleTouched && result.detectedTitle) {
      setTitle(result.detectedTitle)
    }
  }, [rawText, titleTouched])

  // Recompute SEO suggestions whenever the parsed content or title changes.
  useEffect(() => {
    if (!title.trim() && parseResult.blocks.length === 0) {
      setSeo(null)
      return
    }
    const suggestion = buildSeoSuggestion(title, parseResult.blocks, allTags)
    setSeo(suggestion)
    setSelectedTagIds((prev) => (prev.length > 0 ? prev : suggestion.suggestedTagIds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, parseResult.blocks, allTags])

  const wordCount = seo?.wordCount ?? 0
  const readingTime = seo?.readingTimeMinutes ?? 1

  const toggleTag = useCallback((id: string) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }, [])

  const canCreate = title.trim().length > 0 && parseResult.blocks.length > 0 && !creating

  async function handleCreateDraft() {
    if (!canCreate) return
    setCreating(true)
    setError(null)
    try {
      const docId = `drafts.pasted-${nanoid(10)}`
      const slug = seo?.slug || slugify(title)

      const contentBlocks = parseResult.blocks.map((b) => {
        if (b._type === 'standingsTable') {
          return { _type: 'standingsTable', _key: b._key, title: b.title, hideTitle: b.hideTitle, rawText: b.rawText }
        }
        return {
          _type: 'block',
          _key: b._key,
          style: b.style,
          ...(b.listItem ? { listItem: b.listItem, level: b.level ?? 1 } : {}),
          markDefs: b.markDefs,
          children: b.children,
        }
      })

      await client.create({
        _id: docId,
        _type: 'newsPost',
        title: title.trim(),
        slug: { _type: 'slug', current: slug },
        excerpt: seo?.excerpt || '',
        content: contentBlocks,
        wordCount,
        tags: selectedTagIds.map((id) => ({ _type: 'reference', _ref: id, _key: nanoid() })),
        status: 'draft',
        publishDate: new Date().toISOString(),
        seo: {
          seoTitle: seo?.seoTitle || title.trim(),
          metaDescription: seo?.metaDescription || '',
        },
      })

      setCreatedDocId(docId)
    } catch (err: any) {
      setError(err?.message || 'Failed to create draft.')
    } finally {
      setCreating(false)
    }
  }

  function openDraft() {
    if (!createdDocId) return
    router.navigateIntent('edit', { id: createdDocId.replace(/^drafts\./, ''), type: 'newsPost' })
  }

  const issues = seo?.issues ?? []
  const warnings = parseResult.warnings

  return (
    <Container width={5} padding={4}>
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={3}>Paste AI Article</Heading>
          <Text size={1} muted>
            Paste an article from ChatGPT, Claude, Gemini, etc. below. Mark headings with{' '}
            <code>#</code>, <code>##</code>, <code>###</code> — everything else (bold, links, lists,
            quotes, tables) is detected automatically. Nothing is saved until you click{' '}
            <strong>Create Draft</strong>, and the result is a completely normal, fully editable
            News Post draft — your existing editor workflow is untouched.
          </Text>
        </Stack>

        {createdDocId ? (
          <Card padding={4} radius={3} tone="positive" border>
            <Stack space={3}>
              <Text weight="semibold">Draft created successfully.</Text>
              <Flex gap={2}>
                <Button text="Open draft in editor" tone="positive" onClick={openDraft} />
                <Button
                  text="Import another article"
                  mode="ghost"
                  onClick={() => {
                    setCreatedDocId(null)
                    setRawText('')
                    setTitle('')
                    setTitleTouched(false)
                    setSelectedTagIds([])
                  }}
                />
              </Flex>
            </Stack>
          </Card>
        ) : (
          <Grid columns={[1, 1, 2]} gap={4}>
            <Stack space={3}>
              <Stack space={2}>
                <Text size={1} weight="semibold">Article text</Text>
                <TextArea
                  rows={18}
                  value={rawText}
                  onChange={(e) => setRawText(e.currentTarget.value)}
                  placeholder="Paste the full article here..."
                />
              </Stack>

              <Stack space={2}>
                <Text size={1} weight="semibold">Title</Text>
                <TextInput
                  value={title}
                  onChange={(e) => {
                    setTitleTouched(true)
                    setTitle(e.currentTarget.value)
                  }}
                  placeholder="Article title"
                />
              </Stack>

              {seo && (
                <Stack space={2}>
                  <Text size={1} weight="semibold">Excerpt</Text>
                  <TextArea
                    rows={3}
                    value={seo.excerpt}
                    onChange={(e) => setSeo({ ...seo, excerpt: e.currentTarget.value })}
                  />
                  <Text size={1} weight="semibold" style={{ marginTop: 8 }}>SEO title</Text>
                  <TextInput
                    value={seo.seoTitle}
                    onChange={(e) => setSeo({ ...seo, seoTitle: e.currentTarget.value })}
                  />
                  <Text size={1} weight="semibold" style={{ marginTop: 8 }}>Meta description</Text>
                  <TextArea
                    rows={2}
                    value={seo.metaDescription}
                    onChange={(e) => setSeo({ ...seo, metaDescription: e.currentTarget.value })}
                  />
                </Stack>
              )}

              {allTags.length > 0 && (
                <Stack space={2}>
                  <Text size={1} weight="semibold">Tags</Text>
                  <Flex wrap="wrap" gap={2}>
                    {allTags.map((tag) => (
                      <Flex key={tag._id} align="center" gap={1}>
                        <Checkbox
                          checked={selectedTagIds.includes(tag._id)}
                          onChange={() => toggleTag(tag._id)}
                          id={`tag-${tag._id}`}
                        />
                        <Text size={1} as="label" htmlFor={`tag-${tag._id}`}>{tag.title}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Stack>
              )}

              {error && (
                <Card padding={3} radius={2} tone="critical" border>
                  <Text size={1}>{error}</Text>
                </Card>
              )}

              <Button
                text={creating ? 'Creating draft…' : 'Create Draft'}
                tone="positive"
                disabled={!canCreate}
                icon={creating ? Spinner : undefined}
                onClick={handleCreateDraft}
              />
            </Stack>

            <Stack space={4}>
              <Card padding={3} radius={2} border>
                <Flex gap={3} wrap="wrap">
                  <Badge tone="primary">{wordCount} words</Badge>
                  <Badge tone="primary">~{readingTime} min read</Badge>
                  <Badge tone={parseResult.blocks.length ? 'positive' : 'default'}>
                    {parseResult.blocks.length} blocks
                  </Badge>
                </Flex>
              </Card>

              {(warnings.length > 0 || issues.length > 0) && (
                <Card padding={3} radius={2} tone="caution" border>
                  <Stack space={2}>
                    <Text size={1} weight="semibold">Needs your attention</Text>
                    {issues.map((issue, i) => (
                      <Text key={`i${i}`} size={1}>⚠ {issue.message}</Text>
                    ))}
                    {warnings.map((w, i) => (
                      <Text key={`w${i}`} size={1} muted>ℹ {w.message}</Text>
                    ))}
                  </Stack>
                </Card>
              )}

              <Stack space={2}>
                <Text size={1} weight="semibold">Preview</Text>
                <Card padding={3} radius={2} border style={{ maxHeight: 480, overflowY: 'auto' }}>
                  <BlockPreview blocks={parseResult.blocks} />
                </Card>
              </Stack>
            </Stack>
          </Grid>
        )}
      </Stack>
    </Container>
  )
}
