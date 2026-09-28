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
import { parseStandingsRawText, type ParsedStandingsTable } from '../../../lib/articleImport/standingsParser'

const API_VERSION = '2024-04-28'

const STAGE_OPTIONS = [
  { title: 'Group Stage', value: 'group_stage' },
  { title: 'League Stage', value: 'league_stage' },
  { title: 'Survival Stage', value: 'survival_stage' },
  { title: 'Playoffs', value: 'playoffs' },
  { title: 'Grand Finals', value: 'grand_finals' },
  { title: 'Finals', value: 'finals' },
  { title: 'Overall', value: 'overall' },
]

interface EditionOption {
  _id: string
  year: string
  tournamentId: string
  tournamentName: string
}

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

  const [editions, setEditions] = useState<EditionOption[]>([])
  const [editionId, setEditionId] = useState('')
  const [stage, setStage] = useState('overall')
  const [group, setGroup] = useState('')
  const [day, setDay] = useState('')
  const [afterMatch, setAfterMatch] = useState('')

  const [rawText, setRawText] = useState('')

  const [importing, setImporting] = useState<string | null>(null)
  const [createdIds, setCreatedIds] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    client
      .fetch<EditionOption[]>(
        `*[_type == "tournamentEdition"] | order(year desc) {
          _id, year, "tournamentId": tournament._ref, "tournamentName": tournament->name
        }`,
      )
      .then(setEditions)
      .catch(() => {})
  }, [client])

  const tables = useMemo(() => {
    const result = parseArticleText(rawText)
    return result.blocks
      .filter((b): b is any => b._type === 'standingsTable')
      .map((b) => ({
        key: b._key,
        rawTableText: b.rawText,
        parsed: parseStandingsRawText(b.rawText),
      }))
  }, [rawText])

  const selectedEdition = useMemo(() => editions.find((e) => e._id === editionId) || null, [editions, editionId])
  const canImport = Boolean(selectedEdition)

  async function importTable(tableKey: string, parsed: ParsedStandingsTable) {
    if (!selectedEdition || parsed.rows.length === 0) return
    setImporting(tableKey)
    setError(null)
    try {
      const stageTitle = STAGE_OPTIONS.find((s) => s.value === stage)?.title || 'Standings'
      const dayLabel = day ? ` Day ${day}` : afterMatch ? ` (After Match ${afterMatch})` : ''
      const title = `${selectedEdition.tournamentName} ${selectedEdition.year} — ${stageTitle}${dayLabel}`

      const doc = {
        _type: 'standing',
        title,
        tournament: { _type: 'reference', _ref: selectedEdition.tournamentId },
        edition: { _type: 'reference', _ref: selectedEdition._id },
        stage,
        ...(group.trim() ? { group: group.trim() } : {}),
        ...(day.trim() ? { day: Number(day) } : {}),
        ...(afterMatch.trim() ? { afterMatch: Number(afterMatch) } : {}),
        // Always a draft — this is the manual-approval gate. Never publish
        // automatically from this tool.
        status: 'draft',
        lastUpdated: new Date().toISOString(),
        rows: parsed.rows.map((r) => ({
          _key: nanoid(),
          _type: 'standingRow',
          rank: r.rank,
          teamName: r.teamName,
          matchesPlayed: r.matchesPlayed ?? 0,
          wins: r.wins ?? 0,
          losses: r.losses ?? 0,
          wwcd: r.wwcd ?? 0,
          placementPoints: r.placementPoints ?? 0,
          kills: r.kills ?? 0,
          points: r.points,
        })),
      }

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
                <option key={e._id} value={e._id}>
                  {e.tournamentName} {e.year}
                </option>
              ))}
            </Select>
          </Stack>
          <Stack space={2}>
            <Text size={1} weight="semibold">Stage</Text>
            <Select value={stage} onChange={(e) => setStage(e.currentTarget.value)}>
              {STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.title}</option>
              ))}
            </Select>
          </Stack>
          <Stack space={2}>
            <Text size={1} weight="semibold">Group (optional)</Text>
            <TextInput value={group} onChange={(e) => setGroup(e.currentTarget.value)} placeholder="Group A" />
          </Stack>
          <Flex gap={3}>
            <Stack space={2} style={{ flex: 1 }}>
              <Text size={1} weight="semibold">Day</Text>
              <TextInput
                type="number"
                value={day}
                onChange={(e) => setDay(e.currentTarget.value)}
                placeholder="1"
              />
            </Stack>
            <Stack space={2} style={{ flex: 1 }}>
              <Text size={1} weight="semibold">After Match</Text>
              <TextInput
                type="number"
                value={afterMatch}
                onChange={(e) => setAfterMatch(e.currentTarget.value)}
                placeholder="6"
              />
            </Stack>
          </Flex>
        </Grid>

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

        {tables.map((t, idx) => (
          <Card key={t.key} padding={3} radius={2} border>
            <Stack space={3}>
              <Flex align="center" justify="space-between">
                <Text weight="semibold">Table {idx + 1} — {t.parsed.rows.length} rows detected</Text>
                {createdIds[t.key] ? (
                  <Badge tone="positive">Draft created</Badge>
                ) : (
                  <Button
                    text={importing === t.key ? 'Importing…' : 'Import as Draft Standing'}
                    tone="positive"
                    disabled={!canImport || importing === t.key || t.parsed.rows.length === 0}
                    onClick={() => importTable(t.key, t.parsed)}
                  />
                )}
              </Flex>

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
        ))}
      </Stack>
    </Container>
  )
}
