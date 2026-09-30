/**
 * Shared helpers for turning standings tables written inside tournament
 * articles into `standing` documents — used by both the "Tournament Data
 * Import" Studio tool and the "Tournament" tab on News Posts.
 *
 * Pure functions only (no Sanity client) so they can be reused anywhere.
 */
import { parseStandingsRawText, type ParsedStandingsTable } from './standingsParser'

export const STANDING_STAGE_OPTIONS = [
  { title: 'Group Stage', value: 'group_stage' },
  { title: 'League Stage', value: 'league_stage' },
  { title: 'Survival Stage', value: 'survival_stage' },
  { title: 'Wildcard', value: 'wildcard' },
  { title: 'Playoffs', value: 'playoffs' },
  { title: 'Semi Finals', value: 'semi_finals' },
  { title: 'Grand Finals', value: 'grand_finals' },
  { title: 'Finals', value: 'finals' },
  { title: 'Overall', value: 'overall' },
]

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  STANDING_STAGE_OPTIONS.map((o) => [o.value, o.title]),
)

export interface StandingContext {
  stage?: string
  week?: number
  day?: number
  group?: string
  afterMatch?: number
  matchesPlayed?: number
  teamsCount?: number
}

/** "League Stage · Week 2 · Day 3 · Group A" */
export function describeContext(ctx: StandingContext): string {
  return [
    ctx.stage ? STAGE_LABELS[ctx.stage] ?? ctx.stage : null,
    ctx.week ? `Week ${ctx.week}` : null,
    ctx.day ? `Day ${ctx.day}` : null,
    ctx.group || null,
    ctx.afterMatch ? `After Match ${ctx.afterMatch}` : null,
  ].filter(Boolean).join(' · ')
}

const STAGE_PATTERNS: [RegExp, string][] = [
  [/grand\s*finals?/i, 'grand_finals'],
  [/semi[\s-]*finals?/i, 'semi_finals'],
  [/survival/i, 'survival_stage'],
  [/wild\s*card/i, 'wildcard'],
  [/play[\s-]*offs?/i, 'playoffs'],
  [/league\s*stage|\bleague\b/i, 'league_stage'],
  [/group\s*stage/i, 'group_stage'],
  [/\bfinals?\b/i, 'finals'],
  // "Overall" is intentionally not detected — "Overall Standings" in a
  // heading means cumulative totals, not the "Overall" stage.
]

