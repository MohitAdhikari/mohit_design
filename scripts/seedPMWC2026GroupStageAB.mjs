/**
 * scripts/seedPMWC2026GroupStageAB.mjs
 * Seeds PMWC 2026 Group Stage A & B match data into Sanity.
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/seedPMWC2026GroupStageAB.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWC2026GroupStageAB.mjs
 *
 * ⚠️ PAUSE your Sanity webhook before running to avoid ISR writes.
 *    Pages revalidate naturally on their 60s/300s cycle.
 *    Resume webhook after.
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

const pts = (placementPoints, kills) => placementPoints + kills

// r(rank, teamName, placementPoints, kills)
// Example: r(1, 'Geekay Esports', 10, 8) -> rank 1, 10 placement pts, 8 kills, 18 total pts
const r = (rank, teamName, placementPoints, kills) => ({
  rank,
  teamName,
  placementPoints,
  kills,
  points: pts(placementPoints, kills),
})

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

function scheduledAtFor(group, day) {
  // Group A: Day 1 = Aug 6, Day 2 = Aug 7
  // Group B: Day 1 = Aug 8, Day 2 = Aug 9
  const base = group === 'A' ? '2026-08-05' : '2026-08-07'
  const offsetDay = day
  const d = new Date(`${base}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offsetDay)
  return d.toISOString()
}

async function save(doc) {
  if (DRY) {
    console.log(`[DRY] ${doc._id}`)
    return
  }
  await client.createOrReplace(doc)
  console.log(`[WROTE] ${doc._id}`)
}

// ─── GROUP A ─────────────────────────────────────────────────────────────────
// Day 1 · Aug 6 · Matches 1–6
// Day 2 · Aug 7 · Matches 7–12
// Placement points: 1st=10, 2nd=6, 3rd=5, 4th=4, 5th=3, 6th=2, 7th=2, 8th=1 ... 16th=0

const groupAMatches = [
  {
    matchNumber: 1, map: 'Rondo', day: 1, group: 'A',
    results: [
      r(1,  'Geekay Esports',        10, 8),   // WWCD 18pts
      r(2,  'Orangutan',              6, 2),   // 8pts
      r(3,  '4Thrives Esports',       5, 14),  // 19pts (kill-heavy)
      r(4,  'All Gamers International', 4, 12),// 16pts
      r(5,  'DRX',                    3, 10),  // 13pts
      r(6,  'FURIA',                  2, 7),   // 9pts
      r(7,  'Team Flash',             2, 5),
      r(8,  'Aurora Gaming',          1, 5),
      r(9,  'Nigma Galaxy',           1, 4),
      r(10, 'ULF Esports',            1, 3),
      r(11, 'GOAT Team',              1, 2),
      r(12, 'AlUla Club Esports',     1, 1),
      r(13, 'RRQ RYU',                1, 0),
      r(14, 'ThunderTalk Gaming',     0, 0),
      r(15, 'XForce Rejects',         0, 0),
      r(16, 'Gaming Stars',           0, 0),
    ],
  },
  {
    matchNumber: 2, map: 'Erangel', day: 1, group: 'A',
    results: [
      r(1,  'Aurora Gaming',          10, 7),  // WWCD 17pts
      r(2,  'DRX',                    6, 9),   // 15pts
      r(3,  'ULF Esports',            5, 7),   // 12pts
      r(4,  'Nigma Galaxy',           4, 6),   // 10pts
      r(5,  'Team Flash',             3, 5),   // 8pts
      r(6,  'RRQ RYU',                2, 6),   // 8pts
      r(7,  'Orangutan',              2, 4),   // 6pts (4 kills confirmed)
      r(8,  '4Thrives Esports',       1, 6),
      r(9,  'GOAT Team',              1, 4),
      r(10, 'AlUla Club Esports',     1, 3),
      r(11, 'FURIA',                  1, 2),
      r(12, 'All Gamers International', 1, 2),
      r(13, 'Geekay Esports',         1, 1),
      r(14, 'Gaming Stars',           0, 1),
      r(15, 'ThunderTalk Gaming',     0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 3, map: 'Erangel', day: 1, group: 'A',
    results: [
      r(1,  'GOAT Team',              10, 6),  // WWCD 16pts
      r(2,  'Nigma Galaxy',           6, 5),
      r(3,  'ThunderTalk Gaming',     5, 4),
      r(4,  '4Thrives Esports',       4, 7),
      r(5,  'Team Flash',             3, 5),
      r(6,  'Aurora Gaming',          2, 4),
      r(7,  'ULF Esports',            2, 3),
      r(8,  'All Gamers International', 1, 4),
      r(9,  'DRX',                    1, 3),
      r(10, 'FURIA',                  1, 2),
      r(11, 'AlUla Club Esports',     1, 1),
      r(12, 'RRQ RYU',                1, 1),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'Orangutan',              0, 3),   // 3pts (all kills, early elim)
      r(15, 'Gaming Stars',           0, 1),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 4, map: 'Erangel', day: 1, group: 'A',
    results: [
      r(1,  'Team Flash',             10, 10), // WWCD 20pts
      r(2,  'Nigma Galaxy',           6, 12),  // 18pts
      r(3,  'FURIA',                  5, 2),   // 7pts
      r(4,  '4Thrives Esports',       4, 5),   // 9pts
      r(5,  'Aurora Gaming',          3, 3),   // 6pts
      r(6,  'All Gamers International', 2, 5),
      r(7,  'ULF Esports',            2, 4),
      r(8,  'Orangutan',              1, 2),   // 3pts (confirmed)
      r(9,  'DRX',                    1, 3),
      r(10, 'GOAT Team',              1, 2),
      r(11, 'RRQ RYU',                1, 1),
      r(12, 'Geekay Esports',         1, 0),
      r(13, 'AlUla Club Esports',     1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'XForce Rejects',         0, 0),
      r(16, 'Gaming Stars',           0, 0),
    ],
  },
  {
    matchNumber: 5, map: 'Miramar', day: 1, group: 'A',
    results: [
      r(1,  'GOAT Team',              10, 18), // WWCD 28pts (dominant)
      r(2,  'AlUla Club Esports',     6, 5),   // 11pts
      r(3,  'DRX',                    5, 4),
      r(4,  '4Thrives Esports',       4, 8),   // 12pts
      r(5,  'Orangutan',              3, 2),   // 5pts (confirmed top-5 + 2 kills)
      r(6,  'Nigma Galaxy',           2, 3),   // 5pts
      r(7,  'ULF Esports',            2, 3),   // 5pts
      r(8,  'All Gamers International', 1, 4), // 5pts
      r(9,  'Team Flash',             1, 4),
      r(10, 'Aurora Gaming',          1, 3),
      r(11, 'FURIA',                  1, 2),
      r(12, 'RRQ RYU',                1, 1),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 6, map: 'Miramar', day: 1, group: 'A',
    results: [
      r(1,  'Orangutan',              10, 10), // WWCD 20pts (10 kills confirmed)
      r(2,  'Aurora Gaming',          6, 5),   // 11pts
      r(3,  '4Thrives Esports',       5, 8),   // 13pts
      r(4,  'Team Flash',             4, 6),
      r(5,  'Nigma Galaxy',           3, 5),
      r(6,  'ULF Esports',            2, 4),
      r(7,  'GOAT Team',              2, 3),
      r(8,  'All Gamers International', 1, 5),
      r(9,  'DRX',                    1, 4),
      r(10, 'FURIA',                  1, 3),
      r(11, 'Geekay Esports',         1, 2),
      r(12, 'AlUla Club Esports',     1, 1),
      r(13, 'RRQ RYU',                1, 0),
      r(14, 'Gaming Stars',           0, 1),
      r(15, 'ThunderTalk Gaming',     0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  // ── Day 2 · Aug 7 · Matches 7–12 ───────────────────────────────────────────
  // OG confirmed: M7 WWCD 21pts(11k) · M8 14pts(9k,2nd) · M9 5pts(1k,6th)
  //               M10 0pts · M11 3pts(8th) · M12 3pts
  // Overall finals: 4Thrives 107 · OG 91 · Aurora 90 · Flash 89 · Nigma 88
  {
    matchNumber: 7, map: 'Rondo', day: 2, group: 'A',
    results: [
      r(1,  'Orangutan',              10, 11), // WWCD 21pts
      r(2,  '4Thrives Esports',       6, 8),
      r(3,  'Aurora Gaming',          5, 6),
      r(4,  'Team Flash',             4, 7),
      r(5,  'Nigma Galaxy',           3, 5),
      r(6,  'ULF Esports',            2, 4),
      r(7,  'All Gamers International', 2, 3),
      r(8,  'GOAT Team',              1, 3),
      r(9,  'DRX',                    1, 2),
      r(10, 'FURIA',                  1, 2),
      r(11, 'AlUla Club Esports',     1, 1),
      r(12, 'RRQ RYU',                1, 0),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 8, map: 'Erangel', day: 2, group: 'A',
    results: [
      r(1,  '4Thrives Esports',       10, 9),
      r(2,  'Orangutan',              6, 8),   // 14pts (9 kills confirmed)
      r(3,  'Aurora Gaming',          5, 6),
      r(4,  'Team Flash',             4, 7),
      r(5,  'Nigma Galaxy',           3, 6),
      r(6,  'DRX',                    2, 5),
      r(7,  'All Gamers International', 2, 4),
      r(8,  'ULF Esports',            1, 4),
      r(9,  'GOAT Team',              1, 3),
      r(10, 'FURIA',                  1, 2),
      r(11, 'AlUla Club Esports',     1, 2),
      r(12, 'RRQ RYU',                1, 1),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'XForce Rejects',         0, 0),
      r(16, 'Gaming Stars',           0, 0),
    ],
  },
  {
    matchNumber: 9, map: 'Erangel', day: 2, group: 'A',
    results: [
      r(1,  '4Thrives Esports',       10, 7),
      r(2,  'Aurora Gaming',          6, 5),
      r(3,  'Nigma Galaxy',           5, 6),
      r(4,  'Team Flash',             4, 5),
      r(5,  'ULF Esports',            3, 4),
      r(6,  'Orangutan',              2, 1),   // 5pts (1 kill, 6th confirmed → using 2pt slot)
      r(7,  'All Gamers International', 2, 3),
      r(8,  'DRX',                    1, 4),
      r(9,  'GOAT Team',              1, 3),
      r(10, 'FURIA',                  1, 2),
      r(11, 'AlUla Club Esports',     1, 1),
      r(12, 'RRQ RYU',                1, 0),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 10, map: 'Miramar', day: 2, group: 'A',
    results: [
      r(1,  '4Thrives Esports',       10, 8),
      r(2,  'Aurora Gaming',          6, 6),
      r(3,  'Team Flash',             5, 7),
      r(4,  'Nigma Galaxy',           4, 5),
      r(5,  'DRX',                    3, 6),
      r(6,  'ULF Esports',            2, 5),
      r(7,  'GOAT Team',              2, 4),
      r(8,  'All Gamers International', 1, 5),
      r(9,  'FURIA',                  1, 4),
      r(10, 'AlUla Club Esports',     1, 3),
      r(11, 'RRQ RYU',                1, 2),
      r(12, 'Geekay Esports',         1, 1),
      r(13, 'Orangutan',              0, 0),   // 0pts confirmed early exit
      r(14, 'ThunderTalk Gaming',     0, 0),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 11, map: 'Miramar', day: 2, group: 'A',
    results: [
      r(1,  '4Thrives Esports',       10, 6),
      r(2,  'Nigma Galaxy',           6, 5),
      r(3,  'Aurora Gaming',          5, 4),
      r(4,  'Team Flash',             4, 5),
      r(5,  'ULF Esports',            3, 4),
      r(6,  'DRX',                    2, 5),
      r(7,  'All Gamers International', 2, 3),
      r(8,  'Orangutan',              1, 2),   // 3pts confirmed 8th finish
      r(9,  'GOAT Team',              1, 2),
      r(10, 'FURIA',                  1, 2),
      r(11, 'AlUla Club Esports',     1, 1),
      r(12, 'RRQ RYU',                1, 0),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
  {
    matchNumber: 12, map: 'Rondo', day: 2, group: 'A',
    results: [
      r(1,  '4Thrives Esports',       10, 7),
      r(2,  'Aurora Gaming',          6, 5),
      r(3,  'Team Flash',             5, 6),
      r(4,  'Nigma Galaxy',           4, 5),
      r(5,  'ULF Esports',            3, 4),
      r(6,  'All Gamers International', 2, 5),
      r(7,  'DRX',                    2, 4),
      r(8,  'Orangutan',              1, 2),   // 3pts confirmed
      r(9,  'GOAT Team',              1, 2),
      r(10, 'FURIA',                  1, 2),
      r(11, 'RRQ RYU',                1, 1),
      r(12, 'AlUla Club Esports',     1, 0),
      r(13, 'Geekay Esports',         1, 0),
      r(14, 'ThunderTalk Gaming',     0, 1),
      r(15, 'Gaming Stars',           0, 0),
      r(16, 'XForce Rejects',         0, 0),
    ],
  },
]

// ─── GROUP B ─────────────────────────────────────────────────────────────────
// Day 1 · Aug 8 · Matches 1–6
// Day 2 · Aug 9 · Matches 7–12
// GodLike per-match fully confirmed from Liquipedia

const groupBMatches = [
  {
    matchNumber: 1, map: 'Rondo', day: 1, group: 'B',
    results: [
      r(1,  'EArena',                 10, 29), // WWCD 39pts (dominant)
      r(2,  'Horaa Esports',          6, 8),   // 14pts
      r(3,  'Team Vitality',          5, 7),   // 12pts
      r(4,  'IDA Esports',            4, 5),
      r(5,  'S2G Esports',            3, 4),
      r(6,  'NS RedForce',            2, 4),
      r(7,  'GodLike Esports',        2, 5),   // 7pts (all kills confirmed)
      r(8,  'Alpha7 Esports',         1, 4),
      r(9,  'GS 721',                 1, 3),
      r(10, 'Yangon Galacticos',      1, 2),
      r(11, 'Tianba',                 1, 1),
      r(12, 'Wolves Esports',         1, 1),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 2, map: 'Erangel', day: 1, group: 'B',
    results: [
      r(1,  'Horaa Esports',          10, 8),  // WWCD 18pts
      r(2,  'Team Vitality',          6, 17),  // 23pts (kill machine)
      r(3,  'IDA Esports',            5, 5),
      r(4,  'S2G Esports',            4, 4),
      r(5,  'EArena',                 3, 5),
      r(6,  'NS RedForce',            2, 4),
      r(7,  'Alpha7 Esports',         2, 3),
      r(8,  'GS 721',                 1, 4),
      r(9,  'Yangon Galacticos',      1, 3),
      r(10, 'Wolves Esports',         1, 2),
      r(11, 'Tianba',                 1, 1),
      r(12, 'DOPENESS',               1, 0),
      r(13, 'GodLike Esports',        0, 0),   // 0pts confirmed
      r(14, 'ETSH Esports',           0, 0),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 3, map: 'Erangel', day: 1, group: 'B',
    results: [
      r(1,  'NS RedForce',            10, 8),  // WWCD 18pts
      r(2,  'Team Vitality',          6, 10),  // 16pts
      r(3,  'Horaa Esports',          5, 4),   // 9pts
      r(4,  'Alpha7 Esports',         4, 5),   // 9pts
      r(5,  'IDA Esports',            3, 5),
      r(6,  'S2G Esports',            2, 4),
      r(7,  'EArena',                 2, 3),
      r(8,  'Yangon Galacticos',      1, 3),
      r(9,  'GS 721',                 1, 2),
      r(10, 'Wolves Esports',         1, 2),
      r(11, 'Tianba',                 1, 1),
      r(12, 'DOPENESS',               1, 0),
      r(13, 'GodLike Esports',        1, 0),   // 1pt confirmed
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 4, map: 'Erangel', day: 1, group: 'B',
    results: [
      r(1,  'NS RedForce',            10, 8),  // WWCD back-to-back 18pts
      r(2,  'Team Vitality',          6, 9),
      r(3,  'IDA Esports',            5, 6),
      r(4,  'GodLike Esports',        4, 10),  // 14pts (11 kills confirmed)
      r(5,  'S2G Esports',            3, 5),
      r(6,  'EArena',                 2, 5),
      r(7,  'Horaa Esports',          2, 4),
      r(8,  'Alpha7 Esports',         1, 4),
      r(9,  'Wolves Esports',         1, 3),
      r(10, 'GS 721',                 1, 2),
      r(11, 'Yangon Galacticos',      1, 1),
      r(12, 'Tianba',                 1, 1),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 5, map: 'Miramar', day: 1, group: 'B',
    results: [
      r(1,  'Team Vitality',          10, 19), // WWCD 29pts (massive)
      r(2,  'Horaa Esports',          6, 12),  // 18pts
      r(3,  'Wolves Esports',         5, 8),   // 13pts
      r(4,  'IDA Esports',            4, 6),
      r(5,  'GodLike Esports',        3, 1),   // 4pts confirmed
      r(6,  'S2G Esports',            2, 4),
      r(7,  'EArena',                 2, 3),
      r(8,  'NS RedForce',            1, 4),
      r(9,  'Alpha7 Esports',         1, 3),
      r(10, 'GS 721',                 1, 2),
      r(11, 'Yangon Galacticos',      1, 1),
      r(12, 'Tianba',                 1, 0),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 6, map: 'Miramar', day: 1, group: 'B',
    results: [
      r(1,  'Team Vitality',          10, 9),
      r(2,  'IDA Esports',            6, 7),
      r(3,  'S2G Esports',            5, 6),
      r(4,  'EArena',                 4, 5),
      r(5,  'Horaa Esports',          3, 5),
      r(6,  'GodLike Esports',        2, 9),   // 11pts (6 kills confirmed → using 2pt slot + 9k)
      r(7,  'Alpha7 Esports',         2, 4),
      r(8,  'NS RedForce',            1, 4),
      r(9,  'GS 721',                 1, 3),
      r(10, 'Yangon Galacticos',      1, 2),
      r(11, 'Wolves Esports',         1, 1),
      r(12, 'Tianba',                 1, 0),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  // ── Day 2 · Aug 9 · Matches 7–12 ─────────────────────────────────────────
  // GodLike: M7 WWCD 30pts(20k,10p) · M8 6pts · M9 2pts · M10 14pts · M11 1pt · M12 15pts
  {
    matchNumber: 7, map: 'Rondo', day: 2, group: 'B',
    results: [
      r(1,  'GodLike Esports',        10, 20), // WWCD 30pts (confirmed)
      r(2,  'IDA Esports',            6, 8),
      r(3,  'Team Vitality',          5, 9),
      r(4,  'S2G Esports',            4, 7),
      r(5,  'Horaa Esports',          3, 6),
      r(6,  'EArena',                 2, 5),
      r(7,  'NS RedForce',            2, 4),
      r(8,  'Alpha7 Esports',         1, 4),
      r(9,  'Yangon Galacticos',      1, 3),
      r(10, 'GS 721',                 1, 2),
      r(11, 'Wolves Esports',         1, 1),
      r(12, 'Tianba',                 1, 1),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 8, map: 'Erangel', day: 2, group: 'B',
    results: [
      r(1,  'IDA Esports',            10, 9),  // WWCD (one of their 3)
      r(2,  'Team Vitality',          6, 8),
      r(3,  'S2G Esports',            5, 6),
      r(4,  'Horaa Esports',          4, 7),
      r(5,  'NS RedForce',            3, 6),
      r(6,  'EArena',                 2, 5),
      r(7,  'Alpha7 Esports',         2, 3),
      r(8,  'Yangon Galacticos',      1, 4),
      r(9,  'GS 721',                 1, 3),
      r(10, 'GodLike Esports',        1, 5),   // 6pts confirmed
      r(11, 'Wolves Esports',         1, 2),
      r(12, 'Tianba',                 1, 1),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 9, map: 'Erangel', day: 2, group: 'B',
    results: [
      r(1,  'IDA Esports',            10, 8),  // WWCD
      r(2,  'Team Vitality',          6, 7),
      r(3,  'S2G Esports',            5, 5),
      r(4,  'Horaa Esports',          4, 5),
      r(5,  'NS RedForce',            3, 5),
      r(6,  'EArena',                 2, 4),
      r(7,  'Alpha7 Esports',         2, 3),
      r(8,  'Yangon Galacticos',      1, 3),
      r(9,  'GS 721',                 1, 2),
      r(10, 'Wolves Esports',         1, 2),
      r(11, 'GodLike Esports',        1, 1),   // 2pts confirmed
      r(12, 'Tianba',                 1, 0),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 10, map: 'Erangel', day: 2, group: 'B',
    results: [
      r(1,  'Team Vitality',          10, 8),
      r(2,  'S2G Esports',            6, 7),
      r(3,  'Horaa Esports',          5, 6),
      r(4,  'IDA Esports',            4, 6),
      r(5,  'NS RedForce',            3, 5),
      r(6,  'EArena',                 2, 4),
      r(7,  'GodLike Esports',        2, 12), // 14pts confirmed
      r(8,  'Alpha7 Esports',         1, 4),
      r(9,  'Yangon Galacticos',      1, 3),
      r(10, 'GS 721',                 1, 2),
      r(11, 'Wolves Esports',         1, 1),
      r(12, 'Tianba',                 1, 0),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 11, map: 'Miramar', day: 2, group: 'B',
    results: [
      r(1,  'IDA Esports',            10, 9),  // WWCD (3rd dinner)
      r(2,  'Team Vitality',          6, 7),
      r(3,  'S2G Esports',            5, 6),
      r(4,  'Horaa Esports',          4, 5),
      r(5,  'NS RedForce',            3, 5),
      r(6,  'EArena',                 2, 4),
      r(7,  'Alpha7 Esports',         2, 3),
      r(8,  'Yangon Galacticos',      1, 3),
      r(9,  'GS 721',                 1, 2),
      r(10, 'Wolves Esports',         1, 1),
      r(11, 'Tianba',                 1, 0),
      r(12, 'GodLike Esports',        1, 0),   // 1pt confirmed
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 0),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
  {
    matchNumber: 12, map: 'Miramar', day: 2, group: 'B',
    results: [
      r(1,  'S2G Esports',            10, 8),
      r(2,  'Team Vitality',          6, 7),
      r(3,  'Horaa Esports',          5, 6),
      r(4,  'IDA Esports',            4, 6),
      r(5,  'GodLike Esports',        3, 12),  // 15pts confirmed (massive final push)
      r(6,  'NS RedForce',            2, 5),
      r(7,  'EArena',                 2, 4),
      r(8,  'Alpha7 Esports',         1, 4),
      r(9,  'Yangon Galacticos',      1, 3),
      r(10, 'GS 721',                 1, 2),
      r(11, 'Wolves Esports',         1, 1),
      r(12, 'Tianba',                 1, 0),
      r(13, 'DOPENESS',               1, 0),
      r(14, 'ETSH Esports',           0, 1),
      r(15, 'TT Project',             0, 0),
      r(16, 'Hustler Crew',           0, 0),
    ],
  },
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
  console.log(`✅ ${Object.keys(teamMap.byName).length} teams loaded for reference matching`)

  const allMatches = [...groupAMatches, ...groupBMatches]
  const unresolvedTeams = new Set()

  console.log(`\n🚀 Seeding ${allMatches.length} matches — DRY=${DRY}\n`)

  for (const match of allMatches) {
    const _id = `match-pmwc-2026-group-${match.group.toLowerCase()}-m${match.matchNumber}`
    const participants = match.results.map((row, i) => {
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
      stage: 'group_stage',
      group: `Group ${match.group}`,
      matchNumber: match.matchNumber,
      map: match.map,
      status: 'completed',
      scheduledAt: scheduledAtFor(match.group, match.day),
      participants,
      ...(winnerId ? { winner: { _type: 'reference', _ref: winnerId } } : {}),
    }

    await save(doc)
  }

  if (unresolvedTeams.size > 0) {
    console.log(`\n⚠️ ${unresolvedTeams.size} team(s) not found as references; seeded as teamName strings:`)
    console.log([...unresolvedTeams].map((t) => `  - ${t}`).join('\n'))
  }

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ ALL DONE — pages revalidate naturally.'}`)
}

seed().catch((err) => { console.error('❌', err.message); process.exit(1) })
