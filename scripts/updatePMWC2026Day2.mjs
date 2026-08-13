import { createClient } from '@sanity/client'
import { nanoid } from 'nanoid'

const DRY       = process.env.DRY   !== 'false'
const MATCH_NUM = parseInt(process.env.MATCH ?? '7', 10)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const EDITION_ID  = 'edition-pubg-mobile-world-cup-2026'
const STANDING_ID = 'standing-pmwc-2026-survival-day2'
const MAP = { 7:'Rondo', 8:'Erangel', 9:'Erangel', 10:'Erangel', 11:'Miramar', 12:'Miramar' }

const RESULTS = {
  7: [
    { teamName:'GOAT Team',          placement:1,  kills:15, points:25 },
    { teamName:'RRQ RYU',            placement:2,  kills:9,  points:14 },
    { teamName:'Yangon Galacticos',  placement:3,  kills:7,  points:13 },
    { teamName:'Alpha7 Esports',     placement:4,  kills:9,  points:13 },
    { teamName:'AlUla Club Esports', placement:5,  kills:12, points:12 },
    { teamName:'Wolves Esports',     placement:6,  kills:8,  points:10 },
    { teamName:'AG.AL',              placement:7,  kills:5,  points:8  },
    { teamName:'FURIA Esports',      placement:8,  kills:8,  points:8  },
    { teamName:'GS 721',             placement:9,  kills:5,  points:5  },
    { teamName:'Geekay Esports',     placement:10, kills:5,  points:5  },
    { teamName:'eArena',             placement:11, kills:5,  points:5  },
    { teamName:'ULF Esports',        placement:12, kills:3,  points:4  },
    { teamName:'NongShim RedForce',  placement:13, kills:4,  points:4  },
    { teamName:'Tianba',             placement:14, kills:1,  points:2  },
    { teamName:'Kiwoom DRX',         placement:15, kills:2,  points:2  },
    { teamName:'DOPENESS',           placement:16, kills:1,  points:1  },
  ],
  8: [
    { teamName:'eArena',             placement:1,  kills:7,  points:17 },
    { teamName:'AG.AL',              placement:2,  kills:11, points:15 },
    { teamName:'Alpha7 Esports',     placement:3,  kills:5,  points:11 },
    { teamName:'Kiwoom DRX',         placement:4,  kills:4,  points:9  },
    { teamName:'GOAT Team',          placement:5,  kills:8,  points:8  },
    { teamName:'AlUla Club Esports', placement:6,  kills:3,  points:6  },
    { teamName:'DOPENESS',           placement:7,  kills:4,  points:6  },
    { teamName:'NongShim RedForce',  placement:8,  kills:5,  points:6  },
    { teamName:'Geekay Esports',     placement:9,  kills:6,  points:6  },
    { teamName:'Tianba',             placement:10, kills:5,  points:5  },
    { teamName:'GS 721',             placement:11, kills:0,  points:1  },
    { teamName:'Yangon Galacticos',  placement:12, kills:1,  points:1  },
    { teamName:'RRQ RYU',            placement:13, kills:1,  points:1  },
    { teamName:'ULF Esports',        placement:14, kills:0,  points:0  },
    { teamName:'FURIA Esports',      placement:15, kills:0,  points:0  },
    { teamName:'Wolves Esports',     placement:16, kills:0,  points:0  },
  ],
  9: [
    { teamName:'ULF Esports',        placement:1,  kills:12, points:22 },
    { teamName:'Wolves Esports',     placement:2,  kills:11, points:17 },
    { teamName:'FURIA Esports',      placement:3,  kills:6,  points:10 },
    { teamName:'Tianba',             placement:4,  kills:6,  points:9  },
    { teamName:'AlUla Club Esports', placement:5,  kills:3,  points:8  },
    { teamName:'Geekay Esports',     placement:6,  kills:6,  points:8  },
    { teamName:'eArena',             placement:7,  kills:4,  points:4  },
    { teamName:'NongShim RedForce',  placement:8,  kills:4,  points:4  },
    { teamName:'Alpha7 Esports',     placement:9,  kills:1,  points:2  },
    { teamName:'GS 721',             placement:10, kills:2,  points:2  },
    { teamName:'DOPENESS',           placement:11, kills:2,  points:2  },
    { teamName:'AG.AL',              placement:12, kills:2,  points:2  },
    { teamName:'RRQ RYU',            placement:13, kills:0,  points:1  },
    { teamName:'GOAT Team',          placement:14, kills:1,  points:1  },
    { teamName:'Yangon Galacticos',  placement:15, kills:0,  points:0  },
    { teamName:'Kiwoom DRX',         placement:16, kills:0,  points:0  },
  ],
  10: [
    { teamName:'Kiwoom DRX',         placement:1,  kills:8,  points:18 },
    { teamName:'NongShim RedForce',  placement:2,  kills:12, points:18 },
    { teamName:'FURIA Esports',      placement:3,  kills:8,  points:12 },
    { teamName:'GS 721',             placement:4,  kills:7,  points:10 },
    { teamName:'Tianba',             placement:5,  kills:6,  points:7  },
    { teamName:'ULF Esports',        placement:6,  kills:1,  points:6  },
    { teamName:'Geekay Esports',     placement:7,  kills:3,  points:5  },
    { teamName:'AlUla Club Esports', placement:8,  kills:4,  points:4  },
    { teamName:'RRQ RYU',            placement:9,  kills:1,  points:2  },
    { teamName:'DOPENESS',           placement:10, kills:2,  points:2  },
    { teamName:'Alpha7 Esports',     placement:11, kills:2,  points:2  },
    { teamName:'Wolves Esports',     placement:12, kills:2,  points:2  },
    { teamName:'AG.AL',              placement:13, kills:1,  points:1  },
    { teamName:'Yangon Galacticos',  placement:14, kills:1,  points:1  },
    { teamName:'GOAT Team',          placement:15, kills:1,  points:1  },
    { teamName:'eArena',             placement:16, kills:0,  points:0  },
  ],  11: [
    { teamName:'AlUla Club Esports', placement:1, kills:13, points:23 },
    { teamName:'DOPENESS', placement:2, kills:9, points:15 },
    { teamName:'Wolves Esports', placement:3, kills:7, points:12 },
    { teamName:'GOAT Team', placement:4, kills:5, points:9 },
    { teamName:'Tianba', placement:5, kills:6, points:9 },
    { teamName:'RRQ RYU', placement:6, kills:5, points:7 },
    { teamName:'Kiwoom DRX', placement:7, kills:4, points:5 },
    { teamName:'Yangon Galacticos', placement:8, kills:3, points:4 },
    { teamName:'NongShim RedForce', placement:9, kills:4, points:4 },
    { teamName:'ULF Esports', placement:10, kills:3, points:3 },
    { teamName:'eArena', placement:11, kills:1, points:1 },
    { teamName:'GS 721', placement:12, kills:1, points:1 },
    { teamName:'Geekay Esports', placement:13, kills:0, points:0 },
    { teamName:'FURIA Esports', placement:14, kills:0, points:0 },
    { teamName:'Alpha7 Esports', placement:15, kills:0, points:0 },
    { teamName:'AG.AL', placement:16, kills:0, points:0 },
  ],
  12: [
    { teamName:'ULF Esports', placement:1, kills:7, points:17 },
    { teamName:'eArena', placement:2, kills:5, points:11 },
    { teamName:'DOPENESS', placement:3, kills:4, points:9 },
    { teamName:'NongShim RedForce', placement:4, kills:10, points:14 },
    { teamName:'AG.AL', placement:5, kills:9, points:12 },
    { teamName:'AlUla Club Esports', placement:6, kills:7, points:9 },
    { teamName:'FURIA Esports', placement:7, kills:5, points:6 },
    { teamName:'Wolves Esports', placement:8, kills:0, points:1 },
    { teamName:'RRQ RYU', placement:9, kills:3, points:3 },
    { teamName:'Yangon Galacticos', placement:10, kills:3, points:3 },
    { teamName:'Kiwoom DRX', placement:11, kills:3, points:3 },
    { teamName:'Tianba', placement:12, kills:2, points:2 },
    { teamName:'GOAT Team', placement:13, kills:2, points:2 },
    { teamName:'Alpha7 Esports', placement:14, kills:2, points:2 },
    { teamName:'Geekay Esports', placement:15, kills:0, points:0 },
    { teamName:'GS 721', placement:16, kills:0, points:0 },
  ],
}

