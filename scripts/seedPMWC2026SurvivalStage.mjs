/**
 * scripts/seedPMWC2026SurvivalStage.mjs
 * Full Survival Stage re-seed (12 matches × 16 teams).
 *
 * ⚠️  This script is currently COMPLETE for matches 7-12.
 *      Matches 1-6 only have the known top 4-6 teams from the old fragmented
 *      seed; ranks below those are set to TBD and those matches will be SKIPPED
 *      until the full 16-team results are filled in.
 *
 *      Once matches 1-6 are filled, the script will write all 12 matches.
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/seedPMWC2026SurvivalStage.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWC2026SurvivalStage.mjs
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

// r(rank, teamName, kills, points)
const r = (rank, teamName, kills, points) => ({
  rank,
  teamName,
  kills,
  points,
  placementPoints: points - kills,
})

const tbd = (rank) => ({ rank, teamName: 'TBD', kills: null, points: null, placementPoints: null, tbd: true })

// ─── MATCHES 1–6 (INCOMPLETE — fill in ranks below the known top teams) ──────

const matches1to6 = [
  {
    matchNumber: 1, map: 'Rondo',
    results: [
      r(1, 'Tianba', 13, 23),
      r(2, 'AlUla Club Esports', 6, 16),
      r(3, 'NongShim RedForce', 3, 13),
      r(4, 'eArena', 1, 11),
      r(5, 'Geekay Esports', 0, 10),
      r(6, 'GOAT Team', 0, 10),
      tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
  {
    matchNumber: 2, map: 'Erangel',
    results: [
      r(1, 'Tianba', 12, 22),
      r(2, 'FURIA Esports', 2, 12),
      r(3, 'GOAT Team', 0, 9),
      r(4, 'ULF Esports', 0, 9),
      r(5, 'RRQ RYU', 0, 7),
      r(6, 'eArena', 0, 6),
      tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
  {
    matchNumber: 3, map: 'Erangel',
    results: [
      r(1, 'NongShim RedForce', 8, 18),
      r(2, 'FURIA Esports', 3, 13),
      r(3, 'RRQ RYU', 3, 13),
      r(4, 'Alpha7 Esports', 0, 10),
      r(5, 'GS 721', 0, 10),
      r(6, 'Yangon Galacticos', 0, 9),
      tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
  {
    matchNumber: 4, map: 'Erangel',
    results: [
      r(1, 'Geekay Esports', 10, 20),
      r(2, 'Alpha7 Esports', 5, 15),
      r(3, 'Tianba', 2, 12),
      r(4, 'eArena', 0, 9),
      r(5, 'Kiwoom DRX', 0, 6),
      r(6, 'AG.AL', 0, 5),
      tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
  {
    matchNumber: 5, map: 'Miramar',
    results: [
      r(1, 'DOPENESS', 11, 21),
      r(2, 'Tianba', 4, 14),
      r(3, 'FURIA Esports', 4, 14),
      r(4, 'AlUla Club Esports', 0, 9),
      r(5, 'ULF Esports', 0, 8),
      r(6, 'GS 721', 0, 7),
      tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
  {
    matchNumber: 6, map: 'Miramar',
    results: [
      r(1, 'AG.AL', 8, 18),
      r(2, 'Wolves Esports', 7, 17),
      r(3, 'eArena', 0, 10),
      r(4, 'Yangon Galacticos', 0, 9),
      tbd(5), tbd(6), tbd(7), tbd(8), tbd(9), tbd(10), tbd(11), tbd(12), tbd(13), tbd(14), tbd(15), tbd(16),
    ],
  },
]

// ─── MATCHES 7–12 (COMPLETE) ─────────────────────────────────────────────────

const matches7to12 = [
  {
    matchNumber: 7, map: 'Rondo',
    results: [
      r(1, 'GOAT Team', 15, 25),
      r(2, 'RRQ RYU', 9, 14),
      r(3, 'Yangon Galacticos', 7, 13),
      r(4, 'Alpha7 Esports', 9, 13),
      r(5, 'AlUla Club Esports', 12, 12),
      r(6, 'Wolves Esports', 8, 10),
      r(7, 'AG.AL', 5, 8),
      r(8, 'FURIA Esports', 8, 8),
      r(9, 'GS 721', 5, 5),
      r(10, 'Geekay Esports', 5, 5),
      r(11, 'eArena', 5, 5),
      r(12, 'ULF Esports', 3, 4),
      r(13, 'NongShim RedForce', 4, 4),
      r(14, 'Tianba', 1, 2),
      r(15, 'Kiwoom DRX', 2, 2),
      r(16, 'DOPENESS', 1, 1),
    ],
  },
  {
    matchNumber: 8, map: 'Erangel',
    results: [
      r(1, 'eArena', 7, 17),
      r(2, 'AG.AL', 11, 15),
      r(3, 'Alpha7 Esports', 5, 11),
      r(4, 'Kiwoom DRX', 4, 9),
      r(5, 'GOAT Team', 8, 8),
      r(6, 'AlUla Club Esports', 3, 6),
      r(7, 'DOPENESS', 4, 6),
      r(8, 'NongShim RedForce', 5, 6),
      r(9, 'Geekay Esports', 6, 6),
      r(10, 'Tianba', 5, 5),
      r(11, 'GS 721', 0, 1),
      r(12, 'Yangon Galacticos', 1, 1),
      r(13, 'RRQ RYU', 1, 1),
      r(14, 'ULF Esports', 0, 0),
      r(15, 'FURIA Esports', 0, 0),
      r(16, 'Wolves Esports', 0, 0),
    ],
  },
  {
    matchNumber: 9, map: 'Erangel',
    results: [
      r(1, 'ULF Esports', 12, 22),
      r(2, 'Wolves Esports', 11, 17),
      r(3, 'FURIA Esports', 6, 10),
      r(4, 'Tianba', 6, 9),
      r(5, 'AlUla Club Esports', 3, 8),
      r(6, 'Geekay Esports', 6, 8),
      r(7, 'eArena', 4, 4),
      r(8, 'NongShim RedForce', 4, 4),
      r(9, 'Alpha7 Esports', 1, 2),
      r(10, 'GS 721', 2, 2),
      r(11, 'DOPENESS', 2, 2),
      r(12, 'AG.AL', 2, 2),
      r(13, 'RRQ RYU', 0, 1),
      r(14, 'GOAT Team', 1, 1),
      r(15, 'Yangon Galacticos', 0, 0),
      r(16, 'Kiwoom DRX', 0, 0),
    ],
  },
  {
    matchNumber: 10, map: 'Erangel',
    results: [
      r(1, 'Kiwoom DRX', 8, 18),
      r(2, 'NongShim RedForce', 12, 18),
      r(3, 'FURIA Esports', 8, 12),
      r(4, 'GS 721', 7, 10),
      r(5, 'Tianba', 6, 7),
      r(6, 'ULF Esports', 1, 6),
      r(7, 'Geekay Esports', 3, 5),
      r(8, 'AlUla Club Esports', 4, 4),
      r(9, 'RRQ RYU', 1, 2),
      r(10, 'DOPENESS', 2, 2),
      r(11, 'Alpha7 Esports', 2, 2),
      r(12, 'Wolves Esports', 2, 2),
      r(13, 'AG.AL', 1, 1),
      r(14, 'Yangon Galacticos', 1, 1),
      r(15, 'GOAT Team', 1, 1),
      r(16, 'eArena', 0, 0),
    ],
  },
  {
    matchNumber: 11, map: 'Miramar',
    results: [
      r(1, 'AlUla Club Esports', 13, 23),
      r(2, 'DOPENESS', 9, 15),
      r(3, 'Wolves Esports', 7, 12),
      r(4, 'GOAT Team', 5, 9),
      r(5, 'Tianba', 6, 9),
      r(6, 'RRQ RYU', 5, 7),
      r(7, 'Kiwoom DRX', 4, 5),
      r(8, 'Yangon Galacticos', 3, 4),
      r(9, 'NongShim RedForce', 4, 4),
      r(10, 'ULF Esports', 3, 3),
      r(11, 'eArena', 1, 1),
      r(12, 'GS 721', 1, 1),
      r(13, 'Geekay Esports', 0, 0),
      r(14, 'FURIA Esports', 0, 0),
      r(15, 'Alpha7 Esports', 0, 0),
      r(16, 'AG.AL', 0, 0),
    ],
  },
  {
    matchNumber: 12, map: 'Miramar',
    results: [
      r(1, 'ULF Esports', 7, 17),
      r(2, 'eArena', 5, 11),
      r(3, 'DOPENESS', 4, 9),
      r(4, 'NongShim RedForce', 10, 14),
      r(5, 'AG.AL', 9, 12),
      r(6, 'AlUla Club Esports', 7, 9),
      r(7, 'FURIA Esports', 5, 6),
      r(8, 'Wolves Esports', 0, 1),
      r(9, 'RRQ RYU', 3, 3),
      r(10, 'Yangon Galacticos', 3, 3),
      r(11, 'Kiwoom DRX', 3, 3),
      r(12, 'Tianba', 2, 2),
      r(13, 'GOAT Team', 2, 2),
      r(14, 'Alpha7 Esports', 2, 2),
      r(15, 'Geekay Esports', 0, 0),
      r(16, 'GS 721', 0, 0),
    ],
  },
]

const allMatches = [...matches1to6, ...matches7to12]

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

  for (const match of allMatches) {
    const _id = `match-pmwc-2026-survival-m${match.matchNumber}`

    const hasTBD = match.results.some((row) => row.tbd || row.teamName === 'TBD' || row.kills == null || row.points == null)

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
      stage: 'survival_stage',
      matchNumber: match.matchNumber,
      map: match.map,
      status: 'completed',
      scheduledAt: `2026-08-11T00:00:00Z`,
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

  console.log(`\n${DRY ? '✅ DRY done.' : '✅ Done.'} Seeded ${seeded} / ${allMatches.length} matches (${skipped} skipped).`)
  if (skipped > 0) {
    console.log(`   Fill in the TBD entries for matches 1-6, then re-run to complete the Survival Stage.`)
  }
}

seed().catch((err) => { console.error('❌', err.message); process.exit(1) })
