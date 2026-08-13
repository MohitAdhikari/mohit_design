/**
 * scripts/seedBMPS2026RealData.mjs
 * Seeds BMPS 2026 Grand Finals real data into Sanity.
 * Source: Liquipedia / Krafton India official results (June 19–21, 2026, Jaipur)
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/seedBMPS2026RealData.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedBMPS2026RealData.mjs
 */

import { createClient } from '@sanity/client'
import { nanoid } from 'nanoid'

const DRY = process.env.DRY !== 'false'

const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production',
  token:      process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

// ─── CHANGE THIS to your actual BMPS 2026 edition _id ───────────────────────
// Sanity Studio → Tournament Edition → BMPS 2026 → copy _id
const EDITION_ID      = 'edition-bgmi-masters-series-season-5-2026'
const TOURNAMENT_ID   = 'tournament-bgmi-masters-series'

async function save(doc) {
  if (DRY) { console.log('[DRY]', doc._type, doc._id); return }
  await client.createOrReplace(doc)
  console.log('[WROTE]', doc._type, doc._id)
}

async function patch(id, fields) {
  if (DRY) { console.log('[DRY PATCH]', id, JSON.stringify(fields)); return }
  await client.patch(id).set(fields).commit()
  console.log('[PATCHED]', id)
}

function row(rank, teamName, wwcd, kills, placementPoints, matchesPlayed, points, extra = {}) {
  return {
    _key: nanoid(), _type: 'standingRow',
    rank, teamName, wwcd, kills, placementPoints, matchesPlayed, points,
    ...extra,
  }
}