const STANDINGS = {
  7: [
    { rank:1,  teamName:'Tianba',            points:77,  kills:45, placementPoints:32, wwcd:2, matchesPlayed:7 },
    { rank:2,  teamName:'GOAT Team',          points:57,  kills:43, placementPoints:14, wwcd:1, matchesPlayed:7 },
    { rank:3,  teamName:'FURIA Esports',      points:57,  kills:42, placementPoints:15, wwcd:0, matchesPlayed:7 },
    { rank:4,  teamName:'Alpha7 Esports',     points:55,  kills:39, placementPoints:16, wwcd:0, matchesPlayed:7 },
    { rank:5,  teamName:'RRQ RYU',            points:49,  kills:37, placementPoints:12, wwcd:0, matchesPlayed:7 },
    { rank:6,  teamName:'Wolves Esports',     points:47,  kills:35, placementPoints:12, wwcd:0, matchesPlayed:7 },
    { rank:7,  teamName:'Geekay Esports',     points:46,  kills:30, placementPoints:16, wwcd:1, matchesPlayed:7 },
    { rank:8,  teamName:'eArena',             points:46,  kills:29, placementPoints:17, wwcd:0, matchesPlayed:7 },
    { rank:9,  teamName:'Yangon Galacticos',  points:44,  kills:26, placementPoints:18, wwcd:0, matchesPlayed:7 },
    { rank:10, teamName:'NongShim RedForce',  points:43,  kills:24, placementPoints:19, wwcd:1, matchesPlayed:7 },
    { rank:11, teamName:'AlUla Club Esports', points:41,  kills:32, placementPoints:9,  wwcd:0, matchesPlayed:7 },
    { rank:12, teamName:'AG.AL',              points:40,  kills:25, placementPoints:15, wwcd:1, matchesPlayed:7 },
    { rank:13, teamName:'ULF Esports',        points:36,  kills:25, placementPoints:11, wwcd:0, matchesPlayed:7 },
    { rank:14, teamName:'DOPENESS',           points:32,  kills:22, placementPoints:10, wwcd:1, matchesPlayed:7 },
    { rank:15, teamName:'GS 721',             points:31,  kills:24, placementPoints:7,  wwcd:0, matchesPlayed:7 },
    { rank:16, teamName:'Kiwoom DRX',         points:12,  kills:11, placementPoints:1,  wwcd:0, matchesPlayed:7 },
  ],
  8: [
    { rank:1,  teamName:'Tianba',            points:82,  kills:50, placementPoints:32, wwcd:2, matchesPlayed:8 },
    { rank:2,  teamName:'Alpha7 Esports',    points:66,  kills:44, placementPoints:22, wwcd:0, matchesPlayed:8 },
    { rank:3,  teamName:'GOAT Team',          points:65,  kills:51, placementPoints:14, wwcd:1, matchesPlayed:8 },
    { rank:4,  teamName:'eArena',             points:63,  kills:36, placementPoints:27, wwcd:1, matchesPlayed:8 },
    { rank:5,  teamName:'FURIA Esports',      points:57,  kills:42, placementPoints:15, wwcd:0, matchesPlayed:8 },
    { rank:6,  teamName:'AG.AL',              points:55,  kills:36, placementPoints:19, wwcd:2, matchesPlayed:8 },
    { rank:7,  teamName:'Geekay Esports',     points:52,  kills:36, placementPoints:16, wwcd:1, matchesPlayed:8 },
    { rank:8,  teamName:'RRQ RYU',            points:50,  kills:38, placementPoints:12, wwcd:0, matchesPlayed:8 },
    { rank:9,  teamName:'NongShim RedForce',  points:49,  kills:29, placementPoints:20, wwcd:1, matchesPlayed:8 },
    { rank:10, teamName:'Wolves Esports',     points:47,  kills:35, placementPoints:12, wwcd:0, matchesPlayed:8 },
    { rank:11, teamName:'AlUla Club Esports', points:47,  kills:35, placementPoints:12, wwcd:0, matchesPlayed:8 },
    { rank:12, teamName:'Yangon Galacticos',  points:45,  kills:27, placementPoints:18, wwcd:0, matchesPlayed:8 },
    { rank:13, teamName:'DOPENESS',           points:38,  kills:26, placementPoints:12, wwcd:1, matchesPlayed:8 },
    { rank:14, teamName:'ULF Esports',        points:36,  kills:25, placementPoints:11, wwcd:0, matchesPlayed:8 },
    { rank:15, teamName:'GS 721',             points:32,  kills:24, placementPoints:8,  wwcd:0, matchesPlayed:8 },
    { rank:16, teamName:'Kiwoom DRX',         points:21,  kills:15, placementPoints:6,  wwcd:0, matchesPlayed:8 },
  ],
  9: [
    { rank:1,  teamName:'Tianba',            points:91,  kills:56, placementPoints:35, wwcd:2, matchesPlayed:9 },
    { rank:2,  teamName:'Alpha7 Esports',    points:68,  kills:45, placementPoints:23, wwcd:0, matchesPlayed:9 },
    { rank:3,  teamName:'FURIA Esports',     points:67,  kills:48, placementPoints:19, wwcd:0, matchesPlayed:9 },
    { rank:4,  teamName:'eArena',            points:67,  kills:40, placementPoints:27, wwcd:1, matchesPlayed:9 },
    { rank:5,  teamName:'GOAT Team',         points:66,  kills:52, placementPoints:14, wwcd:1, matchesPlayed:9 },
    { rank:6,  teamName:'Wolves Esports',    points:64,  kills:46, placementPoints:18, wwcd:0, matchesPlayed:9 },
    { rank:7,  teamName:'Geekay Esports',    points:60,  kills:42, placementPoints:18, wwcd:1, matchesPlayed:9 },
    { rank:8,  teamName:'ULF Esports',       points:58,  kills:37, placementPoints:21, wwcd:1, matchesPlayed:9 },
    { rank:9,  teamName:'AG.AL',             points:57,  kills:38, placementPoints:19, wwcd:2, matchesPlayed:9 },
    { rank:10, teamName:'AlUla Club Esports',points:55,  kills:38, placementPoints:17, wwcd:0, matchesPlayed:9 },
    { rank:11, teamName:'NongShim RedForce', points:53,  kills:33, placementPoints:20, wwcd:1, matchesPlayed:9 },
    { rank:12, teamName:'RRQ RYU',           points:51,  kills:38, placementPoints:13, wwcd:0, matchesPlayed:9 },
    { rank:13, teamName:'Yangon Galacticos', points:45,  kills:27, placementPoints:18, wwcd:0, matchesPlayed:9 },
    { rank:14, teamName:'DOPENESS',          points:40,  kills:28, placementPoints:12, wwcd:1, matchesPlayed:9 },
    { rank:15, teamName:'GS 721',            points:34,  kills:26, placementPoints:8,  wwcd:0, matchesPlayed:9 },
    { rank:16, teamName:'Kiwoom DRX',        points:21,  kills:15, placementPoints:6,  wwcd:0, matchesPlayed:9 },
  ],
  10: [
    { rank:1,  teamName:'Tianba',            points:98,  kills:62, placementPoints:36, wwcd:2,  matchesPlayed:10 },
    { rank:2,  teamName:'FURIA Esports',     points:79,  kills:56, placementPoints:23, wwcd:0,  matchesPlayed:10 },
    { rank:3,  teamName:'NongShim RedForce', points:71,  kills:45, placementPoints:26, wwcd:2,  matchesPlayed:10 },
    { rank:4,  teamName:'Alpha7 Esports',    points:70,  kills:47, placementPoints:23, wwcd:0,  matchesPlayed:10 },
    { rank:5,  teamName:'GOAT Team',         points:67,  kills:53, placementPoints:14, wwcd:1,  matchesPlayed:10 },
    { rank:6,  teamName:'eArena',            points:67,  kills:40, placementPoints:27, wwcd:1,  matchesPlayed:10 },
    { rank:7,  teamName:'Wolves Esports',    points:66,  kills:48, placementPoints:18, wwcd:0,  matchesPlayed:10 },
    { rank:8,  teamName:'Geekay Esports',    points:65,  kills:45, placementPoints:20, wwcd:1,  matchesPlayed:10 },
    { rank:9,  teamName:'ULF Esports',       points:64,  kills:38, placementPoints:26, wwcd:1,  matchesPlayed:10 },
    { rank:10, teamName:'AlUla Club Esports',points:59,  kills:42, placementPoints:17, wwcd:0,  matchesPlayed:10 },
    { rank:11, teamName:'AG.AL',             points:58,  kills:39, placementPoints:19, wwcd:2,  matchesPlayed:10 },
    { rank:12, teamName:'RRQ RYU',           points:53,  kills:39, placementPoints:14, wwcd:0,  matchesPlayed:10 },
    { rank:13, teamName:'Yangon Galacticos', points:46,  kills:28, placementPoints:18, wwcd:0,  matchesPlayed:10 },
    { rank:14, teamName:'GS 721',            points:44,  kills:33, placementPoints:11, wwcd:0,  matchesPlayed:10 },
    { rank:15, teamName:'DOPENESS',          points:42,  kills:30, placementPoints:12, wwcd:1,  matchesPlayed:10 },
    { rank:16, teamName:'Kiwoom DRX',        points:39,  kills:23, placementPoints:16, wwcd:1,  matchesPlayed:10 },
  ],  11: [
    { rank:1, teamName:'Tianba', points:107, kills:68, placementPoints:39, wwcd:2, matchesPlayed:11 },
    { rank:2, teamName:'AlUla Club Esports', points:82, kills:55, placementPoints:27, wwcd:1, matchesPlayed:11 },
    { rank:3, teamName:'FURIA Esports', points:79, kills:56, placementPoints:23, wwcd:0, matchesPlayed:11 },
    { rank:4, teamName:'Wolves Esports', points:78, kills:55, placementPoints:23, wwcd:0, matchesPlayed:11 },
    { rank:5, teamName:'GOAT Team', points:76, kills:58, placementPoints:18, wwcd:1, matchesPlayed:11 },
    { rank:6, teamName:'NongShim RedForce', points:75, kills:49, placementPoints:26, wwcd:2, matchesPlayed:11 },
    { rank:7, teamName:'Alpha7 Esports', points:70, kills:47, placementPoints:23, wwcd:0, matchesPlayed:11 },
    { rank:8, teamName:'eArena', points:68, kills:41, placementPoints:27, wwcd:1, matchesPlayed:11 },
    { rank:9, teamName:'ULF Esports', points:67, kills:41, placementPoints:26, wwcd:1, matchesPlayed:11 },
    { rank:10, teamName:'Geekay Esports', points:65, kills:45, placementPoints:20, wwcd:1, matchesPlayed:11 },
    { rank:11, teamName:'RRQ RYU', points:60, kills:44, placementPoints:16, wwcd:0, matchesPlayed:11 },
    { rank:12, teamName:'AG.AL', points:58, kills:39, placementPoints:19, wwcd:2, matchesPlayed:11 },
    { rank:13, teamName:'DOPENESS', points:57, kills:39, placementPoints:18, wwcd:1, matchesPlayed:11 },
    { rank:14, teamName:'Yangon Galacticos', points:50, kills:31, placementPoints:19, wwcd:0, matchesPlayed:11 },
    { rank:15, teamName:'GS 721', points:45, kills:34, placementPoints:11, wwcd:0, matchesPlayed:11 },
    { rank:16, teamName:'Kiwoom DRX', points:44, kills:27, placementPoints:17, wwcd:1, matchesPlayed:11 },
  ],
  12: [
    { rank:1, teamName:'Tianba', points:109, kills:70, placementPoints:39, wwcd:2, matchesPlayed:12, qualified:true },
    { rank:2, teamName:'AlUla Club Esports', points:91, kills:62, placementPoints:29, wwcd:1, matchesPlayed:12, qualified:true },
    { rank:3, teamName:'NongShim RedForce', points:89, kills:59, placementPoints:30, wwcd:2, matchesPlayed:12, qualified:true },
    { rank:4, teamName:'FURIA Esports', points:85, kills:61, placementPoints:24, wwcd:0, matchesPlayed:12, qualified:true },
    { rank:5, teamName:'ULF Esports', points:84, kills:48, placementPoints:36, wwcd:2, matchesPlayed:12, qualified:true },
    { rank:6, teamName:'eArena', points:79, kills:46, placementPoints:33, wwcd:1, matchesPlayed:12, qualified:true },
    { rank:7, teamName:'Wolves Esports', points:79, kills:55, placementPoints:24, wwcd:0, matchesPlayed:12, eliminated:true },
    { rank:8, teamName:'GOAT Team', points:78, kills:60, placementPoints:18, wwcd:1, matchesPlayed:12, eliminated:true },
    { rank:9, teamName:'Alpha7 Esports', points:72, kills:49, placementPoints:23, wwcd:0, matchesPlayed:12, eliminated:true },
    { rank:10, teamName:'AG.AL', points:70, kills:48, placementPoints:22, wwcd:2, matchesPlayed:12, eliminated:true },
    { rank:11, teamName:'DOPENESS', points:66, kills:43, placementPoints:23, wwcd:1, matchesPlayed:12, eliminated:true },
    { rank:12, teamName:'Geekay Esports', points:65, kills:45, placementPoints:20, wwcd:1, matchesPlayed:12, eliminated:true },
    { rank:13, teamName:'RRQ RYU', points:63, kills:47, placementPoints:16, wwcd:0, matchesPlayed:12, eliminated:true },
    { rank:14, teamName:'Yangon Galacticos', points:53, kills:34, placementPoints:19, wwcd:0, matchesPlayed:12, eliminated:true },
    { rank:15, teamName:'Kiwoom DRX', points:47, kills:30, placementPoints:17, wwcd:1, matchesPlayed:12, eliminated:true },
    { rank:16, teamName:'GS 721', points:45, kills:34, placementPoints:11, wwcd:0, matchesPlayed:12, eliminated:true },
  ],
}

