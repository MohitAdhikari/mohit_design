/**
 * scripts/seedPMWCMatch1GrandFinals.mjs
 * Publishes PMWC Grand Finals — Match 1 ranking data from the broadcast
 * screenshot. Creates a completed match document + a standing snapshot.
 *
 * DRY RUN (safe):
 *   node --env-file=.env.local scripts/seedPMWCMatch1GrandFinals.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWCMatch1GrandFinals.mjs
 */

import { createClient } from '@sanity/client'

const DRY = process.env.DRY !== 'false'

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

// Map broadcast/official team spellings → canonical Sanity team `name` values
const NAME_MAP = {
  'Nigma Galaxy': 'Nigma Galaxy', // not in Sanity — will fallback to teamName
  'Aurora Gaming': 'Aurora Gaming', // not in Sanity — will fallback to teamName
  'Tianba': 'Tianba Esports',
  'Alula Club Esports': "AlUla Club Esports",
  'Earena': 'eArena',
  'Nongshim RedForce': 'NongShim RedForce',
  'FURIA': 'FURIA Esports',
  'Horaa Esports': 'Horaa Esports', // not in Sanity
  'Team Flash': 'Team Flash', // not in Sanity
  'GodLike Esports': 'GodLike Esports',
  'ULF Esports': 'ULF Esports',
  'Team Vitality': 'Team Vitality', // not in Sanity
  'Orangutan': 'Orangutan',
  'S2G Esports': 'S2G Esports', // not in Sanity
  '4Thrives Esports': '4Thrives Esports', // not in Sanity
  'IDA Esports': 'IDA Esports', // not in Sanity
}

// Data extracted from the broadcast "MATCH RANKING" graphic (PMWC Grand Finals — Match 1)
const MATCH_RESULTS = [
  { rank: 1, teamName: 'Nigma Galaxy', placement: 10, elim: 13, total: 23 },
  { rank: 2, teamName: 'Aurora Gaming', placement: 6, elim: 17, total: 23 },
  { rank: 3, teamName: 'Tianba', placement: 0, elim: 16, total: 16 },
  { rank: 4, teamName: 'Alula Club Esports', placement: 4, elim: 7, total: 11 },
  { rank: 5, teamName: 'Earena', placement: 3, elim: 7, total: 10 },
  { rank: 6, teamName: 'Nongshim RedForce', placement: 0, elim: 9, total: 9 },
  { rank: 7, teamName: 'FURIA', placement: 5, elim: 2, total: 7 },
  { rank: 8, teamName: 'Horaa Esports', placement: 0, elim: 6, total: 6 },
  { rank: 9, teamName: 'Team Flash', placement: 1, elim: 4, total: 5 },
  { rank: 10, teamName: 'GodLike Esports', placement: 1, elim: 3, total: 4 },
  { rank: 11, teamName: 'ULF Esports', placement: 0, elim: 4, total: 4 },
  { rank: 12, teamName: 'Team Vitality', placement: 0, elim: 3, total: 3 },
  { rank: 13, teamName: 'Orangutan', placement: 2, elim: 0, total: 2 },
  { rank: 14, teamName: 'S2G Esports', placement: 0, elim: 2, total: 2 },
  { rank: 15, teamName: '4Thrives Esports', placement: 0, elim: 2, total: 2 },
  { rank: 16, teamName: 'IDA Esports', placement: 0, elim: 1, total: 1 },
]

const EDITION_ID = 'edition-pubg-mobile-world-cup-2026'

