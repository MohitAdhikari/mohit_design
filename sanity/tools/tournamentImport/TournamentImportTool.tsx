'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Select,
  Stack,
  Text,
  TextArea,
  TextInput,
} from '@sanity/ui'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { nanoid } from 'nanoid'
import { parseArticleText } from '../../../lib/articleImport/parser'
import {
  STANDING_STAGE_OPTIONS,
  buildStandingDoc,
  buildTeamIndex,
  describeContext,
  editionLabel,
  extractArticleTables,
  mergeContext,
  type EditionRef,
  type StandingContext,
  type TeamLookup,
} from '../../../lib/articleImport/tournamentMeta'

const API_VERSION = '2024-04-28'

const numOrUndef = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Number(v))

/**
 * "Tournament Data Import" — parses the day-wise standings table out of a
 * pasted daily article and creates a `standing` document for a specific
 * tournament edition / stage / match day.
 *
 * Hard rule: every document this tool creates has `status: 'draft'`. It
 * NEVER sets status to "published"/"live"/"final" — an editor must open the
 * created draft in Studio and manually change its status before it appears
 * anywhere on the public site (the site's `getStandings()`/`getFinalStandings()`
 * queries only ever read documents with a published-type status). This is
 * the manual-approval gate: nothing this tool imports goes live on its own.
 */