const NAME_TO_SLUG = {
  'Tianba':      'tianba-esports',
  'Kiwoom DRX':  'drx',
}
function slugify(n) {
  if (NAME_TO_SLUG[n]) return NAME_TO_SLUG[n]
  return n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}

async function main() {
  console.log(`\n🎮 PMWC 2026 Day 2 — Match ${MATCH_NUM} (${MAP[MATCH_NUM]}) — DRY=${DRY}\n`)
  const results   = RESULTS[MATCH_NUM]
  const standings = STANDINGS[MATCH_NUM]
  if (!Array.isArray(results) || results.length === 0) {
    console.error(`❌ No data in RESULTS[${MATCH_NUM}] — paste results and re-run.`)
    process.exit(1)
  }
  const teams = await client.fetch(`*[_type=="team"]{ _id, "slug": slug.current }`)
  const tm = {}
  for (const t of teams) if (t.slug) tm[t.slug] = t._id
  console.log(`  ${Object.keys(tm).length} teams loaded\n`)

  const participants = results.map(r => {
    const id = tm[slugify(r.teamName)] ?? null
    if (!id) console.warn(`  ⚠️  "${r.teamName}" not found → teamName fallback`)
    return {
      _key: nanoid(), _type:'matchParticipant',
      ...(id ? { team:{ _type:'reference', _ref:id } } : { teamName:r.teamName }),
      placement: r.placement, kills: r.kills,
      placementPoints: r.points - r.kills, points: r.points,
    }
  })

  const matchDoc = {
    _id: `match-pmwc-2026-survival-m${MATCH_NUM}`,
    _type:'match', matchFormat:'battle_royale',
    edition:{ _type:'reference', _ref:EDITION_ID },
    tournament:{ _type:'reference', _ref:'tournament-pubg-mobile-world-cup' },
    stage:'survival_stage', matchNumber:MATCH_NUM,
    map:MAP[MATCH_NUM], status:'completed',
    scheduledAt:'2026-08-12T00:00:00Z', participants,
  }
  if (DRY) { console.log(`  [DRY] match ${matchDoc._id}`) }
  else { await client.createOrReplace(matchDoc); console.log(`  [✓] ${matchDoc._id}`) }

  if (standings) {
    const rows = standings.map(r => ({ _type: 'standingRow', ...r, _key:nanoid() }))
    if (DRY) { console.log(`  [DRY PATCH] standing — ${rows.length} rows`) }
    else {
      await client.patch(STANDING_ID).set({ rows, lastUpdated:new Date().toISOString().split('T')[0], tournament:{ _type:'reference', _ref:'tournament-pubg-mobile-world-cup' } }).commit()
      console.log(`  [✓ PATCH] standing updated`)
    }
  } else {
    console.log(`  ⚠️  No standings for Match ${MATCH_NUM} yet`)
  }

  if (MATCH_NUM === 12 && !DRY) {
    await client.patch(EDITION_ID).set({ tournamentStatus:'grand_finals' }).commit()
    console.log('  [✓] tournamentStatus → grand_finals')
  }

  console.log(`\n${DRY ? `✅ DRY — run: DRY=false MATCH=${MATCH_NUM} node --env-file=.env.local scripts/updatePMWC2026Day2.mjs` : `✅ Match ${MATCH_NUM} live.`}\n`)
}
main().catch(e => { console.error('❌', e.message); process.exit(1) })
