/**
 * scripts/seedPMWCMatch2GrandFinals.mjs
 * Publishes PMWC Grand Finals — Match 2 ranking data from the broadcast
 * screenshot. Creates a completed match document + a standing snapshot.
 *
 * DRY RUN (safe):
 *   node --env-file=.env.local scripts/seedPMWCMatch2GrandFinals.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWCMatch2GrandFinals.mjs
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
  'S2G Esports': 'S2G Esports', // not in Sanity
  'Team Flash': 'Team Flash', // not in Sanity
  '4Thrives Esports': '4Thrives Esports', // not in Sanity
  'Horaa Esports': 'Horaa Esports', // not in Sanity
  'Nongshim RedForce': 'NongShim RedForce',
  'Team Vitality': 'Team Vitality', // not in Sanity
  'Earena': 'eArena',
  'Alula Club Esports': 'AlUla Club Esports',
  'GodLike Esports': 'GodLike Esports',
  'Nigma Galaxy': 'Nigma Galaxy', // not in Sanity
  'ULF Esports': 'ULF Esports',
  'Tianba': 'Tianba Esports',
  'Aurora Gaming': 'Aurora Gaming', // not in Sanity
  'Orangutan': 'Orangutan',
  'IDA Esports': 'IDA Esports', // not in Sanity
  'FURIA': 'FURIA Esports',
}

// Data extracted from the broadcast "MATCH RANKING" graphic (PMWC Grand Finals — Match 2)
const MATCH_RESULTS = [
  { rank: 1, teamName: 'S2G Esports', placement: 10, elim: 9, total: 19 },
  { rank: 2, teamName: 'Team Flash', placement: 6, elim: 6, total: 12 },
  { rank: 3, teamName: '4Thrives Esports', placement: 4, elim: 8, total: 12 },
  { rank: 4, teamName: 'Horaa Esports', placement: 5, elim: 5, total: 10 },
  { rank: 5, teamName: 'Nongshim RedForce', placement: 1, elim: 9, total: 10 },
  { rank: 6, teamName: 'Team Vitality', placement: 2, elim: 6, total: 8 },
  { rank: 7, teamName: 'Earena', placement: 0, elim: 7, total: 7 },
  { rank: 8, teamName: 'Alula Club Esports', placement: 1, elim: 3, total: 4 },
  { rank: 9, teamName: 'GodLike Esports', placement: 0, elim: 4, total: 4 },
  { rank: 10, teamName: 'Nigma Galaxy', placement: 3, elim: 0, total: 3 },
  { rank: 11, teamName: 'ULF Esports', placement: 0, elim: 2, total: 2 },
  { rank: 12, teamName: 'Tianba', placement: 0, elim: 2, total: 2 },
  { rank: 13, teamName: 'Aurora Gaming', placement: 0, elim: 1, total: 1 },
  { rank: 14, teamName: 'Orangutan', placement: 0, elim: 1, total: 1 },
  { rank: 15, teamName: 'IDA Esports', placement: 0, elim: 0, total: 0 },
  { rank: 16, teamName: 'FURIA', placement: 0, elim: 0, total: 0 },
]

const EDITION_ID = 'edition-pubg-mobile-world-cup-2026'

async function main() {
  console.log(`\n🚀 PMWC Grand Finals Match 2 seed — DRY=${DRY}\n`)

  const edition = await readClient.fetch(
    `*[_type == "tournamentEdition" && _id == $id][0]{ _id, "tournamentId": tournament._ref }`,
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

  const teamNames = MATCH_RESULTS.map((r) => r.teamName)
  const teams = await readClient.fetch(`*[_type == "team"]{ _id, name }`)

  console.log(`✅ Fetched ${teams.length} teams from Sanity`)
  const teamByName = new Map(teams.map((t) => [t.name.trim(), t._id]))
  const resolveTeam = (broadcastName) => teamByName.get((NAME_MAP[broadcastName] || broadcastName).trim())
  console.log(`✅ Matched ${teamNames.filter((n) => resolveTeam(n)).length}/${teamNames.length} teams`)

  const matchDoc = {
    _type: 'match',
    _id: `pmwc-2026-gf-match-2`,
    tournament: { _type: 'reference', _ref: tournamentId },
    edition: { _type: 'reference', _ref: editionId },
    matchNumber: 2,
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
    _id: `pmwc-2026-gf-standing-match-2`,
    title: 'PMWC 2026 Grand Finals — Match 2 Standings',
    tournament: { _type: 'reference', _ref: tournamentId },
    edition: { _type: 'reference', _ref: editionId },
    stage: 'grand_finals',
    afterMatch: 2,
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

    console.log('\n✅ Done. Match/Standings pages are fully dynamic SSR — no redeploy or ISR needed, this is live immediately.\n')
  }
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
