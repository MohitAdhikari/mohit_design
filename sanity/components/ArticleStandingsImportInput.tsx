'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Box, Button, Card, Flex, Grid, Select, Stack, Text, TextInput } from '@sanity/ui'
import { set, setIfMissing, useClient, useFormValue, type ObjectInputProps } from 'sanity'
import { useRouter } from 'sanity/router'
import { nanoid } from 'nanoid'
import {
  STANDING_STAGE_OPTIONS,
  buildStandingDoc,
  buildTeamIndex,
  describeContext,
  detectContext,
  extractArticleTables,
  mergeContext,
  type EditionRef,
  type StandingContext,
  type TeamLookup,
} from '../../lib/articleImport/tournamentMeta'

const API_VERSION = '2024-04-28'

interface ExistingStanding {
  _id: string
  stage?: string
  week?: number
  day?: number
  group?: string
  status?: string
}

const sameSlot = (a: StandingContext, b: ExistingStanding) =>
  (a.stage || 'overall') === (b.stage || 'overall') &&
  (a.week ?? null) === (b.week ?? null) &&
  (a.day ?? null) === (b.day ?? null) &&
  (a.group || '') === (b.group || '')

const numOrUndef = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Number(v))

/**
 * Renders the normal "Tournament Match Info" fields, then an import panel
 * that finds every standings table in the article body and turns each one
 * into a DRAFT `standing` document for the selected edition — with stage /
 * week / day from this tab, and group / team count / matches detected per
 * table (from its title or the heading above it, e.g. "Group B — Day 2").
 *
 * Re-importing updates the same draft (matched by article + stage/week/day/
 * group) instead of creating duplicates. Nothing is ever published here.
 */
