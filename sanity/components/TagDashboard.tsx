'use client'

import { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Stack,
  Text,
  TextInput,
  Badge,
  Inline,
} from '@sanity/ui'
import { useRouter } from 'sanity/router'

interface TagDoc {
  _id: string
  _createdAt: string
  title: string
  slug: string
  articleCount: number
}

export function TagDashboard() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const router = useRouter()
  const [tags, setTags] = useState<TagDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editSlug, setEditSlug] = useState<{ id: string; value: string } | null>(null)

  const fetch = async () => {
    setLoading(true)
    const data = await client.fetch<TagDoc[]>(`*[_type == "tag"] | order(_createdAt desc) {
      _id, _createdAt, title, "slug": slug.current,
      "articleCount": count(*[_type in ["newsPost", "guide", "interview"] && references(^._id)])
    }`)
    setTags(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [])

  const stats = useMemo(() => {
    const total = tags.length
    const unused = tags.filter((t) => t.articleCount === 0).length
    const mostUsed = [...tags].sort((a, b) => b.articleCount - a.articleCount).slice(0, 5)
    const recent = [...tags].sort((a, b) => +new Date(b._createdAt) - +new Date(a._createdAt)).slice(0, 5)

    const slugMap = new Map<string, TagDoc[]>()
    tags.forEach((t) => {
      const key = t.slug.toLowerCase()
      if (!slugMap.has(key)) slugMap.set(key, [])
      slugMap.get(key)!.push(t)
    })
    const duplicates = Array.from(slugMap.values()).filter((arr) => arr.length > 1)

    return { total, unused, mostUsed, recent, duplicates }
  }, [tags])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tags.filter((t) => t.title.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
  }, [tags, search])

  const startEdit = (t: TagDoc) => setEditSlug({ id: t._id, value: t.slug })

  const saveSlug = async (id: string) => {
    if (!editSlug) return
    const newSlug = editSlug.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!newSlug) return
    const duplicate = tags.find(
      (t) => t._id !== id && t.slug.toLowerCase() === newSlug
    )
    if (duplicate) {
      alert(`Slug conflict with “${duplicate.title}”. Choose another slug.`)
      return
    }
    await client.patch(id, { set: { 'slug.current': newSlug } })
    setEditSlug(null)
    fetch()
  }

  return (
    <Container width={4}>
      <Stack space={4} padding={4}>
        <Text size={3} weight="semibold">
          Tag Dashboard
        </Text>

        {loading ? (
          <Text muted>Loading…</Text>
        ) : (
          <>
            <Grid columns={[2, 2, 4]} gap={3}>
              <Card border padding={4} radius={2} tone="primary">
                <Stack space={2}>
                  <Text size={1} muted>Total Tags</Text>
                  <Text size={4} weight="bold">{stats.total}</Text>
                </Stack>
              </Card>
              <Card border padding={4} radius={2} tone="caution">
                <Stack space={2}>
                  <Text size={1} muted>Unused Tags</Text>
                  <Text size={4} weight="bold">{stats.unused}</Text>
                </Stack>
              </Card>
              <Card border padding={4} radius={2} tone="positive">
                <Stack space={2}>
                  <Text size={1} muted>Most Used</Text>
                  <Text size={4} weight="bold">{stats.mostUsed[0]?.title || '—'}</Text>
                  {stats.mostUsed[0] && (
                    <Text size={1} muted>{stats.mostUsed[0].articleCount} articles</Text>
                  )}
                </Stack>
              </Card>
              <Card border padding={4} radius={2}>
                <Stack space={2}>
                  <Text size={1} muted>Duplicate Slugs</Text>
                  <Text size={4} weight="bold">{stats.duplicates.length}</Text>
                </Stack>
              </Card>
            </Grid>

            <Grid columns={[1, 1, 2]} gap={4}>
              <Card border radius={2} padding={4}>
                <Stack space={3}>
                  <Text weight="semibold">Most Used Tags</Text>
                  {stats.mostUsed.map((t) => (
                    <Flex key={t._id} justify="space-between">
                      <Text>{t.title}</Text>
                      <Badge tone="positive">{t.articleCount}</Badge>
                    </Flex>
                  ))}
                  {stats.mostUsed.length === 0 && <Text muted>No tags yet.</Text>}
                </Stack>
              </Card>

              <Card border radius={2} padding={4}>
                <Stack space={3}>
                  <Text weight="semibold">Recently Created</Text>
                  {stats.recent.map((t) => (
                    <Flex key={t._id} justify="space-between">
                      <Text>{t.title}</Text>
                      <Text size={1} muted>{new Date(t._createdAt).toLocaleDateString()}</Text>
                    </Flex>
                  ))}
                  {stats.recent.length === 0 && <Text muted>No tags yet.</Text>}
                </Stack>
              </Card>

              {stats.duplicates.length > 0 && (
                <Card border radius={2} padding={4} tone="critical">
                  <Stack space={3}>
                    <Text weight="semibold">Duplicate Slug Conflicts</Text>
                    {stats.duplicates.map((group) => (
                      <Box key={group[0].slug} padding={2}>
                        <Text weight="bold">/{group[0].slug}</Text>
                        <Inline space={2}>
                          {group.map((t) => (
                            <Badge key={t._id}>{t.title}</Badge>
                          ))}
                        </Inline>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              )}
            </Grid>

            <Card border radius={2} padding={4}>
              <Stack space={4}>
                <Flex justify="space-between" align="center">
                  <Text weight="semibold">Slug Manager</Text>
                  <TextInput
                    placeholder="Search slugs…"
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                </Flex>

                <Box style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                        {['Title', 'Slug', 'Articles', 'Actions'].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: 'left',
                              padding: '10px 12px',
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                              color: 'var(--card-muted-fg-color)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((t) => {
                        const hasConflict = stats.duplicates.some((g) => g[0].slug.toLowerCase() === t.slug.toLowerCase())
                        return (
                          <tr key={t._id} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                            <td style={{ padding: '8px 12px' }}>
                              <Text>{t.title}</Text>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {editSlug?.id === t._id ? (
                                <TextInput
                                  value={editSlug.value}
                                  onChange={(e) => setEditSlug({ id: t._id, value: e.currentTarget.value })}
                                  onBlur={() => saveSlug(t._id)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveSlug(t._id)}
                                />
                              ) : (
                                <Inline space={2}>
                                  <Text size={1} muted>/{t.slug}</Text>
                                  {hasConflict && <Badge tone="critical">Conflict</Badge>}
                                </Inline>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <Text size={1}>{t.articleCount}</Text>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <Inline space={2}>
                                <Button
                                  mode="ghost"
                                  size={0}
                                  text={editSlug?.id === t._id ? 'Save' : 'Edit'}
                                  onClick={() =>
                                    editSlug?.id === t._id ? saveSlug(t._id) : startEdit(t)
                                  }
                                />
                                <Button
                                  mode="ghost"
                                  size={0}
                                  text="Open"
                                  onClick={() =>
                                    router.navigateUrl({ path: `/intent/edit/id=${t._id};type=tag/` })
                                  }
                                />
                              </Inline>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Box>
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  )
}
