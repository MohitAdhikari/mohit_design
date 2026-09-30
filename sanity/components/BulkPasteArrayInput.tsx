'use client'

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Badge, Box, Button, Card, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { insert, set, useClient, type ArrayOfObjectsInputProps } from 'sanity'
import { nanoid } from 'nanoid'

/**
 * Generic "paste rows" helper for any array-of-objects field — the same idea
 * as the code-entries bulk paste, but configurable per field. Paste one row
 * per line; columns can be separated by TAB (copy from Sheets/Excel/
 * Liquipedia), `|` (markdown / AI tables) or `,`. An optional header row is
 * auto-detected and used to map columns in any order.
 *
 * Team columns are matched against existing Team docs by name / short name
 * (case- and punctuation-insensitive); unmatched names go into the field's
 * text fallback when it has one, and are always reported.
 */

export type ColumnKind = 'string' | 'number' | 'money' | 'ordinal' | 'datetime' | 'url' | 'team'

export interface BulkColumn {
  key: string
  label: string
  kind?: ColumnKind
  aliases?: RegExp[]
  /** team columns only: string field to fill when no Team doc matches */
  fallbackKey?: string
}

export interface BulkPasteConfig {
  title: string
  help?: string
  itemType: string
  columns: BulkColumn[]
  placeholder?: string
  /** static fields merged into every created item */
  defaults?: Record<string, unknown>
  /** array of plain references (e.g. `teams[]`) — uses the first team column */
  referenceArray?: boolean
}

interface TeamDoc { _id: string; name: string; shortName?: string }
interface TeamValue { ref?: string; name: string }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function splitLine(line: string): string[] {
  let cells: string[]
  if (line.includes('\t')) cells = line.split('\t')
  else if (line.includes('|')) cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|')
  // Commas only when they can't be digit grouping (₹4,00,000 / 1,500).
  else if (!/\d,\d/.test(line)) cells = line.split(',')
  else cells = [line]
  return cells.map((c) => c.trim().replace(/^\*\*|\*\*$/g, ''))
}

export function parseMoney(raw: string): number | undefined {
  const s = raw.toLowerCase().replace(/,/g, '')
  const num = parseFloat(s.replace(/[^0-9.-]/g, ''))
  if (Number.isNaN(num)) return undefined
  if (/\b(cr|crore)s?\b/.test(s)) return Math.round(num * 1e7)
  if (/\b(l|lakh|lac)s?\b/.test(s)) return Math.round(num * 1e5)
  if (/\bm\b|million/.test(s)) return Math.round(num * 1e6)
  if (/\bk\b/.test(s)) return Math.round(num * 1e3)
  return num
}

function ordinal(raw: string): string {
  const t = raw.trim()
  if (!/^\d+$/.test(t)) return t
  const n = Number(t)
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th'
  return `${n}${suffix}`
}

function headerMatches(cell: string, col: BulkColumn): boolean {
  const c = cell.trim()
  if (!c) return false
  if (col.aliases?.some((re) => re.test(c))) return true
  return norm(c) === norm(col.label) || norm(c) === norm(col.key)
}

