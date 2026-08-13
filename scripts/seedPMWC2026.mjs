/**
 * scripts/seedPMWC2026.mjs
 * Seeds PMWC 2026 Survival Stage data into Sanity.
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/seedPMWC2026.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/seedPMWC2026.mjs
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

const EDITION_ID = 'edition-pubg-mobile-world-cup-2026'

async function buildTeamMap() {
  const teams = await client.fetch(`*[_type == "team"]{ _id, "slug": slug.current, name }`)
  const map = {}
  for (const t of teams) { if (t.slug) map[t.slug] = t._id }
  return map
}

function participant(teamId, teamName, placement, kills, points) {
  return {
    _key: nanoid(),
    _type: 'matchParticipant',
    ...(teamId ? { team: { _type: 'reference', _ref: teamId } } : { teamName }),
    placement, kills,
    placementPoints: points - kills,
    points,
  }
}

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

async function main() {
  console.log(`\n🚀 PMWC 2026 Survival Stage seed — DRY=${DRY}\n`)

  const edition = await client.fetch(`*[_id == $id][0]{ _id }`, { id: EDITION_ID })
  if (!edition) {
    console.error(`❌ Edition not found: ${EDITION_ID}`)
    console.error('   Open Sanity Studio → Tournament Edition → find PMWC 2026 → copy its _id → paste into EDITION_ID in this script')
    process.exit(1)
  }
  console.log('✅ Edition found:', EDITION_ID)

  const teamMap = await buildTeamMap()
  console.log(`✅ ${Object.keys(teamMap).length} teams loaded\n`)

  function tid(slug) {
    if (teamMap[slug]) return teamMap[slug]
    console.warn(`⚠️  Slug not found: "${slug}" — fallback to teamName`)
    return null
  }

  // 1. Set status
  await patch(EDITION_ID, { tournamentStatus: 'survival_stage' })

  // 2. Day 1 standing
  await save({
    _id: 'standing-pmwc-2026-survival-day1',
    _type: 'standing',
    title: 'Survival Stage — Day 1 Overall',
    tournament: { _type: 'reference', _ref: 'tournament-pubg-mobile-world-cup' },
    edition: { _type: 'reference', _ref: EDITION_ID },
    stage: 'survival_stage',
    day: 1,
    status: 'published',
    lastUpdated: '2026-08-11',
    rows: [
      { rank:1,  teamName:'Tianba',             wwcd:2, placementPoints:31, kills:44, matchesPlayed:6, points:75 },
      { rank:2,  teamName:'FURIA Esports',       wwcd:0, placementPoints:15, kills:34, matchesPlayed:6, points:49 },
      { rank:3,  teamName:'Alpha7 Esports',      wwcd:0, placementPoints:12, kills:30, matchesPlayed:6, points:42 },
      { rank:4,  teamName:'Geekay Esports',      wwcd:1, placementPoints:16, kills:25, matchesPlayed:6, points:41 },
      { rank:5,  teamName:'eArena',              wwcd:0, placementPoints:17, kills:24, matchesPlayed:6, points:41 },
      { rank:6,  teamName:'NongShim RedForce',   wwcd:1, placementPoints:19, kills:20, matchesPlayed:6, points:39 },
      { rank:7,  teamName:'Wolves Esports',      wwcd:0, placementPoints:10, kills:27, matchesPlayed:6, points:37 },
      { rank:8,  teamName:'RRQ RYU',             wwcd:0, placementPoints:7,  kills:28, matchesPlayed:6, points:35 },
      { rank:9,  teamName:'AG.AL',               wwcd:1, placementPoints:12, kills:20, matchesPlayed:6, points:32 },
      { rank:10, teamName:'ULF Esports',         wwcd:0, placementPoints:10, kills:22, matchesPlayed:6, points:32 },
      { rank:11, teamName:'GOAT Team',           wwcd:0, placementPoints:4,  kills:28, matchesPlayed:6, points:32 },
      { rank:12, teamName:'DOPENESS',            wwcd:1, placementPoints:10, kills:21, matchesPlayed:6, points:31 },
      { rank:13, teamName:'Yangon Galacticos',   wwcd:0, placementPoints:12, kills:19, matchesPlayed:6, points:31 },
      { rank:14, teamName:'AlUla Club Esports',  wwcd:0, placementPoints:9,  kills:20, matchesPlayed:6, points:29 },
      { rank:15, teamName:'GS 721',              wwcd:0, placementPoints:7,  kills:19, matchesPlayed:6, points:26 },
      { rank:16, teamName:'Kiwoom DRX',          wwcd:0, placementPoints:1,  kills:9,  matchesPlayed:6, points:10, eliminated:true },
    ].map(r => ({ _type: 'standingRow', ...r, _key: nanoid() })),
  })

  // 3. Matches 1–6
  const base = {
    _type: 'match', matchFormat: 'battle_royale',
    edition: { _type: 'reference', _ref: EDITION_ID },
    stage: 'survival_stage', status: 'completed',
    scheduledAt: '2026-08-11T00:00:00Z',
  }

  await save({ ...base, _id:'match-pmwc-2026-survival-m1', matchNumber:1, map:'Rondo', participants:[
    participant(tid('tianba-esports'),'Tianba',1,13,23),
    participant(tid('alula-club-esports'),'AlUla Club Esports',2,6,16),
    participant(tid('nongshim-redforce'),'NongShim RedForce',3,3,13),
    participant(tid('earena'),'eArena',4,1,11),
    participant(tid('geekay-esports'),'Geekay Esports',5,0,10),
    participant(tid('goat-team'),'GOAT Team',6,0,10),
  ]})

  await save({ ...base, _id:'match-pmwc-2026-survival-m2', matchNumber:2, map:'Erangel', participants:[
    participant(tid('tianba-esports'),'Tianba',1,12,22),
    participant(tid('furia-esports'),'FURIA Esports',2,2,12),
    participant(tid('goat-team'),'GOAT Team',3,0,9),
    participant(tid('ulf-esports'),'ULF Esports',4,0,9),
    participant(tid('rrq-ryu'),'RRQ RYU',5,0,7),
    participant(tid('earena'),'eArena',6,0,6),
  ]})

  await save({ ...base, _id:'match-pmwc-2026-survival-m3', matchNumber:3, map:'Erangel', participants:[
    participant(tid('nongshim-redforce'),'NongShim RedForce',1,8,18),
    participant(tid('furia-esports'),'FURIA Esports',2,3,13),
    participant(tid('rrq-ryu'),'RRQ RYU',3,3,13),
    participant(tid('alpha7-esports'),'Alpha7 Esports',4,0,10),
    participant(tid('gs-721'),'GS 721',5,0,10),
    participant(tid('yangon-galacticos'),'Yangon Galacticos',6,0,9),
  ]})

  await save({ ...base, _id:'match-pmwc-2026-survival-m4', matchNumber:4, map:'Erangel', participants:[
    participant(tid('geekay-esports'),'Geekay Esports',1,10,20),
    participant(tid('alpha7-esports'),'Alpha7 Esports',2,5,15),
    participant(tid('tianba-esports'),'Tianba',3,2,12),
    participant(tid('earena'),'eArena',4,0,9),
    participant(tid('drx'),'Kiwoom DRX',5,0,6),
    participant(tid('ag-al'),'AG.AL',6,0,5),
  ]})

  await save({ ...base, _id:'match-pmwc-2026-survival-m5', matchNumber:5, map:'Miramar', participants:[
    participant(tid('dopeness'),'DOPENESS',1,11,21),
    participant(tid('tianba-esports'),'Tianba',2,4,14),
    participant(tid('furia-esports'),'FURIA Esports',3,4,14),
    participant(tid('alula-club-esports'),'AlUla Club Esports',4,0,9),
    participant(tid('ulf-esports'),'ULF Esports',5,0,8),
    participant(tid('gs-721'),'GS 721',6,0,7),
  ]})

  await save({ ...base, _id:'match-pmwc-2026-survival-m6', matchNumber:6, map:'Miramar', participants:[
    participant(tid('ag-al'),'AG.AL',1,8,18),
    participant(tid('wolves-esports'),'Wolves Esports',2,7,17),
    participant(tid('earena'),'eArena',3,0,10),
    participant(tid('yangon-galacticos'),'Yangon Galacticos',4,0,9),
  ]})

  // 4. Day 2 standing (starts from Day 1 totals, update live)
  await save({
    _id: 'standing-pmwc-2026-survival-day2',
    _type: 'standing',
    title: 'Survival Stage — Day 2 (Live)',
    tournament: { _type: 'reference', _ref: 'tournament-pubg-mobile-world-cup' },
    edition: { _type: 'reference', _ref: EDITION_ID },
    stage: 'survival_stage',
    day: 2,
    status: 'published',
    lastUpdated: '2026-08-12',
    rows: [
      { rank:1,  teamName:'Tianba',             wwcd:2, placementPoints:31, kills:44, matchesPlayed:6, points:75 },
      { rank:2,  teamName:'FURIA Esports',       wwcd:0, placementPoints:15, kills:34, matchesPlayed:6, points:49 },
      { rank:3,  teamName:'Alpha7 Esports',      wwcd:0, placementPoints:12, kills:30, matchesPlayed:6, points:42 },
      { rank:4,  teamName:'Geekay Esports',      wwcd:1, placementPoints:16, kills:25, matchesPlayed:6, points:41 },
      { rank:5,  teamName:'eArena',              wwcd:0, placementPoints:17, kills:24, matchesPlayed:6, points:41 },
      { rank:6,  teamName:'NongShim RedForce',   wwcd:1, placementPoints:19, kills:20, matchesPlayed:6, points:39 },
      { rank:7,  teamName:'Wolves Esports',      wwcd:0, placementPoints:10, kills:27, matchesPlayed:6, points:37 },
      { rank:8,  teamName:'RRQ RYU',             wwcd:0, placementPoints:7,  kills:28, matchesPlayed:6, points:35 },
      { rank:9,  teamName:'AG.AL',               wwcd:1, placementPoints:12, kills:20, matchesPlayed:6, points:32 },
      { rank:10, teamName:'ULF Esports',         wwcd:0, placementPoints:10, kills:22, matchesPlayed:6, points:32 },
      { rank:11, teamName:'GOAT Team',           wwcd:0, placementPoints:4,  kills:28, matchesPlayed:6, points:32 },
      { rank:12, teamName:'DOPENESS',            wwcd:1, placementPoints:10, kills:21, matchesPlayed:6, points:31 },
      { rank:13, teamName:'Yangon Galacticos',   wwcd:0, placementPoints:12, kills:19, matchesPlayed:6, points:31 },
      { rank:14, teamName:'AlUla Club Esports',  wwcd:0, placementPoints:9,  kills:20, matchesPlayed:6, points:29 },
      { rank:15, teamName:'GS 721',              wwcd:0, placementPoints:7,  kills:19, matchesPlayed:6, points:26 },
      { rank:16, teamName:'Kiwoom DRX',          wwcd:0, placementPoints:1,  kills:9,  matchesPlayed:6, points:10, eliminated:true },
    ].map(r => ({ _type: 'standingRow', ...r, _key: nanoid() })),
  })

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ ALL DONE — live in 60 seconds.'}\n`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