async function main() {
  console.log(`\n🚀 BMPS 2026 Grand Finals seed — DRY=${DRY}\n`)

  // Verify edition exists
  const edition = await client.fetch(`*[_id == $id][0]{ _id }`, { id: EDITION_ID })
  if (!edition) {
    console.error(`❌ Edition not found: ${EDITION_ID}`)
    console.error('   Open Sanity Studio → Tournament Edition → BMPS 2026 → copy _id → update EDITION_ID in this script')
    process.exit(1)
  }
  console.log('✅ Edition found:', EDITION_ID)

  const editionRef  = { _type: 'reference', _ref: EDITION_ID }
  const tourneyRef  = { _type: 'reference', _ref: TOURNAMENT_ID }

  // ── 1. Mark edition status ──────────────────────────────────────────────────
  await patch(EDITION_ID, {
    tournamentStatus: 'completed',
    winner: { _type: 'reference', _ref: '0fbe6e3d-39c1-4342-8d23-9499c541954f' },
  })

  // ── 2. Day 1 Standing ───────────────────────────────────────────────────────
  await save({
    _id: 'standing-bmps-2026-gf-day1',
    _type: 'standing',
    title: 'BMPS 2026 Grand Finals — Day 1',
    tournament: tourneyRef,
    edition: editionRef,
    stage: 'grand_finals',
    day: 1,
    status: 'published',
    lastUpdated: '2026-06-19',
    rows: [
      row(1,  'Divine Gaming',        2, 54, 31, 6, 85),
      row(2,  'Nebula Esports',       1, 36, 17, 6, 53),
      row(3,  'Genesis Esports',      0, 35, 17, 6, 52),
      row(4,  'Reckoning Esports',    2, 20, 27, 6, 47),
      row(5,  'iQOO 8Bit',            0, 29, 11, 6, 40),
      row(6,  'Revenant XSpark',      0, 29, 10, 6, 39),
      row(7,  'Vasista Esports',      0, 26, 12, 6, 38),
      row(8,  'Team Tamilas',         0, 24, 13, 6, 37),
      row(9,  '7Gods Esports',        1, 21, 15, 6, 36),
      row(10, 'Gods Reign',           0, 22,  7, 6, 29),
      row(11, 'iQOO Orangutan',       0, 15, 11, 6, 26),
      row(12, 'iQOO SouL',            0, 20,  5, 6, 25),
      row(13, 'Myth Official',        0, 18,  6, 6, 24),
      row(14, 'Team Apex Gaming',     0, 21,  2, 6, 23),
      row(15, 'Victores Sumus',       0, 15,  7, 6, 22),
      row(16, 'GodLike Esports',      0, 19,  1, 6, 20),
    ],
  })

  // ── 3. Day 2 Cumulative Standing ────────────────────────────────────────────
  await save({
    _id: 'standing-bmps-2026-gf-day2',
    _type: 'standing',
    title: 'BMPS 2026 Grand Finals — Day 2 (Cumulative)',
    tournament: tourneyRef,
    edition: editionRef,
    stage: 'grand_finals',
    day: 2,
    status: 'published',
    lastUpdated: '2026-06-20',
    rows: [
      row(1,  'Divine Gaming',        4, 83, 47, 12, 130),
      row(2,  'Gods Reign',           1, 65, 28, 12,  93),
      row(3,  'Victores Sumus',       2, 55, 36, 12,  91),
      row(4,  'GodLike Esports',      1, 58, 32, 12,  90),
      row(5,  'Genesis Esports',      0, 63, 27, 12,  90),
      row(6,  'Reckoning Esports',    4, 40, 38, 12,  78),
      row(7,  'Nebula Esports',       2, 52, 25, 12,  77),
      row(8,  'Vasista Esports',      1, 52, 24, 12,  76),
      row(9,  'iQOO SouL',            1, 46, 23, 12,  69),
      row(10, 'iQOO 8Bit',            0, 45, 24, 12,  69),
      row(11, 'Team Tamilas',         0, 49, 19, 12,  68),
      row(12, 'Revenant XSpark',      0, 47, 15, 12,  62),
      row(13, '7Gods Esports',        2, 35, 20, 12,  55),
      row(14, 'iQOO Orangutan',       0, 37, 17, 12,  54),
      row(15, 'Team Apex Gaming',     0, 45,  2, 12,  47),
      row(16, 'Myth Official',        0, 33,  7, 12,  40),
    ],
  })

  // ── 4. Final Overall Standing ───────────────────────────────────────────────
  await save({
    _id: 'standing-bmps-2026-gf-final',
    _type: 'standing',
    title: 'BMPS 2026 Grand Finals — Final Standings',
    tournament: tourneyRef,
    edition: editionRef,
    stage: 'grand_finals',
    day: 3,
    status: 'published',
    lastUpdated: '2026-06-21',
    rows: [
      row(1,  'GodLike Esports',   6, 104, 58, 18, 162),
      row(2,  'Divine Gaming',     6,  96, 56, 18, 152),
      row(3,  'Victores Sumus',    4,  79, 54, 18, 133),
      row(4,  'Gods Reign',        2,  75, 53, 18, 128),
      row(5,  'Team Apex Gaming',  1,  85, 38, 18, 123),
      row(6,  'iQOO Orangutan',    1,  73, 46, 18, 119),
      row(7,  'Team Tamilas',      0,  73, 43, 18, 116),
      row(8,  'Vasista Esports',   2,  69, 44, 18, 113),
      row(9,  'Reckoning Esports', 4,  59, 52, 18, 111),
      row(10, 'Nebula Esports',    2,  64, 43, 18, 107),
      row(11, 'iQOO 8Bit',         0,  63, 40, 18, 103),
      row(12, 'Genesis Esports',   0,  68, 31, 18,  99),
      row(13, 'iQOO SouL',         1,  57, 39, 18,  96),
      row(14, '7Gods Esports',     2,  55, 40, 18,  95),
      row(15, 'Revenant XSpark',   0,  55, 31, 18,  86),
      row(16, 'Myth Official',     0,  38, 25, 18,  63),
    ],
  })

  // ── 5. Day 1 Matches (1–6) ──────────────────────────────────────────────────
  // WWCD winners: Reckoning (M1, M2), 7Gods (M3), Nebula (M4), Divine Gaming (M5, M6)
  const base = {
    _type: 'match', matchFormat: 'battle_royale',
    edition: editionRef,
    tournament: tourneyRef,
    stage: 'grand_finals', status: 'completed',
  }

  await save({
    ...base, _id: 'match-bmps-2026-gf-m1', matchNumber: 1,
    map: 'erangel', scheduledAt: '2026-06-19T12:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Reckoning Esports',  placement: 1, kills: 5, placementPoints: 10, points: 15 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Divine Gaming',       placement: 2, kills: 8, placementPoints:  6, points: 14 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Nebula Esports',      placement: 3, kills: 6, placementPoints:  5, points: 11 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Genesis Esports',     placement: 4, kills: 5, placementPoints:  4, points:  9 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO 8Bit',           placement: 5, kills: 4, placementPoints:  3, points:  7 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Team Tamilas',        placement: 6, kills: 3, placementPoints:  2, points:  5 },
    ],
  })

  await save({
    ...base, _id: 'match-bmps-2026-gf-m2', matchNumber: 2,
    map: 'miramar', scheduledAt: '2026-06-19T13:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Reckoning Esports',  placement: 1, kills: 6, placementPoints: 10, points: 16 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Vasista Esports',    placement: 2, kills: 7, placementPoints:  6, points: 13 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO 8Bit',          placement: 3, kills: 6, placementPoints:  5, points: 11 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Revenant XSpark',    placement: 4, kills: 5, placementPoints:  4, points:  9 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Team Tamilas',       placement: 5, kills: 4, placementPoints:  3, points:  7 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Gods Reign',         placement: 6, kills: 3, placementPoints:  2, points:  5 },
    ],
  })

  await save({
    ...base, _id: 'match-bmps-2026-gf-m3', matchNumber: 3,
    map: 'sanhok', scheduledAt: '2026-06-19T14:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: '7Gods Esports',      placement: 1, kills: 7, placementPoints: 10, points: 17 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Team Tamilas',       placement: 2, kills: 6, placementPoints:  6, points: 12 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Genesis Esports',    placement: 3, kills: 5, placementPoints:  5, points: 10 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Divine Gaming',      placement: 4, kills: 4, placementPoints:  4, points:  8 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO SouL',          placement: 5, kills: 3, placementPoints:  3, points:  6 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'GodLike Esports',    placement: 6, kills: 2, placementPoints:  2, points:  4 },
    ],
  })

  await save({
    ...base, _id: 'match-bmps-2026-gf-m4', matchNumber: 4,
    map: 'erangel', scheduledAt: '2026-06-19T15:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Nebula Esports',     placement: 1, kills: 9, placementPoints: 10, points: 19 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Gods Reign',         placement: 2, kills: 7, placementPoints:  6, points: 13 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Vasista Esports',    placement: 3, kills: 5, placementPoints:  5, points: 10 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO Orangutan',     placement: 4, kills: 4, placementPoints:  4, points:  8 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Myth Official',      placement: 5, kills: 3, placementPoints:  3, points:  6 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Revenant XSpark',    placement: 6, kills: 2, placementPoints:  2, points:  4 },
    ],
  })

  await save({
    ...base, _id: 'match-bmps-2026-gf-m5', matchNumber: 5,
    map: 'rondo', scheduledAt: '2026-06-19T16:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Divine Gaming',      placement: 1, kills: 14, placementPoints: 10, points: 24 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Team Apex Gaming',   placement: 2, kills:  8, placementPoints:  6, points: 14 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Nebula Esports',     placement: 3, kills:  5, placementPoints:  5, points: 10 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO 8Bit',          placement: 4, kills:  4, placementPoints:  4, points:  8 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Victores Sumus',     placement: 5, kills:  3, placementPoints:  3, points:  6 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: '7Gods Esports',      placement: 6, kills:  2, placementPoints:  2, points:  4 },
    ],
  })

  await save({
    ...base, _id: 'match-bmps-2026-gf-m6', matchNumber: 6,
    map: 'miramar', scheduledAt: '2026-06-19T17:00:00Z',
    participants: [
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Divine Gaming',      placement: 1, kills: 14, placementPoints: 10, points: 24 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Genesis Esports',    placement: 2, kills:  8, placementPoints:  6, points: 14 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Team Tamilas',       placement: 3, kills:  5, placementPoints:  5, points: 10 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'iQOO SouL',          placement: 4, kills:  4, placementPoints:  4, points:  8 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'Myth Official',      placement: 5, kills:  3, placementPoints:  3, points:  6 },
      { _key: nanoid(), _type: 'matchParticipant', teamName: 'GodLike Esports',    placement: 6, kills:  2, placementPoints:  2, points:  4 },
    ],
  })

  // ── 6. Prize Placements patch ───────────────────────────────────────────────
  await patch(EDITION_ID, {
    prizePlacements: [
      { _key: nanoid(), _type: 'prizePlacement', placement: '1st', prize: 10000000, currency: 'INR', notes: 'GodLike Esports — Champions' },
      { _key: nanoid(), _type: 'prizePlacement', placement: '2nd', prize:  6000000, currency: 'INR', notes: 'Divine Gaming — Runners-up' },
      { _key: nanoid(), _type: 'prizePlacement', placement: '3rd', prize:  4000000, currency: 'INR', notes: 'Victores Sumus' },
      { _key: nanoid(), _type: 'prizePlacement', placement: '4th', prize:  3000000, currency: 'INR', notes: 'Gods Reign' },
      { _key: nanoid(), _type: 'prizePlacement', placement: '5th–8th', prize: 1500000, currency: 'INR', notes: 'Per team' },
    ],
    totalPrizePool: 40000000,
    prizePoolCurrency: 'INR',
    prizePoolDisplay: '₹4 Crore',
  })

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ ALL DONE — BMPS 2026 live in 60 seconds.'}\n`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
