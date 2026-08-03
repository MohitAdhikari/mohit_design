'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
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
  Select,
  Badge,
  Inline,
  Label,
} from '@sanity/ui'
import { useRouter } from 'sanity/router'

interface Tag {
  _id: string
  _createdAt: string
  title: string
  slug: string
  description?: string
  articleCount: number
  lastUsed?: string
}

type SortKey = 'title' | 'articleCount' | 'lastUsed' | 'createdAt'

export function TagManager() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const router = useRouter()
  const [rawTags, setRawTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mergeTarget, setMergeTarget] = useState('')
  const [showMerge, setShowMerge] = useState(false)
  const [showBulkRename, setShowBulkRename] = useState(false)
  const [renameFind, setRenameFind] = useState('')
  const [renameReplace, setRenameReplace] = useState('')

  const fetchTags = useCallback(async () => {
    setLoading(true)
    const data = await client.fetch<Tag[]>(`*[_type == "tag"] | order(title asc) {
      _id, _createdAt, title, "slug": slug.current, description,
      "articleCount": count(*[_type in ["newsPost", "guide", "interview"] && references(^._id)]),
      "lastUsed": *[_type in ["newsPost", "guide", "interview"] && references(^._id)] | order(dateTime(coalesce(publishDate, _createdAt)) desc)[0]{ "lastUsed": coalesce(publishDate, _createdAt) }.lastUsed
    }`)
    setRawTags(data || [])
    setLoading(false)
  }, [client])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const filtered = useMemo(() => {
    let rows = rawTags.filter((t) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.slug?.toLowerCase() || '').includes(q) ||
        (t.description?.toLowerCase() || '').includes(q)
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'used'
          ? t.articleCount > 0
          : t.articleCount === 0
      return matchesSearch && matchesStatus
    })

    rows = [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'title') return a.title.localeCompare(b.title) * dir
      if (sortBy === 'articleCount') return (a.articleCount - b.articleCount) * dir
      if (sortBy === 'lastUsed') {
        const da = a.lastUsed ? new Date(a.lastUsed).getTime() : 0
        const db = b.lastUsed ? new Date(b.lastUsed).getTime() : 0
        return (da - db) * dir
      }
      const ca = new Date(a._createdAt).getTime()
      const cb = new Date(b._createdAt).getTime()
      return (ca - cb) * dir
    })

    return rows
  }, [rawTags, search, statusFilter, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const pageIds = new Set(paged.map((t) => t._id))
    const allSelected = paged.every((t) => selected.has(t._id))
    setSelected((prev) => {
      const next = new Set(prev)
      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const exportCSV = () => {
    const rows = rawTags.filter((t) => selected.size === 0 || selected.has(t._id))
    const headers = ['Title', 'Slug', 'Articles', 'Created', 'Last Used']
    const csv = [headers.join(','), ...rows.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.slug.replace(/"/g, '""')}"`,
      t.articleCount,
      new Date(t._createdAt).toISOString(),
      t.lastUsed ? new Date(t.lastUsed).toISOString() : '',
    ].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tags-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const bulkMerge = async () => {
    if (!mergeTarget.trim()) return
    const target = await client.fetch<{ _id: string } | null>(
      `*[_type == "tag" && slug.current == $slug][0]{_id}`,
      { slug: mergeTarget.trim() }
    )
    if (!target) {
      alert(`No tag found with slug “${mergeTarget}”.`)
      return
    }
    if (selected.has(target._id)) {
      alert('Target tag cannot be part of the selection.')
      return
    }

    const sourceIds = Array.from(selected)
    const articles = await client.fetch<any[]>(
      `*[_type in ["newsPost", "guide", "interview"] && references($sourceIds)]{_id, "tagRefs": tags[]._ref}`,
      { sourceIds }
    )

    const trx = client.transaction()
    articles.forEach((doc) => {
      const refs = new Set<string>((doc.tagRefs || []).filter((r: string) => !sourceIds.includes(r)))
      refs.add(target._id)
      trx.patch(doc._id, {
        set: {
          tags: Array.from(refs).map((ref) => ({ _type: 'reference', _ref: ref })),
        },
      })
    })

    sourceIds.forEach((id) => {
      trx.delete(id)
      trx.delete(`drafts.${id}`)
    })

    await trx.commit()
    setSelected(new Set())
    setShowMerge(false)
    setMergeTarget('')
    fetchTags()
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected tags? This cannot be undone.`)) return
    await Promise.all(Array.from(selected).map((id) => client.delete(id)))
    setSelected(new Set())
    fetchTags()
  }

  const slugifyForRename = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 96)

  const bulkRename = async () => {
    if (!renameFind.trim()) {
      alert('Enter text to find.')
      return
    }

    const find = renameFind.trim()
    const replace = renameReplace.trim()
    const trx = client.transaction()
    const usedSlugs = new Map<string, number>()

    rawTags.forEach((t) => usedSlugs.set(t.slug, (usedSlugs.get(t.slug) || 0) + 1))

    const selectedTags = rawTags.filter((t) => selected.has(t._id))

    selectedTags.forEach((tag) => {
      const newTitle = tag.title.replaceAll(find, replace)
      if (newTitle === tag.title) return

      let baseSlug = slugifyForRename(newTitle)
      let slug = baseSlug
      let attempt = 1
      while (usedSlugs.has(slug) && usedSlugs.get(slug)! > 0) {
        attempt += 1
        slug = `${baseSlug}-${attempt}`
      }
      usedSlugs.set(slug, 1)

      trx.patch(tag._id, {
        set: { title: newTitle, 'slug.current': slug },
      })
    })

    await trx.commit()
    setShowBulkRename(false)
    setRenameFind('')
    setRenameReplace('')
    setSelected(new Set())
    fetchTags()
  }

  const handleDeleteUnused = async () => {
    if (!confirm('Delete all unused tags? This cannot be undone.')) return
    const unused = rawTags.filter((t) => t.articleCount === 0)
    if (unused.length === 0) return
    const ids = unused.map((t) => t._id)
    await Promise.all(ids.map((id) => client.delete(id)))
    fetchTags()
  }

  const handleDelete = async (tag: Tag) => {
    if (tag.articleCount > 0) {
      const replaceWith = prompt(
        `This tag is used in ${tag.articleCount} article(s). Enter a replacement tag document ID to migrate references, or leave blank to delete anyway.`
      )
      if (replaceWith === null) return
      if (replaceWith.trim()) {
        const articles = await client.fetch<any[]>(
          `*[_type in ["newsPost", "guide", "interview"] && references($tagId)]{_id, _type, "tagRefs": tags[]._ref}`,
          { tagId: tag._id }
        )
        const patches = articles
          .filter((a) => a.tagRefs?.includes(tag._id))
          .map((a) => ({
            id: a._id,
            patch: {
              set: {
                tags: a.tagRefs
                  .filter((ref: string) => ref !== tag._id)
                  .concat(replaceWith.trim())
                  .map((ref: string) => ({ _type: 'reference', _ref: ref })),
              },
            },
          }))
        const trx = client.transaction()
        patches.forEach((p) => trx.patch(p.id, p.patch))
        trx.delete(tag._id)
        await trx.commit()
        fetchTags()
        return
      }
    }
    if (!confirm(`Delete tag “${tag.title}”?`)) return
    await client.delete(tag._id)
    fetchTags()
  }

  const navigateToTag = (id: string) => {
    router.navigateUrl({ path: `/intent/edit/id=${id};type=tag/` })
  }

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <Container width={4}>
      <Stack space={4} padding={4}>
        <Flex justify="space-between" align="center">
          <Stack space={2}>
            <Text size={3} weight="semibold">
              Tag Manager
            </Text>
            <Text size={1} muted>
              {rawTags.length} total · {rawTags.filter((t) => t.articleCount === 0).length} unused
            </Text>
          </Stack>
          <Inline space={2}>
            <Button
              mode="ghost"
              tone="critical"
              onClick={handleDeleteUnused}
              disabled={rawTags.filter((t) => t.articleCount === 0).length === 0}
              text="Delete all unused"
            />
            <Button
              mode="default"
              tone="primary"
              onClick={() => router.navigateUrl({ path: '/intent/create/type=tag/' })}
              text="Create tag"
            />
          </Inline>
        </Flex>

        <Grid columns={[1, 1, 3]} gap={3}>
          <TextInput
            placeholder="Search title, slug, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value)
              setPage(1)
            }}
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.currentTarget.value as any)
              setPage(1)
            }}
          >
            <option value="all">All tags</option>
            <option value="used">Used tags</option>
            <option value="unused">Unused tags</option>
          </Select>
          <Select
            value={sortBy}
            onChange={(e) => {
              toggleSort(e.currentTarget.value as SortKey)
            }}
          >
            <option value="title">Sort by Title</option>
            <option value="articleCount">Sort by Article Count</option>
            <option value="lastUsed">Sort by Last Used</option>
            <option value="createdAt">Sort by Created Date</option>
          </Select>
        </Grid>

        {loading ? (
          <Text muted>Loading tags…</Text>
        ) : (
          <>
            {selected.size > 0 && (
              <Card border radius={2} padding={3} tone="primary">
                <Flex justify="space-between" align="center">
                  <Text size={1}>{selected.size} selected</Text>
                  <Inline space={2}>
                    <Button mode="ghost" size={0} text="Export CSV" onClick={exportCSV} />
                    <Button mode="ghost" size={0} text="Bulk rename…" onClick={() => setShowBulkRename(true)} />
                    <Button mode="ghost" size={0} text="Merge into…" onClick={() => setShowMerge(true)} />
                    <Button mode="ghost" tone="critical" size={0} text="Delete selected" onClick={bulkDelete} />
                    <Button mode="ghost" size={0} text="Clear" onClick={() => setSelected(new Set())} />
                  </Inline>
                </Flex>
              </Card>
            )}

            {showMerge && (
              <Card border radius={2} padding={4}>
                <Stack space={3}>
                  <Text weight="semibold">Merge selected tags into</Text>
                  <TextInput
                    placeholder="Target tag slug (e.g. bgmi)"
                    value={mergeTarget}
                    onChange={(e) => setMergeTarget(e.currentTarget.value)}
                  />
                  <Inline space={2}>
                    <Button tone="caution" text="Merge" onClick={bulkMerge} />
                    <Button mode="ghost" text="Cancel" onClick={() => { setShowMerge(false); setMergeTarget('') }} />
                  </Inline>
                </Stack>
              </Card>
            )}

            {showBulkRename && (
              <Card border radius={2} padding={4}>
                <Stack space={3}>
                  <Text weight="semibold">Bulk rename selected tags</Text>
                  <TextInput
                    placeholder="Find in title"
                    value={renameFind}
                    onChange={(e) => setRenameFind(e.currentTarget.value)}
                  />
                  <TextInput
                    placeholder="Replace with"
                    value={renameReplace}
                    onChange={(e) => setRenameReplace(e.currentTarget.value)}
                  />
                  <Inline space={2}>
                    <Button tone="primary" text="Rename" onClick={bulkRename} />
                    <Button mode="ghost" text="Cancel" onClick={() => { setShowBulkRename(false); setRenameFind(''); setRenameReplace('') }} />
                  </Inline>
                </Stack>
              </Card>
            )}

            <Card border radius={2} overflow="hidden">
              <Box style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                      <th style={{ padding: '12px 16px', width: 40 }}>
                        <input
                          type="checkbox"
                          checked={paged.length > 0 && paged.every((t) => selected.has(t._id))}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      {['Title', 'Slug', 'Articles', 'Created', 'Last Used', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '12px 16px',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                            color: 'var(--card-muted-fg-color)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((tag) => (
                      <tr key={tag._id} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <input
                            type="checkbox"
                            checked={selected.has(tag._id)}
                            onChange={() => toggleSelect(tag._id)}
                          />
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Text weight="semibold">{tag.title}</Text>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Text size={1} muted>
                            /{tag.slug}
                          </Text>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Text size={2}>{tag.articleCount}</Text>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Text size={1} muted>
                            {formatDate(tag._createdAt)}
                          </Text>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Text size={1} muted>
                            {formatDate(tag.lastUsed)}
                          </Text>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {tag.articleCount === 0 ? (
                            <Badge tone="caution">Unused</Badge>
                          ) : (
                            <Badge tone="positive">Active</Badge>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <Inline space={2}>
                            <Button
                              mode="ghost"
                              onClick={() => navigateToTag(tag._id)}
                              text="Edit"
                              size={0}
                            />
                            <Button
                              mode="ghost"
                              tone="critical"
                              onClick={() => handleDelete(tag)}
                              text="Delete"
                              size={0}
                            />
                          </Inline>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                          <Text muted>No tags match your filters.</Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Card>

            <Flex justify="center" paddingTop={2} gap={2} align="center">
              <Button
                mode="ghost"
                size={0}
                text="Previous"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Text size={1} muted>
                Page {page} of {totalPages} ({filtered.length} total)
              </Text>
              <Button
                mode="ghost"
                size={0}
                text="Next"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </Flex>
          </>
        )}
      </Stack>
    </Container>
  )
}