export default function TournamentImportTool() {
  const client = useClient({ apiVersion: API_VERSION })
  const router = useRouter()

  const [editions, setEditions] = useState<EditionRef[]>([])
  const [teams, setTeams] = useState<TeamLookup[]>([])
  const [editionId, setEditionId] = useState('')
  const [stage, setStage] = useState('league_stage')
  const [week, setWeek] = useState('')
  const [day, setDay] = useState('')
  const [matches, setMatches] = useState('')
  const [teamsPerGroup, setTeamsPerGroup] = useState('')
  const [afterMatch, setAfterMatch] = useState('')
  const [overrides, setOverrides] = useState<Record<string, StandingContext>>({})

  const [rawText, setRawText] = useState('')

  const [importing, setImporting] = useState<string | null>(null)
  const [createdIds, setCreatedIds] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    client
      .fetch<EditionRef[]>(
        `*[_type == "tournamentEdition" && !(_id in path("drafts.**"))] | order(year desc) {
          _id, year, name, "tournamentId": tournament._ref, "tournamentName": tournament->name
        }`,
      )
      .then(setEditions)
      .catch(() => {})
    client
      .fetch<TeamLookup[]>(`*[_type == "team" && defined(name)]{ _id, name, shortName }`)
      .then(setTeams)
      .catch(() => {})
  }, [client])

  const teamIndex = useMemo(() => buildTeamIndex(teams), [teams])
  const tables = useMemo(() => extractArticleTables(parseArticleText(rawText).blocks), [rawText])

  const selectedEdition = useMemo(() => editions.find((e) => e._id === editionId) || null, [editions, editionId])
  const canImport = Boolean(selectedEdition)

  const baseCtx: StandingContext = {
    stage,
    week: numOrUndef(week),
    day: numOrUndef(day),
    matchesPlayed: numOrUndef(matches),
    afterMatch: numOrUndef(afterMatch),
  }

  const ctxFor = (key: string, detected: StandingContext): StandingContext => {
    const o = overrides[key] || {}
    return {
      ...mergeContext(baseCtx, detected, { teamsCount: numOrUndef(teamsPerGroup) }),
      ...Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')),
    }
  }

  const patchOverride = (key: string, field: keyof StandingContext, v: string | number | undefined) =>
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], [field]: v } }))

  async function importTable(tableKey: string) {
    const t = tables.find((x) => x.key === tableKey)
    if (!selectedEdition || !t || t.parsed.rows.length === 0) return
    setImporting(tableKey)
    setError(null)
    try {
      const doc = buildStandingDoc({
        edition: selectedEdition,
        ctx: ctxFor(tableKey, t.detected),
        parsed: t.parsed,
        keyFn: nanoid,
        teamIndex,
      })
      const created = await client.create(doc as any)
      setCreatedIds((prev) => ({ ...prev, [tableKey]: created._id }))
    } catch (err: any) {
      setError(err?.message || 'Failed to create draft standing.')
    } finally {
      setImporting(null)
    }
  }

  function openDraft(id: string) {
    router.navigateIntent('edit', { id, type: 'standing' })
  }

  return (
    <Container width={5} padding={4}>
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={3}>Tournament Data Import</Heading>
          <Text size={1} muted>
            Paste your day-wise standings article below. Any pipe (<code>|</code>) table is detected
            automatically. Pick the tournament edition, stage and day, then import each table as a{' '}
            <strong>draft</strong> Standing document — nothing is ever published automatically. Review
            the draft in Studio and change its status yourself when you&apos;re ready to make it live.
          </Text>
        </Stack>

        <Card padding={3} radius={2} border tone="caution">
          <Text size={1}>
            🔒 Every import is created with <strong>status: draft</strong>. The public site only reads
            standings with a published-type status, so imported data can never appear on the website
            until you manually approve it in Studio.
          </Text>
        </Card>

        <Grid columns={[1, 1, 2]} gap={3}>
          <Stack space={2}>
            <Text size={1} weight="semibold">Tournament Edition</Text>
            <Select value={editionId} onChange={(e) => setEditionId(e.currentTarget.value)}>
              <option value="">Select edition…</option>
              {editions.map((e) => (
                <option key={e._id} value={e._id}>{editionLabel(e)}</option>
              ))}
            </Select>
          </Stack>
          <Stack space={2}>
            <Text size={1} weight="semibold">Stage</Text>
            <Select value={stage} onChange={(e) => setStage(e.currentTarget.value)}>
              {STANDING_STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.title}</option>
              ))}
            </Select>
          </Stack>
        </Grid>
        <Grid columns={[2, 3, 5]} gap={3}>
          {([
            ['Week', week, setWeek, '2'],
            ['Day', day, setDay, '3'],
            ['Matches this day', matches, setMatches, '3'],
            ['Teams per group', teamsPerGroup, setTeamsPerGroup, '16'],
            ['After Match (optional)', afterMatch, setAfterMatch, '6'],
          ] as const).map(([label, val, setter, ph]) => (
            <Stack key={label} space={2}>
              <Text size={1} weight="semibold">{label}</Text>
              <TextInput type="number" value={val} placeholder={ph} onChange={(e) => setter(e.currentTarget.value)} />
            </Stack>
          ))}
        </Grid>
        <Text size={1} muted>
          Several groups on the same day? Paste them all together. Put a heading such as{' '}
          <code>## Group A</code> / <code>## Group B</code> above each table and each one is detected
          as its own group. You can still change the group, team count or day for each table below.
        </Text>

        <Stack space={2}>
          <Text size={1} weight="semibold">Article / table text</Text>
          <TextArea
            rows={12}
            value={rawText}
            onChange={(e) => setRawText(e.currentTarget.value)}
            placeholder={'Paste the daily article text, including the standings table, e.g.:\n\n| Rank | Team | WWCD | Kills | Placement Pts | Total Points |\n|------|------|------|-------|----------------|--------------|\n| 1 | Vasista Esports | 2 | 18 | 20 | 37 |'}
          />
        </Stack>

        {!canImport && editions.length > 0 && (
          <Text size={1} muted>Select a tournament edition above to enable import.</Text>
        )}

        {error && (
          <Card padding={3} radius={2} tone="critical" border>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {tables.length === 0 && rawText.trim() && (
          <Text size={1} muted>No pipe table detected yet — make sure rows are separated by | characters.</Text>
        )}

        {tables.map((t, idx) => {
          const ctx = ctxFor(t.key, t.detected)
          const o = overrides[t.key] || {}
          const linked = t.parsed.rows.filter((r) => teamIndex.has(r.teamName.toLowerCase().replace(/[^a-z0-9]/g, ''))).length
          return (
            <Card key={t.key} padding={3} radius={2} border>
              <Stack space={3}>
                <Flex align="center" justify="space-between" gap={2} wrap="wrap">
                  <Stack space={2}>
                    <Text weight="semibold">
                      Table {idx + 1}{t.title ? ` — ${t.title}` : t.heading ? ` — ${t.heading}` : ''}
                    </Text>
                    <Text size={1} muted>
                      {describeContext(ctx) || 'No stage/day set'} · {t.parsed.rows.length} teams · {linked}/{t.parsed.rows.length} linked to Team docs
                    </Text>
                  </Stack>
                  {createdIds[t.key] ? (
                    <Badge tone="positive">Draft created</Badge>
                  ) : (
                    <Button
                      text={importing === t.key ? 'Importing…' : 'Import as Draft Standing'}
                      tone="positive"
                      disabled={!canImport || importing === t.key || t.parsed.rows.length === 0}
                      onClick={() => importTable(t.key)}
                    />
                  )}
                </Flex>

                <Grid columns={[2, 3, 3]} gap={2}>
                  <Stack space={1}>
                    <Text size={0} muted>Group</Text>
                    <TextInput fontSize={1} padding={2} placeholder="Group A" value={o.group ?? ctx.group ?? ''} onChange={(e) => patchOverride(t.key, 'group', e.currentTarget.value)} />
                  </Stack>
                  <Stack space={1}>
                    <Text size={0} muted>Teams in group</Text>
                    <TextInput fontSize={1} padding={2} type="number" value={String(o.teamsCount ?? ctx.teamsCount ?? '')} onChange={(e) => patchOverride(t.key, 'teamsCount', numOrUndef(e.currentTarget.value))} />
                  </Stack>
                  <Stack space={1}>
                    <Text size={0} muted>Day</Text>
                    <TextInput fontSize={1} padding={2} type="number" value={String(o.day ?? ctx.day ?? '')} onChange={(e) => patchOverride(t.key, 'day', numOrUndef(e.currentTarget.value))} />
                  </Stack>
                </Grid>

                {t.parsed.warnings.length > 0 && (
                  <Stack space={1}>
                    {t.parsed.warnings.map((w, i) => (
                      <Text key={i} size={1} muted>⚠ {w}</Text>
                    ))}
                  </Stack>
                )}

                <Box style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Rank', 'Team', 'MP', 'WWCD', 'Kills', 'Placement Pts', 'Points'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid #444' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.parsed.rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: '4px 8px' }}>{r.rank}</td>
                          <td style={{ padding: '4px 8px' }}>{r.teamName}</td>
                          <td style={{ padding: '4px 8px' }}>{r.matchesPlayed ?? '—'}</td>
                          <td style={{ padding: '4px 8px' }}>{r.wwcd ?? '—'}</td>
                          <td style={{ padding: '4px 8px' }}>{r.kills ?? '—'}</td>
                          <td style={{ padding: '4px 8px' }}>{r.placementPoints ?? '—'}</td>
                          <td style={{ padding: '4px 8px' }}>{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>

                {createdIds[t.key] && (
                  <Button text="Open draft in Studio" mode="ghost" onClick={() => openDraft(createdIds[t.key])} />
                )}
              </Stack>
            </Card>
          )
        })}
      </Stack>
    </Container>
  )
}
