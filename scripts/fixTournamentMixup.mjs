/**
 * scripts/fixTournamentMixup.mjs
 *
 * CRITICAL DATA FIX: BMPS 2026 (Battlegrounds Mobile India Pro Series) and
 * BGMS 2026 (BGMI Masters Series Season 5) are two completely different
 * tournaments, but an earlier seed script wrote real BMPS Grand Finals
 * results (Jaipur, June 19-21 2026, GodLike Esports champions) into the
 * BGMS Season 5 tournament/edition record — because it reused the BGMS
 * edition ID. BGMS Season 5 is a separate, still-LIVE tournament (League
 * Stage, Aug 10-30 2026) and had no seeded data of its own.
 *
 * This script:
 *   1. Creates the missing `tournament` + `tournamentEdition` docs for
 *      BMPS 2026 (completed, real Grand Finals data verified against
 *      multiple news sources: insidesport, sportsdigest, talkesport,
 *      fossbytes, sportsdunia — June 2026).
 *   2. Re-points the existing match-bmps-2026-gf-m* and
 *      standing-bmps-2026-gf-* documents (which already have the right
 *      BMPS match content) from the BGMS edition to the new BMPS edition.
 *   3. Corrects the final standings totals/WWCD counts to match verified
 *      sources, and republishes it (it was hidden as a precaution earlier
 *      today, but the GodLike win is real and confirmed).
 *   4. Strips the leftover BMPS prize-pool data from the BGMS Season 5
 *      edition and sets its status to the new 'league_stage' value
 *      (it is currently in League Stage, not Grand Finals).
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/fixTournamentMixup.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/fixTournamentMixup.mjs
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

const BMPS_TOURNAMENT_ID = 'tournament-battlegrounds-mobile-india-pro-series'
const BMPS_EDITION_ID = 'edition-bmps-2026'
const BGMS_TOURNAMENT_ID = 'tournament-bgmi-masters-series'
const BGMS_EDITION_ID = 'edition-bgmi-masters-series-season-5-2026'
const GODLIKE_TEAM_ID = '0fbe6e3d-39c1-4342-8d23-9499c541954f' // verified: GodLike Esports
const VICTORES_TEAM_ID = 'team-victores-sumus' // verified exists

const BMPS_MATCH_IDS = [1, 2, 3, 4, 5, 6].map((n) => `match-bmps-2026-gf-m${n}`)
const BMPS_STANDING_IDS = ['standing-bmps-2026-gf-day1', 'standing-bmps-2026-gf-day2', 'standing-bmps-2026-gf-final']

async function save(doc) {
  if (DRY) { console.log('[DRY create/replace]', doc._type, doc._id); return }
  await client.createOrReplace(doc)
  console.log('[WROTE]', doc._type, doc._id)
}

async function patch(id, fields, unsetFields = []) {
  if (DRY) { console.log('[DRY PATCH]', id, JSON.stringify(fields), unsetFields.length ? `unset: ${unsetFields}` : '') ; return }
  let p = client.patch(id)
  if (Object.keys(fields).length) p = p.set(fields)
  if (unsetFields.length) p = p.unset(unsetFields)
  await p.commit()
  console.log('[PATCHED]', id)
}

function row(rank, teamName, wwcd, kills, placementPoints, matchesPlayed, points, extra = {}) {
  return { _key: nanoid(), _type: 'standingRow', rank, teamName, wwcd, kills, placementPoints, matchesPlayed, points, ...extra }
}

// Verified final standings — sources: fossbytes.com/bmps-2026-grand-finals-rankings,
// sportsdunia BMPS 2026 Day 3 points table, esportsverse.in grand-finals leaderboard.
// Columns: rank, team, wwcd, elimination/"finish" points (kills), position points, matchesPlayed, total
const FINAL_STANDINGS = [
  row(1,  'GodLike Esports',        2, 104, 58, 18, 162, { team: { _type: 'reference', _ref: GODLIKE_TEAM_ID } }),
  row(2,  'Divine Gaming',          2, 96,  56, 18, 152),
  row(3,  'Victores Sumus',         2, 79,  54, 18, 133, { team: { _type: 'reference', _ref: VICTORES_TEAM_ID } }),
  row(4,  'Gods Reign',             1, 93,  35, 18, 128),
  row(5,  'Team Apex Gaming',       2, 95,  28, 18, 123),
  row(6,  'iQOO Orangutan',         1, 78,  41, 18, 119),
  row(7,  'iQOO Team Tamilas',      1, 78,  38, 18, 116),
  row(8,  'Vasista Esports',        2, 76,  37, 18, 113),
  row(9,  'iQOO Reckoning Esports', 2, 68,  43, 18, 111),
  row(10, 'Nebula Esports',         1, 73,  34, 18, 107),
  row(11, 'iQOO 8Bit',              0, 73,  30, 18, 103),
  row(12, 'Genesis Esports',        0, 70,  29, 18, 99),
  row(13, 'iQOO SouL',              1, 66,  30, 18, 96),
  row(14, '7Gods Esports',          1, 64,  31, 18, 95),
  row(15, 'iQOO Revenant XSpark',   0, 67,  19, 18, 86),
  row(16, 'Myth Official',          0, 50,  13, 18, 63),
]

// Verified prize distribution — sources: talkesport.com, insidesport.in
// (KRAFTON India doubled the pool from ₹2 Cr to ₹4 Cr on June 8, 2026).
const PRIZE_PLACEMENTS = [
  { placement: '1st',      prize: 10000000, notes: 'GodLike Esports — Champions' },
  { placement: '2nd',      prize: 6000000,  notes: 'Divine Gaming' },
  { placement: '3rd',      prize: 4000000,  notes: 'Victores Sumus' },
  { placement: '4th',      prize: 3000000,  notes: 'Gods Reign' },
  { placement: '5th',      prize: 2500000,  notes: 'Team Apex Gaming' },
  { placement: '6th',      prize: 1800000,  notes: 'iQOO Orangutan' },
  { placement: '7th',      prize: 1500000,  notes: 'iQOO Team Tamilas' },
  { placement: '8th',      prize: 1450000,  notes: 'Vasista Esports' },
  { placement: '9th–10th', prize: 1000000,  notes: 'iQOO Reckoning Esports, Nebula Esports (each)' },
  { placement: '11th–12th', prize: 800000,  notes: 'iQOO 8Bit, Genesis Esports (each)' },
  { placement: '13th–14th', prize: 600000,  notes: 'iQOO SouL, 7Gods Esports (each)' },
  { placement: '15th–16th', prize: 500000,  notes: 'iQOO Revenant XSpark, Myth Official (each)' },
].map((p) => ({ _key: nanoid(), _type: 'prizePlacement', currency: 'INR', ...p }))

async function main() {
  console.log(`\n🚀 Tournament mixup fix (BMPS vs BGMS) — DRY=${DRY}\n`)

  // 1. Create the missing BMPS tournament + edition docs.
  await save({
    _id: BMPS_TOURNAMENT_ID,
    _type: 'tournament',
    name: 'Battlegrounds Mobile India Pro Series',
    slug: { _type: 'slug', current: 'battlegrounds-mobile-india-pro-series' },
    game: 'BGMI',
    region: 'India',
    organizer: 'Krafton India / NODWIN Gaming',
    description:
      "Battlegrounds Mobile India Pro Series (BMPS) — Krafton India's flagship official BGMI league, distinct from the BGMI Masters Series (BGMS).",
  })

  await save({
    _id: BMPS_EDITION_ID,
    _type: 'tournamentEdition',
    tournament: { _type: 'reference', _ref: BMPS_TOURNAMENT_ID },
    year: 'Season 5 · 2026',
    slug: { _type: 'slug', current: '2026' },
    tournamentStatus: 'completed',
    startDate: '2026-06-19T00:00:00.000Z',
    endDate: '2026-06-21T23:59:59.000Z',
    venue: 'Jaipur Exhibition & Convention Centre (JECC), Jaipur',
    format: 'LAN',
    totalTeams: 16,
    totalPrizePool: 40000000,
    prizePoolCurrency: 'INR',
    prizePoolDisplay: '₹4 Crore',
    prizePlacements: PRIZE_PLACEMENTS,
    winner: { _type: 'reference', _ref: GODLIKE_TEAM_ID },
    // Note: runnerUp (Divine Gaming) is intentionally omitted — no `team`
    // document exists for Divine Gaming yet, and this field only accepts a
    // reference (no plain-text fallback). Create a Divine Gaming team doc
    // in Studio, then patch `runnerUp` to reference it, if desired.
    publishStatus: 'published',
    description:
      'BMPS 2026 Grand Finals — Jaipur, June 19-21 2026. GodLike Esports completed a last-to-first comeback (last after Day 1, champions after Day 3) to win their first BGMI title, 162 pts, and a spot at the Esports World Cup 2026 in Paris.',
  })

  // 2. Re-point the existing (already-correct-content) match docs to BMPS.
  for (const id of BMPS_MATCH_IDS) {
    await patch(id, {
      tournament: { _type: 'reference', _ref: BMPS_TOURNAMENT_ID },
      edition: { _type: 'reference', _ref: BMPS_EDITION_ID },
    })
  }

  // 3. Re-point standings to BMPS, correct + republish the final one.
  await patch('standing-bmps-2026-gf-day1', {
    tournament: { _type: 'reference', _ref: BMPS_TOURNAMENT_ID },
    edition: { _type: 'reference', _ref: BMPS_EDITION_ID },
  })
  await patch('standing-bmps-2026-gf-day2', {
    tournament: { _type: 'reference', _ref: BMPS_TOURNAMENT_ID },
    edition: { _type: 'reference', _ref: BMPS_EDITION_ID },
  })
  await patch('standing-bmps-2026-gf-final', {
    tournament: { _type: 'reference', _ref: BMPS_TOURNAMENT_ID },
    edition: { _type: 'reference', _ref: BMPS_EDITION_ID },
    status: 'published',
    rows: FINAL_STANDINGS,
  })

  // 4. Strip the leftover BMPS financial data from the BGMS Season 5 edition
  //    (it's a different, still-live tournament) and set its real stage.
  await patch(
    BGMS_EDITION_ID,
    { tournamentStatus: 'league_stage' },
    ['totalPrizePool', 'prizePoolDisplay', 'prizePoolCurrency', 'prizePlacements', 'winner', 'runnerUp'],
  )

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ Done — BMPS and BGMS are now separate, correct records.'}\n`)
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
