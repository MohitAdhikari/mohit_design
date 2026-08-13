/**
 * scripts/seedPMWC2026GFDay1.mjs
 * PMWC 2026 Grand Finals — Day 1 seed template.
 *
 * GF Day 1 is Aug 14 (tomorrow). Fill in the TEAMS list and per-match
 * results, then run. Matches still containing TBD entries are skipped.
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/seedPMWC2026GFDay1.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWC2026GFDay1.mjs
 *
 * ⚠️ PAUSE your Sanity webhook before running to avoid ISR writes.
 *    Pages revalidate naturally on their 60s/300s cycle.
 */

import { createClient } from '@sanity/client'
import { nanoid } from 'nanoid'

const DRY = process.env.DRY !== 'false'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const TOURNAMENT_SLUG = 'pmwc-2026'

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function buildTeamMap() {
  const teams = await client.fetch(`*[_type == "team"]{ _id, "slug": slug.current, name }`)
  const bySlug = {}
  const byName = {}
  for (const t of teams) {
    if (t.slug) bySlug[t.slug] = t._id
    if (t.name) byName[normalizeName(t.name)] = t._id
  }
  return { bySlug, byName }
}

function resolveTeam(map, name) {
  const { bySlug, byName } = map
  if (byName[normalizeName(name)]) return byName[normalizeName(name)]
  const slug = slugify(name)
  if (bySlug[slug]) return bySlug[slug]
  return null
}

async function save(doc) {
  if (DRY) {
    console.log(`[DRY] ${doc._id}`)
    return
  }
  await client.createOrReplace(doc)
  console.log(`[WROTE] ${doc._id}`)
}

// r(rank, teamName, placementPoints, kills)
// total points = placementPoints + kills
const r = (rank, teamName, placementPoints, kills) => ({
  rank,
  teamName,
  placementPoints,
  kills,
  points: placementPoints != null && kills != null ? placementPoints + kills : null,
})

// ─── GF DAY 1 DATA ───────────────────────────────────────────────────────────
// Update this list with the 16 qualified Grand Finals teams.
// Then fill in each match's results below.

const TEAMS = [
  'TBD', 'TBD', 'TBD', 'TBD',
  'TBD', 'TBD', 'TBD', 'TBD',
  'TBD', 'TBD', 'TBD', 'TBD',
  'TBD', 'TBD', 'TBD', 'TBD',
]

// Place the 16 teams in each match in placement order.
// Use r(rank, teamName, placementPoints, kills).
const matches = [
  { matchNumber: 1, map: 'Rondo', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
  { matchNumber: 2, map: 'Erangel', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
  { matchNumber: 3, map: 'Erangel', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
  { matchNumber: 4, map: 'Erangel', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
  { matchNumber: 5, map: 'Miramar', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
  { matchNumber: 6, map: 'Miramar', results: [
    r(1, TEAMS[0], null, null), r(2, TEAMS[1], null, null), r(3, TEAMS[2], null, null), r(4, TEAMS[3], null, null),
    r(5, TEAMS[4], null, null), r(6, TEAMS[5], null, null), r(7, TEAMS[6], null, null), r(8, TEAMS[7], null, null),
    r(9, TEAMS[8], null, null), r(10, TEAMS[9], null, null), r(11, TEAMS[10], null, null), r(12, TEAMS[11], null, null),
    r(13, TEAMS[12], null, null), r(14, TEAMS[13], null, null), r(15, TEAMS[14], null, null), r(16, TEAMS[15], null, null),
  ]},
]

// ─── seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const tournament = await client.fetch(
    `*[_type == "tournament" && slug.current == $slug][0]{ _id }`,
    { slug: TOURNAMENT_SLUG }
  )
  if (!tournament) throw new Error(`Tournament slug "${TOURNAMENT_SLUG}" not found`)

  const edition = await client.fetch(
    `*[_type == "tournamentEdition" && tournament._ref == $tournamentId && year == "2026"][0]{ _id }`,
    { tournamentId: tournament._id }
  )
  if (!edition) throw new Error('PMWC 2026 edition not found')

  const teamMap = await buildTeamMap()
  const unresolvedTeams = new Set()

  let seeded = 0
  let skipped = 0

  for (const match of matches) {
    const _id = `match-pmwc-2026-grand-finals-day1-m${match.matchNumber}`

    const hasTBD = match.results.some(
      (row) =>
        row.teamName === 'TBD' ||
        row.placementPoints == null ||
        row.kills == null
    )

    if (hasTBD) {
      console.log(`[SKIP] ${_id} — still has TBD results`)
      skipped++
      continue
    }

    const participants = match.results.map((row) => {
      const teamId = resolveTeam(teamMap, row.teamName)
      if (!teamId) unresolvedTeams.add(row.teamName)
      return {
        _key: nanoid(),
        _type: 'matchParticipant',
        ...(teamId
          ? { team: { _type: 'reference', _ref: teamId } }
          : { teamName: row.teamName }),
        placement: row.rank,
        placementPoints: row.placementPoints,
        kills: row.kills,
        points: row.points,
      }
    })

    const winnerTeamName = match.results[0].teamName
    const winnerId = resolveTeam(teamMap, winnerTeamName)

    const doc = {
      _id,
      _type: 'match',
      tournament: { _type: 'reference', _ref: tournament._id },
      edition: { _type: 'reference', _ref: edition._id },
      matchFormat: 'battle_royale',
      stage: 'grand_finals',
      group: 'Grand Finals Day 1',
      matchNumber: match.matchNumber,
      map: match.map,
      status: 'completed',
      scheduledAt: `2026-08-14T00:00:00Z`,
      participants,
      ...(winnerId ? { winner: { _type: 'reference', _ref: winnerId } } : {}),
    }

    await save(doc)
    seeded++
  }

  if (unresolvedTeams.size > 0) {
    console.log(`\n⚠️ ${unresolvedTeams.size} team(s) not found as references; seeded as teamName strings:`)
    console.log([...unresolvedTeams].map((t) => `  - ${t}`).join('\n'))
  }

  console.log(`\n${DRY ? '✅ DRY done.' : '✅ Done.'} Seeded ${seeded} / ${matches.length} matches (${skipped} skipped).`)
}

seed().catch((err) => { console.error('❌', err.message); process.exit(1) })