/** Best-effort detection of stage / week / day / group / match count from free text. */
export function detectContext(text: string): StandingContext {
  const t = text || ''
  const ctx: StandingContext = {}
  const stage = STAGE_PATTERNS.find(([re]) => re.test(t))
  if (stage) ctx.stage = stage[1]
  const week = t.match(/\bweek\s*[-#:]?\s*(\d{1,2})\b/i)
  if (week) ctx.week = Number(week[1])
  const day = t.match(/\bday\s*[-#:]?\s*(\d{1,2})\b/i)
  if (day) ctx.day = Number(day[1])
  // "Group A", "Group 1", "Grp B" — ignore "Group Stage"
  const group = t.match(/\b(?:group|grp)\s+(?!stage\b)([A-Z]|\d{1,2})\b/i)
  if (group) ctx.group = `Group ${group[1].toUpperCase()}`
  const matches = t.match(/\b(\d{1,2})\s*matches\b/i) || t.match(/\bmatch(?:es)?\s*\d+\s*[-–—to]+\s*(\d+)\b/i)
  if (matches) ctx.matchesPlayed = Number(matches[1])
  const after = t.match(/\bafter\s*match\s*(\d{1,2})\b/i)
  if (after) ctx.afterMatch = Number(after[1])
  const teams = t.match(/\b(\d{1,3})\s*teams\b/i)
  if (teams) ctx.teamsCount = Number(teams[1])
  return ctx
}

/** Merge contexts left→right; later values only fill gaps. */
export function mergeContext(...parts: (StandingContext | undefined)[]): StandingContext {
  const out: StandingContext = {}
  for (const p of parts) {
    if (!p) continue
    for (const [k, v] of Object.entries(p) as [keyof StandingContext, any][]) {
      if (v !== undefined && v !== null && v !== '' && (out as any)[k] === undefined) (out as any)[k] = v
    }
  }
  return out
}

export interface ArticleTable {
  key: string
  title?: string
  heading?: string
  rawText: string
  parsed: ParsedStandingsTable
  detected: StandingContext
}

const blockText = (b: any) => (b?.children || []).map((c: any) => c?.text || '').join('')

/**
 * Pulls every `standingsTable` out of a Portable Text array, together with
 * the nearest heading above it (e.g. "## Group B — Day 2 Standings"), and
 * detects group / day / week / stage from table title + heading.
 */
export function extractArticleTables(content: any[] | undefined | null): ArticleTable[] {
  const out: ArticleTable[] = []
  let heading = ''
  for (const b of content || []) {
    if (b?._type === 'block' && /^h[1-6]$/.test(b.style || '')) {
      heading = blockText(b)
      continue
    }
    if (b?._type !== 'standingsTable' || !b.rawText) continue
    const parsed = parseStandingsRawText(b.rawText)
    const detected = mergeContext(detectContext(b.title || ''), detectContext(heading))
    if (!detected.teamsCount && parsed.rows.length) detected.teamsCount = parsed.rows.length
    out.push({ key: b._key, title: b.title, heading, rawText: b.rawText, parsed, detected })
  }
  return out
}

export interface TeamLookup { _id: string; name: string; shortName?: string | null }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

export function buildTeamIndex(teams: TeamLookup[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const t of teams) {
    if (t.name) m.set(norm(t.name), t._id)
    if (t.shortName) m.set(norm(t.shortName), t._id)
  }
  return m
}

export interface EditionRef {
  _id: string
  year: string
  name?: string | null
  tournamentId: string
  tournamentName: string
}

export function editionLabel(e: EditionRef): string {
  return e.name || `${e.tournamentName} ${e.year}`
}

/**
 * Builds a `standing` document (always status "draft" — the manual
 * approval gate). `teamIndex` optionally links rows to Team docs by name.
 */
export function buildStandingDoc(opts: {
  edition: EditionRef
  ctx: StandingContext
  parsed: ParsedStandingsTable
  keyFn: () => string
  teamIndex?: Map<string, string>
  sourceArticleId?: string
}) {
  const { edition, ctx, parsed, keyFn, teamIndex, sourceArticleId } = opts
  const desc = describeContext(ctx)
  return {
    _type: 'standing',
    title: `${editionLabel(edition)}${desc ? ` — ${desc}` : ' — Standings'}`,
    tournament: { _type: 'reference', _ref: edition.tournamentId },
    edition: { _type: 'reference', _ref: edition._id },
    stage: ctx.stage || 'overall',
    ...(ctx.week ? { week: ctx.week } : {}),
    ...(ctx.group ? { group: ctx.group } : {}),
    ...(ctx.day ? { day: ctx.day } : {}),
    ...(ctx.afterMatch ? { afterMatch: ctx.afterMatch } : {}),
    ...(ctx.matchesPlayed ? { matchesPlayed: ctx.matchesPlayed } : {}),
    teamsCount: ctx.teamsCount || parsed.rows.length,
    ...(sourceArticleId ? { sourceArticle: { _type: 'reference', _ref: sourceArticleId.replace(/^drafts\./, ''), _weak: true } } : {}),
    // Never publish from an import — an editor approves it in Studio.
    status: 'draft',
    lastUpdated: new Date().toISOString(),
    rows: parsed.rows.map((r) => {
      const ref = teamIndex?.get(norm(r.teamName))
      return {
        _key: keyFn(),
        _type: 'standingRow',
        rank: r.rank,
        ...(ref ? { team: { _type: 'reference', _ref: ref } } : {}),
        teamName: r.teamName,
        matchesPlayed: r.matchesPlayed ?? 0,
        wins: r.wins ?? 0,
        losses: r.losses ?? 0,
        wwcd: r.wwcd ?? 0,
        placementPoints: r.placementPoints ?? 0,
        kills: r.kills ?? 0,
        points: r.points,
      }
    }),
  }
}