export function createBulkPasteInput(config: BulkPasteConfig): ComponentType<ArrayOfObjectsInputProps> {
  const hasTeam = config.columns.some((c) => c.kind === 'team')

  function BulkPasteArrayInput(props: ArrayOfObjectsInputProps) {
    const { value = [], onChange, renderDefault } = props
    const client = useClient({ apiVersion: '2024-04-28' })
    const [teams, setTeams] = useState<TeamDoc[]>([])
    const [rawText, setRawText] = useState('')
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState<{ added: number; replaced: boolean; unmatched: string[] } | null>(null)

    useEffect(() => {
      if (!hasTeam || !open) return
      client.fetch<TeamDoc[]>(`*[_type == "team" && defined(name)]{ _id, name, shortName }`).then(setTeams).catch(() => {})
    }, [client, open])

    const teamIndex = useMemo(() => {
      const m = new Map<string, string>()
      teams.forEach((t) => {
        m.set(norm(t.name), t._id)
        if (t.shortName) m.set(norm(t.shortName), t._id)
      })
      return m
    }, [teams])

    const parsed = useMemo(() => {
      const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
      const rows = lines.map(splitLine).filter((cells) => !cells.every((c) => /^:?-*:?$/.test(c)))
      if (rows.length === 0) return { order: config.columns, rows: [] as string[][] }

      // Header row? → map columns by header text; otherwise use config order.
      const first = rows[0]
      const hits = first.map((cell) => config.columns.find((col) => headerMatches(cell, col)) ?? null)
      const isHeader = hits.filter(Boolean).length >= Math.min(2, config.columns.length) &&
        !first.every((c) => /^[\d.,₹$€£\s-]+$/.test(c))
      if (isHeader) {
        return { order: hits as (BulkColumn | null)[], rows: rows.slice(1) }
      }
      return { order: config.columns as (BulkColumn | null)[], rows }
    }, [rawText])

    const build = useCallback(() => {
      const unmatched: string[] = []
      const items: any[] = []
      for (const cells of parsed.rows) {
        const vals: Record<string, unknown> = {}
        parsed.order.forEach((col, idx) => {
          const cell = cells[idx]
          if (!col || cell == null || cell === '' || cell === '—' || cell === '-') return
          switch (col.kind) {
            case 'number': {
              const n = parseFloat(cell.replace(/[^0-9.-]/g, ''))
              if (!Number.isNaN(n)) vals[col.key] = n
              break
            }
            case 'money': {
              const n = parseMoney(cell)
              if (n !== undefined) vals[col.key] = n
              break
            }
            case 'ordinal':
              vals[col.key] = ordinal(cell)
              break
            case 'datetime': {
              const d = new Date(cell)
              if (!Number.isNaN(d.getTime())) vals[col.key] = d.toISOString()
              break
            }
            case 'team': {
              const ref = teamIndex.get(norm(cell))
              vals[col.key] = { ref, name: cell } satisfies TeamValue
              break
            }
            default:
              vals[col.key] = cell
          }
        })

        if (config.referenceArray) {
          const teamCol = config.columns.find((c) => c.kind === 'team')!
          const t = vals[teamCol.key] as TeamValue | undefined
          if (!t) continue
          if (!t.ref) { unmatched.push(t.name); continue }
          items.push({ _type: 'reference', _ref: t.ref, _key: nanoid() })
          continue
        }

        const item: Record<string, unknown> = { _type: config.itemType, _key: nanoid(), ...(config.defaults || {}) }
        let hasAny = false
        for (const col of config.columns) {
          const v = vals[col.key]
          if (v === undefined) continue
          hasAny = true
          if (col.kind === 'team') {
            const t = v as TeamValue
            if (t.ref) item[col.key] = { _type: 'reference', _ref: t.ref }
            else unmatched.push(t.name)
            if (col.fallbackKey) item[col.fallbackKey] = t.name
          } else {
            item[col.key] = v
          }
        }
        if (hasAny) items.push(item)
      }
      return { items, unmatched }
    }, [parsed, teamIndex])

    const apply = useCallback((mode: 'append' | 'replace') => {
      const { items, unmatched } = build()
      if (items.length === 0) {
        setResult({ added: 0, replaced: false, unmatched })
        return
      }
      if (mode === 'replace' || (value || []).length === 0) onChange(set(items))
      else onChange(insert(items, 'after', [-1]))
      setResult({ added: items.length, replaced: mode === 'replace', unmatched })
      setRawText('')
    }, [build, onChange, value])

    const previewRows = parsed.rows.slice(0, 20)
    const shownCols = parsed.order.map((c, i) => ({ c, i })).filter((x) => x.c)

    return (
      <Stack space={3}>
        <Card padding={3} radius={2} border tone="primary">
          <Stack space={3}>
            <Flex align="center" justify="space-between" gap={2}>
              <Text size={1} weight="semibold">📋 {config.title}</Text>
              <Button
                text={open ? 'Close paste' : 'Paste rows'}
                mode="ghost"
                fontSize={1}
                padding={2}
                onClick={() => { setOpen((o) => !o); setResult(null) }}
              />
            </Flex>
            {open && (
              <>
                <Text size={1} muted>
                  One row per line. Columns (TAB, <code>|</code> or <code>,</code> separated):{' '}
                  <code>{config.columns.map((c) => c.label).join(' | ')}</code>. A header row is optional
                  and lets you paste columns in any order.{config.help ? ` ${config.help}` : ''}
                </Text>
                <TextArea
                  rows={8}
                  value={rawText}
                  placeholder={config.placeholder}
                  onChange={(e) => { setRawText(e.currentTarget.value); setResult(null) }}
                  style={{ fontFamily: 'monospace' }}
                />
                {previewRows.length > 0 && (
                  <Box style={{ overflowX: 'auto', maxHeight: 260, overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {shownCols.map(({ c, i }) => (
                            <th key={i} style={{ textAlign: 'left', padding: '3px 6px', borderBottom: '1px solid #444' }}>{c!.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((cells, r) => (
                          <tr key={r}>
                            {shownCols.map(({ c, i }) => {
                              const cell = cells[i] ?? ''
                              const unmatchedTeam = c!.kind === 'team' && cell && teams.length > 0 && !teamIndex.get(norm(cell))
                              return (
                                <td key={i} style={{ padding: '3px 6px', color: unmatchedTeam ? '#f59e0b' : undefined }}>
                                  {cell || '—'}{unmatchedTeam ? ' ⚠' : ''}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsed.rows.length > previewRows.length && (
                      <Text size={0} muted>…and {parsed.rows.length - previewRows.length} more rows</Text>
                    )}
                  </Box>
                )}
                <Flex align="center" gap={2} wrap="wrap">
                  <Button
                    text={`Add ${parsed.rows.length || ''} rows`.replace('  ', ' ')}
                    tone="positive"
                    disabled={parsed.rows.length === 0}
                    onClick={() => apply('append')}
                  />
                  <Button
                    text="Replace all rows"
                    tone="caution"
                    mode="ghost"
                    disabled={parsed.rows.length === 0}
                    onClick={() => {
                      if (window.confirm(`Replace all ${(value || []).length} existing rows with ${parsed.rows.length} pasted rows?`)) apply('replace')
                    }}
                  />
                  {result && (
                    <Badge tone={result.added > 0 ? 'positive' : 'caution'}>
                      {result.added > 0 ? `${result.added} row(s) ${result.replaced ? 'set' : 'added'}` : 'Nothing added'}
                    </Badge>
                  )}
                </Flex>
                {result && result.unmatched.length > 0 && (
                  <Card padding={2} radius={2} tone="caution" border>
                    <Text size={1}>
                      No Team doc found for: {Array.from(new Set(result.unmatched)).join(', ')}.
                      {config.referenceArray ? ' These were skipped — create the teams first.' : ' Name saved as text; link a Team doc later if needed.'}
                    </Text>
                  </Card>
                )}
              </>
            )}
          </Stack>
        </Card>
        <Box>{renderDefault(props)}</Box>
      </Stack>
    )
  }

  return BulkPasteArrayInput
}

// ── Ready-made inputs for the tournament schemas ───────────────────────────

const TEAM_ALIASES = [/^team(\s*name)?$/i, /^squad$/i, /^org(anis|aniz)ation$/i, /^participant$/i]

export const PrizePlacementsPasteInput = createBulkPasteInput({
  title: 'Paste prize placements (1st → 16th)',
  itemType: 'prizePlacement',
  columns: [
    { key: 'placement', label: 'Place', kind: 'ordinal', aliases: [/^#$/, /^(place|placement|rank|pos(ition)?)$/i] },
    { key: 'prize', label: 'Prize', kind: 'money', aliases: [/^prize(\s*(money|amount))?$/i, /^amount$/i, /^(inr|usd)$/i] },
    { key: 'team', label: 'Team', kind: 'team', fallbackKey: 'teamName', aliases: TEAM_ALIASES },
  ],
  help: 'Prize accepts ₹1,00,00,000 / 1 Cr / 25 L / $50K. A bare number in Place becomes 1st, 2nd…',
  placeholder: '1\t₹1,00,00,000\tTeam Soul\n2\t₹50,00,000\tGodLike Esports\n3 | 25 L | Team XSpark',
})

export const PrizeStagesPasteInput = createBulkPasteInput({
  title: 'Paste stage prize pools',
  itemType: 'prizeStage',
  columns: [
    { key: 'stageName', label: 'Stage', aliases: [/^stage(\s*name)?$/i] },
    { key: 'stagePool', label: 'Pool', kind: 'money', aliases: [/^(pool|prize(\s*pool)?|amount)$/i] },
    { key: 'stageNotes', label: 'Notes', aliases: [/^notes?$/i] },
  ],
  placeholder: 'League Stage | 50 L\nGrand Finals | 1.5 Cr',
})

export const EditionStagesPasteInput = createBulkPasteInput({
  title: 'Paste stages',
  itemType: 'stage',
  columns: [
    { key: 'name', label: 'Stage', aliases: [/^(stage|name)$/i] },
    { key: 'startDate', label: 'Start', kind: 'datetime', aliases: [/^start(\s*date)?$/i] },
    { key: 'endDate', label: 'End', kind: 'datetime', aliases: [/^end(\s*date)?$/i] },
    { key: 'totalTeams', label: 'Teams', kind: 'number', aliases: [/^(teams|total\s*teams)$/i] },
    { key: 'teamsAdvancing', label: 'Advancing', kind: 'number', aliases: [/^(advancing|qualify|qualified)$/i] },
    { key: 'format', label: 'Format', aliases: [/^format$/i] },
    { key: 'venue', label: 'Venue', aliases: [/^venue$/i] },
  ],
  defaults: { status: 'upcoming' },
  placeholder: 'League Stage | 2026-10-01 | 2026-10-20 | 64 | 24\nGrand Finals | 2026-11-01 | 2026-11-03 | 16 | 0',
})

export const ParticipantsPasteInput = createBulkPasteInput({
  title: 'Paste participating teams',
  itemType: 'editionParticipant',
  columns: [
    { key: 'team', label: 'Team', kind: 'team', fallbackKey: 'teamName', aliases: TEAM_ALIASES },
    { key: 'group', label: 'Group', aliases: [/^(group|grp)$/i] },
    { key: 'seed', label: 'Seed', kind: 'number', aliases: [/^seed$/i] },
    { key: 'inviteSource', label: 'Invite Source', aliases: [/^(invite|source|invite\s*source|qualified\s*via)$/i] },
  ],
  defaults: { status: 'invited' },
  placeholder: 'Team Soul | A | 1 | Direct invite\nGodLike Esports | B | 2\nTeam XSpark',
})

export const TeamRefsPasteInput = createBulkPasteInput({
  title: 'Paste team names',
  itemType: 'reference',
  referenceArray: true,
  columns: [{ key: 'team', label: 'Team', kind: 'team', aliases: TEAM_ALIASES }],
  placeholder: 'Team Soul\nGodLike Esports\nTeam XSpark',
})

export const StandingRowsPasteInput = createBulkPasteInput({
  title: 'Paste standings table',
  itemType: 'standingRow',
  columns: [
    { key: 'rank', label: 'Rank', kind: 'number', aliases: [/^#$/, /^rank$/i, /^pos(ition)?$/i, /^place$/i] },
    { key: 'team', label: 'Team', kind: 'team', fallbackKey: 'teamName', aliases: TEAM_ALIASES },
    { key: 'matchesPlayed', label: 'MP', kind: 'number', aliases: [/^mp$/i, /^matches(\s*played)?$/i] },
    { key: 'wwcd', label: 'WWCD', kind: 'number', aliases: [/^wwcd$/i, /^chicken\s*dinners?$/i, /^booyah$/i] },
    { key: 'placementPoints', label: 'Place Pts', kind: 'number', aliases: [/^pp$/i, /^place(ment)?\s*(pts|points)?$/i, /^pos(ition)?\s*(pts|points)$/i] },
    { key: 'kills', label: 'Kills', kind: 'number', aliases: [/^kills?$/i, /^elims?$/i, /^eliminations?$/i, /^finishes$/i, /^kill\s*(pts|points)$/i] },
    { key: 'points', label: 'Total', kind: 'number', aliases: [/^total(\s*(pts|points))?$/i, /^points?$/i, /^pts$/i] },
    { key: 'prize', label: 'Prize', aliases: [/^prize(\s*money)?$/i] },
  ],
  placeholder: 'Rank | Team | MP | WWCD | Place Pts | Kills | Total\n1 | Team Soul | 18 | 3 | 72 | 95 | 167\n2 | GodLike Esports | 18 | 2 | 60 | 88 | 148',
})