async function main() {
  console.log(`\n🚀 PMWC Grand Finals Match 1 seed — DRY=${DRY}\n`)

  const edition = await readClient.fetch(
    `*[_type == "tournamentEdition" && _id == $id][0]{ _id, "tournamentId": tournament._ref, "editionSlug": slug.current, year }`,
    { id: EDITION_ID },
  )

  if (!edition) {
    console.error(`❌ Edition not found with id: ${EDITION_ID}`)
    process.exit(1)
  }

  const editionId = edition._id
  const tournamentId = edition.tournamentId
  console.log('✅ Edition found:', editionId)
  console.log('✅ Tournament ref:', tournamentId || 'missing')

  // Look up team refs by name (case-insensitive match on team name)
  const teamNames = MATCH_RESULTS.map((r) => r.teamName)
  const teams = await readClient.fetch(
    `*[_type == "team"]{ _id, name }`,
  )

  console.log(`✅ Fetched ${teams.length} teams from Sanity`)
  const teamByName = new Map(teams.map((t) => [t.name.trim(), t._id]))
  const resolveTeam = (broadcastName) => teamByName.get((NAME_MAP[broadcastName] || broadcastName).trim())
  console.log(`✅ Matched ${teamNames.filter((n) => resolveTeam(n)).length}/${teamNames.length} teams`)
  // Debug first few mismatches
  MATCH_RESULTS.slice(0, 6).forEach((r) => {
    const lookup = NAME_MAP[r.teamName] || r.teamName
    console.log(`   ${r.teamName} -> lookup "${lookup}" exists=${!!teamByName.get(lookup)}`)
  })

  const matchDoc = {
    _type: 'match',
    _id: `pmwc-2026-gf-match-1`,
    tournament: { _type: 'reference', _ref: tournamentId },
    edition: { _type: 'reference', _ref: editionId },
    matchNumber: 1,
    matchFormat: 'battle_royale',
    stage: 'grand_finals',
    map: 'TBD',
    status: 'completed',
    scheduledAt: new Date().toISOString(),
    participants: MATCH_RESULTS.map((r) => {
      const teamRef = resolveTeam(r.teamName)
      return {
        _key: `p${r.rank}`,
        _type: 'matchParticipant',
        team: teamRef ? { _type: 'reference', _ref: teamRef } : undefined,
        teamName: r.teamName,
        placement: r.rank,
        placementPoints: r.placement,
        kills: r.elim,
        points: r.total,
      }
    }),
  }

  const standingDoc = {
    _type: 'standing',
    _id: `pmwc-2026-gf-standing-match-1`,
    title: 'PMWC 2026 Grand Finals — Match 1 Standings',
    tournament: { _type: 'reference', _ref: tournamentId },
    edition: { _type: 'reference', _ref: editionId },
    stage: 'grand_finals',
    afterMatch: 1,
    status: 'published',
    lastUpdated: new Date().toISOString(),
    rows: MATCH_RESULTS.map((r) => {
      const teamRef = resolveTeam(r.teamName)
      return {
        _key: `r${r.rank}`,
        _type: 'standingRow',
        rank: r.rank,
        team: teamRef ? { _type: 'reference', _ref: teamRef } : undefined,
        teamName: r.teamName,
        matchesPlayed: 1,
        wwcd: r.rank === 1 ? 1 : 0,
        placementPoints: r.placement,
        kills: r.elim,
        points: r.total,
      }
    }),
  }

  if (DRY) {
    console.log('\n[DRY] Would create match:', matchDoc._id)
    console.log(`   participants: ${matchDoc.participants.length}`)
    console.log('[DRY] Would create standing:', standingDoc._id)
    console.log(`   rows: ${standingDoc.rows.length}`)
    console.log('\n⚠️  Unmatched teams (will use teamName fallback):')
    MATCH_RESULTS.filter((r) => !resolveTeam(r.teamName)).forEach((r) => console.log(`   - ${r.teamName}`))
    console.log('\n✅ DRY done. Run DRY=false to write.\n')
  } else {
    await writeClient.createOrReplace(matchDoc)
    console.log('[CREATED] match:', matchDoc._id)

    await writeClient.createOrReplace(standingDoc)
    console.log('[CREATED] standing:', standingDoc._id)

    console.log('\n✅ Done. Remember: site must be manually redeployed for new paths to appear.\n')
  }
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