export function ArticleStandingsImportInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props
  const client = useClient({ apiVersion: API_VERSION })
  const router = useRouter()

  const docId = (useFormValue(['_id']) as string | undefined) || ''
  const articleId = docId.replace(/^drafts\./, '')
  const content = useFormValue(['content']) as any[] | undefined
  const articleTitle = (useFormValue(['title']) as string | undefined) || ''
  const tournamentRef = (useFormValue(['tournament', '_ref']) as string | undefined) || ''

  const meta = (value || {}) as Record<string, any>
  const editionId: string = meta.tournamentEdition?._ref || ''

  const [fetchedEdition, setEdition] = useState<EditionRef | null>(null)
  const edition = editionId && fetchedEdition?._id === editionId ? fetchedEdition : null
  const [teams, setTeams] = useState<TeamLookup[]>([])
  const [existing, setExisting] = useState<ExistingStanding[]>([])
  const [overrides, setOverrides] = useState<Record<string, StandingContext>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, { id: string; updated: boolean }>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editionId) return
    client
      .fetch<EditionRef | null>(
        `*[_type == "tournamentEdition" && _id in [$id, "drafts." + $id]][0]{
          _id, year, name, "tournamentId": tournament._ref, "tournamentName": tournament->name
        }`,
        { id: editionId },
      )
      .then((e) => setEdition(e ? { ...e, _id: e._id.replace(/^drafts\./, '') } : null))
      .catch(() => setEdition(null))
  }, [client, editionId])

  const refreshExisting = useCallback(() => {
    if (!articleId || !editionId) return
    client
      .fetch<ExistingStanding[]>(
        `*[_type == "standing" && sourceArticle._ref == $articleId && edition._ref == $editionId]{ _id, stage, week, day, group, status }`,
        { articleId, editionId },
      )
      .then(setExisting)
      .catch(() => {})
  }, [client, articleId, editionId])

  useEffect(refreshExisting, [refreshExisting])

  useEffect(() => {
    client.fetch<TeamLookup[]>(`*[_type == "team" && defined(name)]{ _id, name, shortName }`).then(setTeams).catch(() => {})
  }, [client])

  const teamIndex = useMemo(() => buildTeamIndex(teams), [teams])
  const tables = useMemo(() => extractArticleTables(content), [content])

  // Tab-level values apply to every table; per-table detection fills group,
  // team count etc.; the editor's per-table overrides always win.
  const baseCtx: StandingContext = useMemo(() => mergeContext({
    stage: meta.stage || undefined,
    week: meta.week ?? undefined,
    day: meta.matchDay ?? undefined,
    matchesPlayed: meta.matchesPerDay ?? undefined,
  }), [meta.stage, meta.week, meta.matchDay, meta.matchesPerDay])

  const groupsList: string[] = useMemo(() => (Array.isArray(meta.groups) ? meta.groups : []), [meta.groups])

  const ctxFor = useCallback((key: string, detected: StandingContext): StandingContext => {
    const o = overrides[key] || {}
    // No group in the table title/heading → take the Nth entry of "Groups
    // Playing This Day" (tables are assumed to be in the same order).
    const idx = tables.findIndex((t) => t.key === key)
    const listGroup = groupsList[idx]
    return {
      ...mergeContext(baseCtx, detected, {
        teamsCount: meta.teamsPerGroup ?? undefined,
        group: listGroup ? (/^group\b/i.test(listGroup) ? listGroup : `Group ${listGroup}`) : undefined,
      }),
      ...Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)),
    }
  }, [overrides, baseCtx, meta.teamsPerGroup, tables, groupsList])

  const patchOverride = (key: string, field: keyof StandingContext, v: string | number | undefined) =>
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], [field]: v === '' ? undefined : v } }))

  const detectFromTitle = () => {
    const d = detectContext(articleTitle)
    const patches: any[] = [setIfMissing({})]
    if (d.stage && !meta.stage) patches.push(set(d.stage, ['stage']))
    if (d.week && meta.week == null) patches.push(set(d.week, ['week']))
    if (d.day && meta.matchDay == null) patches.push(set(d.day, ['matchDay']))
    if (d.matchesPlayed && meta.matchesPerDay == null) patches.push(set(d.matchesPlayed, ['matchesPerDay']))
    if (!meta.articleType) patches.push(set('day_standings', ['articleType']))
    onChange(patches)
  }

  async function importTable(key: string) {
    const t = tables.find((x) => x.key === key)
    if (!t || !edition || t.parsed.rows.length === 0) return
    setBusy(key)
    setError(null)
    try {
      const ctx = ctxFor(key, t.detected)
      const doc = buildStandingDoc({ edition, ctx, parsed: t.parsed, keyFn: nanoid, teamIndex, sourceArticleId: articleId })
      const prev = existing.find((e) => sameSlot(ctx, e) && e.status === 'draft')
      if (prev) {
        await client.patch(prev._id).set({ title: doc.title, rows: doc.rows, teamsCount: doc.teamsCount, lastUpdated: doc.lastUpdated, ...(doc.matchesPlayed ? { matchesPlayed: doc.matchesPlayed } : {}) }).commit()
        setDone((d) => ({ ...d, [key]: { id: prev._id, updated: true } }))
      } else {
        const created = await client.create(doc as any)
        setDone((d) => ({ ...d, [key]: { id: created._id, updated: false } }))
      }
      refreshExisting()
    } catch (err: any) {
      setError(err?.message || 'Import failed.')
    } finally {
      setBusy(null)
    }
  }

  async function importAll() {
    for (const t of tables) {
      if (t.parsed.rows.length > 0) await importTable(t.key)
    }
  }

  const missing = [
    !tournamentRef && 'Tournament',
    !editionId && 'Tournament Edition',
  ].filter(Boolean) as string[]

  return (
    <Stack space={4}>
      {renderDefault(props)}

      <Card padding={3} radius={2} border tone="primary">
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={2} wrap="wrap">
            <Text weight="semibold">📊 Import standings from this article</Text>
            <Flex gap={2}>
              <Button text="Detect from title" mode="ghost" fontSize={1} padding={2} onClick={detectFromTitle} disabled={!articleTitle} />
              <Button
                text={`Import all ${tables.length || ''} as draft`.replace('  ', ' ')}
                tone="positive"
                fontSize={1}
                padding={2}
                disabled={!edition || tables.length === 0 || !!busy}
                onClick={importAll}
              />
            </Flex>
          </Flex>
          <Text size={1} muted>
            Every standings table in the article body is listed below. Group, day, week and team count
            are picked up from the table title or the heading above it (e.g. &quot;## Group B — Day 2&quot;);
            fix anything that&apos;s wrong before importing. Imports are created as <strong>draft</strong>{' '}
            standings. Open one and set its status to Published to put it on the tournament page.
          </Text>

          {missing.length > 0 && (
            <Card padding={2} radius={2} tone="caution" border>
              <Text size={1}>Select {missing.join(' and ')} above to enable import.</Text>
            </Card>
          )}
          {tables.length === 0 && (
            <Text size={1} muted>No standings tables found in the article content yet.</Text>
          )}
          {error && (
            <Card padding={2} radius={2} tone="critical" border><Text size={1}>{error}</Text></Card>
          )}

          {tables.map((t, idx) => {
            const ctx = ctxFor(t.key, t.detected)
            const prev = existing.find((e) => sameSlot(ctx, e))
            const result = done[t.key]
            const o = overrides[t.key] || {}
            const matched = t.parsed.rows.filter((r) => teamIndex.has(r.teamName.toLowerCase().replace(/[^a-z0-9]/g, ''))).length
            return (
              <Card key={t.key} padding={3} radius={2} border>
                <Stack space={3}>
                  <Flex align="center" justify="space-between" gap={2} wrap="wrap">
                    <Stack space={2}>
                      <Text size={1} weight="semibold">
                        Table {idx + 1}{t.title ? ` — ${t.title}` : t.heading ? ` — ${t.heading}` : ''}
                      </Text>
                      <Text size={0} muted>
                        {describeContext(ctx) || 'No stage/day set'} · {t.parsed.rows.length} teams · {matched}/{t.parsed.rows.length} linked to Team docs
                      </Text>
                    </Stack>
                    <Flex gap={2} align="center">
                      {prev && !result && (
                        <Badge tone={prev.status === 'draft' ? 'caution' : 'positive'}>
                          {prev.status === 'draft' ? 'Imported (draft)' : `Imported (${prev.status})`}
                        </Badge>
                      )}
                      {result && <Badge tone="positive">{result.updated ? 'Draft updated' : 'Draft created'}</Badge>}
                      <Button
                        text={busy === t.key ? 'Importing…' : prev?.status === 'draft' ? 'Update draft' : 'Import as draft'}
                        tone="positive"
                        mode={prev ? 'ghost' : 'default'}
                        fontSize={1}
                        padding={2}
                        disabled={!edition || !!busy || t.parsed.rows.length === 0}
                        onClick={() => importTable(t.key)}
                      />
                      {(result?.id || prev?._id) && (
                        <Button
                          text="Open"
                          mode="bleed"
                          fontSize={1}
                          padding={2}
                          onClick={() => router.navigateIntent('edit', { id: (result?.id || prev?._id)!, type: 'standing' })}
                        />
                      )}
                    </Flex>
                  </Flex>

                  <Grid columns={[2, 3, 6]} gap={2}>
                    <Stack space={1}>
                      <Text size={0} muted>Stage</Text>
                      <Select fontSize={1} padding={2} value={o.stage ?? ctx.stage ?? ''} onChange={(e) => patchOverride(t.key, 'stage', e.currentTarget.value)}>
                        <option value="">—</option>
                        {STANDING_STAGE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.title}</option>)}
                      </Select>
                    </Stack>
                    <Stack space={1}>
                      <Text size={0} muted>Week</Text>
                      <TextInput fontSize={1} padding={2} type="number" value={String(o.week ?? ctx.week ?? '')} onChange={(e) => patchOverride(t.key, 'week', numOrUndef(e.currentTarget.value))} />
                    </Stack>
                    <Stack space={1}>
                      <Text size={0} muted>Day</Text>
                      <TextInput fontSize={1} padding={2} type="number" value={String(o.day ?? ctx.day ?? '')} onChange={(e) => patchOverride(t.key, 'day', numOrUndef(e.currentTarget.value))} />
                    </Stack>
                    <Stack space={1}>
                      <Text size={0} muted>Group</Text>
                      <TextInput fontSize={1} padding={2} placeholder="Group A" value={o.group ?? ctx.group ?? ''} onChange={(e) => patchOverride(t.key, 'group', e.currentTarget.value)} />
                    </Stack>
                    <Stack space={1}>
                      <Text size={0} muted>Teams in group</Text>
                      <TextInput fontSize={1} padding={2} type="number" value={String(o.teamsCount ?? ctx.teamsCount ?? '')} onChange={(e) => patchOverride(t.key, 'teamsCount', numOrUndef(e.currentTarget.value))} />
                    </Stack>
                    <Stack space={1}>
                      <Text size={0} muted>Matches</Text>
                      <TextInput fontSize={1} padding={2} type="number" value={String(o.matchesPlayed ?? ctx.matchesPlayed ?? '')} onChange={(e) => patchOverride(t.key, 'matchesPlayed', numOrUndef(e.currentTarget.value))} />
                    </Stack>
                  </Grid>

                  {t.parsed.warnings.map((w, i) => <Text key={i} size={0} muted>⚠ {w}</Text>)}

                  <Box style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['#', 'Team', 'MP', 'WWCD', 'Place', 'Kills', 'Pts'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', padding: '3px 6px', borderBottom: '1px solid #444' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.parsed.rows.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '3px 6px' }}>{r.rank}</td>
                            <td style={{ padding: '3px 6px' }}>{r.teamName}</td>
                            <td style={{ padding: '3px 6px' }}>{r.matchesPlayed ?? '—'}</td>
                            <td style={{ padding: '3px 6px' }}>{r.wwcd ?? '—'}</td>
                            <td style={{ padding: '3px 6px' }}>{r.placementPoints ?? '—'}</td>
                            <td style={{ padding: '3px 6px' }}>{r.kills ?? '—'}</td>
                            <td style={{ padding: '3px 6px' }}>{r.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Stack>
              </Card>
            )
          })}
        </Stack>
      </Card>
    </Stack>
  )
}
