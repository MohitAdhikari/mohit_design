/**
 * scripts/seedPMWC2026Meta.mjs
 * Patches PMWC 2026 edition with:
 *   - Full prize pool (per placement, per stage, USD)
 *   - Stages array (Group / Survival / Finals with dates & format)
 *   - All 32 participants (group A + B, survival, finals)
 *
 * DRY RUN:   node --env-file=.env.local scripts/seedPMWC2026Meta.mjs
 * LIVE:      DRY=false node --env-file=.env.local scripts/seedPMWC2026Meta.mjs
 *
 * Source: Liquipedia / tips.gg / Sportskeeda — verified Aug 2026
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

const EDITION_ID    = 'edition-pubg-mobile-world-cup-2026'
const TOURNAMENT_ID = 'tournament-pubg-mobile-world-cup'

async function patch(id, fields) {
  if (DRY) { console.log('[DRY PATCH]', id, JSON.stringify(fields, null, 2)); return }
  await client.patch(id).set(fields).commit()
  console.log('[PATCHED]', id)
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function pp(placement, usd, notes = '') {
  return {
    _key: nanoid(),
    _type: 'prizePlacement',
    placement,
    prize: usd,
    currency: 'USD',
    notes,
  }
}

// ─── Prize placements ─────────────────────────────────────────────────────────

const GROUP_STAGE_PRIZES = [
  pp('Group 1st',   71000, 'Per group — ×2 paid out'),
  pp('Group 2nd',   65000),
  pp('Group 3rd',   60000),
  pp('Group 4th',   57500),
  pp('Group 5th',   55000),
  pp('Group 6th',   29000),
  pp('Group 7th',   28000),
  pp('Group 8th',   27000),
  pp('Group 9th',   26000),
  pp('Group 10th',  25000),
  pp('Group 11th',  24000),
  pp('Group 12th',  23000),
  pp('Group 13th',  22000),
  pp('Group 14th',  21000, 'Eliminated'),
  pp('Group 15th',  20500, 'Eliminated'),
  pp('Group 16th',  20000, 'Eliminated'),
]

const SURVIVAL_STAGE_PRIZES = [
  pp('Survival 1st',   17000, 'Advances to Grand Finals'),
  pp('Survival 2nd',   16000, 'Advances to Grand Finals'),
  pp('Survival 3rd',   15000, 'Advances to Grand Finals'),
  pp('Survival 4th',   14000, 'Advances to Grand Finals'),
  pp('Survival 5th',   13000, 'Advances to Grand Finals'),
  pp('Survival 6th',   12000, 'Advances to Grand Finals'),
  pp('Survival 7th',   11000, 'Eliminated'),
  pp('Survival 8th',   10000, 'Eliminated'),
  pp('Survival 9th',    9000, 'Eliminated'),
  pp('Survival 10th',   8000, 'Eliminated'),
  pp('Survival 11th',   7000, 'Eliminated'),
  pp('Survival 12th',   6000, 'Eliminated'),
  pp('Survival 13th',   5000, 'Eliminated'),
  pp('Survival 14th',   4000, 'Eliminated'),
  pp('Survival 15th',   3000, 'Eliminated'),
  pp('Survival 16th',   2000, 'Eliminated — Kiwoom DRX'),
]

const GRAND_FINALS_PRIZES = [
  pp('Finals 1st',   500000, 'CHAMPIONS'),
  pp('Finals 2nd',   250000),
  pp('Finals 3rd',   150000),
  pp('Finals 4th',   120000),
  pp('Finals 5th',   100000),
  pp('Finals 6th',    90000),
  pp('Finals 7th',    80000),
  pp('Finals 8th',    70000),
  pp('Finals 9th',    60000),
  pp('Finals 10th',   55000),
  pp('Finals 11th',   50000),
  pp('Finals 12th',   45000),
  pp('Finals 13th',   40000),
  pp('Finals 14th',   35000),
  pp('Finals 15th',   30000),
  pp('Finals 16th',   25000),
  pp('Finals MVP',    25000, 'FMVP individual award'),
]

const ALL_PRIZE_PLACEMENTS = [
  ...GROUP_STAGE_PRIZES,
  ...SURVIVAL_STAGE_PRIZES,
  ...GRAND_FINALS_PRIZES,
]

// ─── Stages ───────────────────────────────────────────────────────────────────

const STAGES = [
  {
    _key: nanoid(), _type: 'stage',
    name: 'Group Stage',
    status: 'completed',
    startDate: '2026-08-06T00:00:00Z',
    endDate:   '2026-08-09T23:59:00Z',
    venue: 'Paris Expo Porte de Versailles, Paris, France',
    format: '2 groups of 16 — 12 matches each. Top 5 → Finals. 6th–13th → Survival. 14th–16th eliminated.',
    totalTeams: 32,
    teamsAdvancing: 10,
    notes: 'Total group stage prize: $1,148,000 ($574,000 per group)',
  },
  {
    _key: nanoid(), _type: 'stage',
    name: 'Survival Stage',
    status: 'completed',
    startDate: '2026-08-11T00:00:00Z',
    endDate:   '2026-08-12T23:59:00Z',
    venue: 'Paris Expo Porte de Versailles, Paris, France',
    format: '16 teams — 12 matches over 2 days. Top 6 → Finals. Bottom 10 eliminated.',
    totalTeams: 16,
    teamsAdvancing: 6,
    notes: 'Total survival stage prize: $152,000',
  },
  {
    _key: nanoid(), _type: 'stage',
    name: 'Grand Finals',
    status: 'live',
    startDate: '2026-08-14T00:00:00Z',
    endDate:   '2026-08-16T23:59:00Z',
    venue: 'Paris Expo Porte de Versailles, Paris, France',
    format: '16 teams (10 direct + 6 survival) — 18 matches over 3 days. Smash Rule on Day 3.',
    totalTeams: 16,
    teamsAdvancing: 1,
    notes: 'Total finals prize: $1,700,000. Smash Rule: 1st place after M12 + 10pts threshold.',
  },
]

// ─── Prize stage breakdown ────────────────────────────────────────────────────

const PRIZE_POOL_STAGES = [
  { _key: nanoid(), _type: 'prizeStage', stageName: 'Group Stage',    stagePool: 1148000, stageCurrency: 'USD', stageNotes: '$574,000 × 2 groups' },
  { _key: nanoid(), _type: 'prizeStage', stageName: 'Survival Stage', stagePool:  152000, stageCurrency: 'USD', stageNotes: '16 teams, 2 days' },
  { _key: nanoid(), _type: 'prizeStage', stageName: 'Grand Finals',   stagePool: 1700000, stageCurrency: 'USD', stageNotes: '16 teams, 3 days. FMVP $25k extra.' },
  { _key: nanoid(), _type: 'prizeStage', stageName: 'Finals MVP',     stagePool:   25000, stageCurrency: 'USD', stageNotes: 'Individual award' },
]

// ─── Participants (all 32 teams) ──────────────────────────────────────────────

function part(teamName, region, group, groupFinish, survivalFinish = null, finalsFinish = null) {
  return {
    _key: nanoid(),
    _type: 'editionParticipant',
    teamName,
    region,
    group,
    groupFinish,
    ...(survivalFinish !== null && { survivalFinish }),
    ...(finalsFinish !== null && { finalsFinish }),
  }
}

const PARTICIPANTS = [
  // Group A
  part('4Thrives Esports',      'South Asia',     'A',  1),
  part('Orangutan',             'South Asia',     'A',  2),
  part('Aurora Gaming',         'East Asia',      'A',  3),
  part('Team Flash',            'Southeast Asia', 'A',  4),
  part('Nigma Galaxy',          'MENA',           'A',  5),
  part('GOAT Team',             'EECA',           'A',  6,  11),
  part('Geekay Esports',        'MENA',           'A',  7,  12),
  part('RRQ RYU',               'Southeast Asia', 'A',  8,   8),
  part('AG.AL',                 'East Asia',      'A',  9,  10),
  part('ULF Esports',           'MENA',           'A', 10,   5),
  part('FURIA Esports',         'Americas',       'A', 11,   4),
  part('AlUla Club Esports',    'MENA',           'A', 12,   2),
  part('Wolves Esports',        'Americas',       'A', 13,   7),
  part('XForce Rejects',        'Americas',       'A', 14),
  part('ThunderTalk Gaming',    'East Asia',      'A', 15),
  part('Gaming Stars Esports',  'MENA',           'A', 16),

  // Group B
  part('Bigetron by Vitality',  'Southeast Asia', 'B',  1),
  part('IDA Esports',           'MENA',           'B',  2),
  part('GodLike Esports',       'South Asia',     'B',  3),
  part('Horaa Esports',         'South Asia',     'B',  4),
  part('S2G Esports',           'MENA',           'B',  5),
  part('NongShim RedForce',     'East Asia',      'B',  6,   3),
  part('Yangon Galacticos',     'Southeast Asia', 'B',  7,  14),
  part('Alpha7 Esports',        'Americas',       'B',  8,   9),
  part('DOPENESS',              'East Asia',      'B',  9,  13),
  part('eArena',                'Southeast Asia', 'B', 10,   6),
  part('ETSH Esports',          'MENA',           'B', 11),
  part('Hustler Crew',          'EECA',           'B', 12),
  part('Tianba',                'East Asia',      'B', 13,   1),
  part('TT Project',            'East Asia',      'B', 14),
  part('GS 721',                '721 Esports',    'B', 15,  15),
  part('Kiwoom DRX',            'East Asia',      'B', 16,  16),
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 PMWC 2026 Meta patch — DRY=${DRY}\n`)

  const edition = await client.fetch(`*[_id == $id][0]{ _id }`, { id: EDITION_ID })
  if (!edition) {
    console.error(`❌ Edition not found: ${EDITION_ID}`)
    process.exit(1)
  }
  console.log('✅ Edition found:', EDITION_ID)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  await patch(EDITION_ID, {
    totalPrizePool:    3025000,
    prizePoolCurrency: 'USD',
    prizePoolDisplay:  '$3,025,000',
    prizePoolStages:   PRIZE_POOL_STAGES,
    prizePlacements:   ALL_PRIZE_PLACEMENTS,
    tournamentStatus:  'grand_finals',
  })

  await sleep(500)

  await patch(EDITION_ID, {
    stages:     STAGES,
    totalTeams: 32,
    format:     'LAN',
    venue:      'Paris Expo Porte de Versailles, Paris, France',
    startDate:  '2026-08-06T00:00:00Z',
    endDate:    '2026-08-16T23:59:00Z',
    liquipediaUrl: 'https://liquipedia.net/pubgmobile/PUBG_Mobile_World_Cup/2026',
    officialUrl:   'https://www.pubgmobile.com/esports/',
  })

  await sleep(500)

  await patch(EDITION_ID, {
    participants: PARTICIPANTS,
  })

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ ALL DONE — PMWC 2026 meta live in 60 seconds.'}\n`)
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
