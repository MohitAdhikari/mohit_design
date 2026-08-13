/**
 * scripts/patchStandingNulls.mjs
 * Patches Day 1 + Day 2 standing rows 7–16 with real kills/placementPoints.
 * DRY=false node --env-file=.env.local scripts/patchStandingNulls.mjs
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

// Full 16-team rows — all real data, zero nulls
// Source: Liquipedia PMWC 2026 Survival Stage verified Aug 11 2026
const ROWS = [
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
].map(r => ({ _type: 'standingRow', ...r, _key: nanoid() }))

async function patch(id) {
  if (DRY) { console.log(`[DRY PATCH] ${id}`); return }
  await client.patch(id).set({
    rows: ROWS,
    lastUpdated: '2026-08-11',
    tournament: { _type: 'reference', _ref: 'tournament-pubg-mobile-world-cup' },
  }).commit()
  console.log(`[✓ PATCH] ${id}`)
}

async function main() {
  console.log(`\n🔧 Patching standing nulls — DRY=${DRY}\n`)
  await patch('standing-pmwc-2026-survival-day1')
  await patch('standing-pmwc-2026-survival-day2')
  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false.' : '✅ Both standings patched.'}\n`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
