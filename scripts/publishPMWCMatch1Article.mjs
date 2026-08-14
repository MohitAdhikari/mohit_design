/**
 * scripts/publishPMWCMatch1Article.mjs
 * Publishes the Article 1 — PMWC 2026 Grand Finals Match 1 recap.
 *
 * DRY RUN (safe):
 *   node --env-file=.env.local scripts/publishPMWCMatch1Article.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/publishPMWCMatch1Article.mjs
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

const EDITION_ID = 'edition-pubg-mobile-world-cup-2026'
const TOURNAMENT_ID = 'tournament-pubg-mobile-world-cup'
const ARTICLE_ID = 'pmwc-2026-grand-finals-match-1-recap'
const SLUG = 'pmwc-2026-grand-finals-match-1-nigma-aurora-23-points'
const TITLE = 'PMWC 2026 Grand Finals Match 1: Nigma Galaxy and Aurora Gaming Open Finals With 23 Points'

const MATCH_RANKING_TABLE = `Rank|Team|Placement Points|Elimination Points|Total
1|Nigma Galaxy|10|13|23
2|Aurora Gaming|6|17|23
3|Tianba|0|16|16
4|AlUla Club Esports|4|7|11
5|Earena|3|7|10
6|Nongshim RedForce|0|9|9
7|FURIA|5|2|7
8|Horaa Esports|0|6|6
9|Team Flash|1|4|5
10|GodLike Esports|1|3|4
11|ULF Esports|0|4|4
12|Team Vitality|0|3|3
13|Orangutan|2|0|2
14|S2G Esports|0|2|2
15|4Thrives Esports|0|2|2
16|IDA Esports|0|1|1`

const TIANBA_STATS_TABLE = `Player|Eliminations|Damage|Knockouts|Survival Time
Milu|8|1,538|8|20:49
QZZ|5|547|4|20:49
Eagle|2|258|2|19:42
Aching|1|286|1|14:38`

function h2(text) {
  return {
    _type: 'block',
    _key: `h-${text.slice(0, 30).replace(/\W+/g, '-')}--${Math.random().toString(36).slice(2, 6)}`,
    style: 'h2',
    children: [{ _type: 'span', _key: `s-${Math.random().toString(36).slice(2, 6)}`, text, marks: [] }],
    markDefs: [],
  }
}

function h3(text) {
  return {
    _type: 'block',
    _key: `h3-${text.slice(0, 20).replace(/\W+/g, '-')}--${Math.random().toString(36).slice(2, 6)}`,
    style: 'h3',
    children: [{ _type: 'span', _key: `s-${Math.random().toString(36).slice(2, 6)}`, text, marks: [] }],
    markDefs: [],
  }
}

function p(text) {
  return {
    _type: 'block',
    _key: `p-${text.slice(0, 30).replace(/\W+/g, '-')}--${Math.random().toString(36).slice(2, 6)}`,
    style: 'normal',
    children: [{ _type: 'span', _key: `s-${Math.random().toString(36).slice(2, 6)}`, text, marks: [] }],
    markDefs: [],
  }
}

function tableBlock(title, rawText) {
  return {
    _type: 'standingsTable',
    _key: `st-${Math.random().toString(36).slice(2, 8)}`,
    title,
    rawText,
    displayStyle: 'standings',
    mobileCardStyle: 'modern',
  }
}

function playerStatsBlock(title, rawText) {
  return {
    _type: 'tableBlock',
    _key: `tb-${Math.random().toString(36).slice(2, 8)}`,
    title,
    rawText,
  }
}

const content = [
  p(
    'The PUBG Mobile World Cup (PMWC) 2026 Grand Finals got off to a thrilling start as Nigma Galaxy and Aurora Gaming finished Match 1 level on 23 points. Nigma Galaxy claimed the top spot, while Aurora Gaming followed closely behind in second. The opening match immediately showed how competitive the Grand Finals could be, with three teams crossing the 16-point mark and several others picking up strong elimination numbers.',
  ),
  h2('Nigma Galaxy Take Match 1 With 23 Points'),
  p(
    'Nigma Galaxy opened the PMWC 2026 Grand Finals at the top of the standings with 23 points, made up of 10 placement points and 13 elimination points.',
  ),
  p(
    'Aurora Gaming also finished on 23 points but took second place, recording 6 placement points and 17 elimination points.',
  ),
  p(
    'The opening match therefore ended with an extremely close battle at the top, with Nigma Galaxy and Aurora Gaming separated despite having the same total score.',
  ),
  h2('Aurora Gaming Match 1 Performance'),
  p(
    'Aurora Gaming produced the highest elimination tally of the match with 17 eliminations. However, their 6 placement points meant they finished with the same overall total of 23 points as Nigma Galaxy. The result gives Aurora an early statement at the top of the Grand Finals standings despite narrowly missing out on first place.',
  ),
  h2('Tianba Finish Third With 16 Points'),
  p(
    'Tianba secured third place with 16 points, all of which came from eliminations. The Chinese powerhouse recorded 16 eliminations in Match 1 and was led by Milu, who delivered a standout individual performance.',
  ),
  h3('Tianba Player Stats'),
  playerStatsBlock('Tianba Player Stats — Match 1', TIANBA_STATS_TABLE),
  p(
    'Milu accounted for 8 of Tianba\'s 16 eliminations and dealt an impressive 1,538 damage, making him the standout player for the team in the opening match. Across the four players, Tianba accumulated 16 eliminations and 2,629 total damage.',
  ),
  h2('AlUla Club Esports and Earena Complete the Top Five'),
  p(
    'AlUla Club Esports finished fourth with 11 points, including 7 eliminations and 4 placement points. Earena followed in fifth with 10 points, recording 7 eliminations and 3 placement points. Both teams made solid starts to the Grand Finals and remain within striking distance of the leaders after the opening match.',
  ),
  h2('PMWC 2026 Grand Finals Match 1 Standings'),
  tableBlock('Match 1 Final Standings', MATCH_RANKING_TABLE),
  h2('Indian Teams Struggle in the Opening Match'),
  p(
    'The opening match was a difficult one for the Indian representatives. GodLike Esports finished in 10th place with 4 points, collecting 3 eliminations and 1 placement point. Orangutan ended Match 1 in 13th with just 2 points, while 4Thrives Esports finished 15th with 2 points.',
  ),
  p(
    'With multiple matches still remaining in the PMWC 2026 Grand Finals, the Indian teams will need a significant improvement in both placement and elimination points to climb the leaderboard.',
  ),
  h2('What to Expect From Match 2'),
  p(
    'The opening match has already set up a fascinating battle at the top of the PMWC 2026 Grand Finals standings. Nigma Galaxy and Aurora Gaming have started with identical 23-point totals, while Tianba sits only seven points behind after an elimination-heavy performance.',
  ),
  p(
    'With the standings extremely tight, every Winner Winner Chicken Dinner, placement point and elimination could make a major difference as the Grand Finals continue.',
  ),
  p('Match 1 has made one thing clear: the PMWC 2026 Grand Finals are wide open.'),
]

const doc = {
  _type: 'newsPost',
  _id: ARTICLE_ID,
  title: TITLE,
  slug: { _type: 'slug', current: SLUG },
  excerpt:
    'Nigma Galaxy and Aurora Gaming both open the PMWC 2026 Grand Finals with 23 points in Match 1, while Tianba sits third after a 16-elimination performance.',
  content,
  wordCount: 420,
  category: 'Esports',
  badge: 'TOURNAMENT',
  tags: [],
  tournament: { _type: 'reference', _ref: TOURNAMENT_ID },
  teams: [],
  matchMeta: {
    _type: 'matchMeta',
    articleType: 'match_recap',
    tournamentEdition: { _type: 'reference', _ref: EDITION_ID },
    matchDay: 1,
  },
  publishDate: new Date().toISOString(),
  status: 'published',
  featured: true,
  showOnHomepage: true,
}

async function main() {
  console.log(`\n🚀 Publishing PMWC Match 1 article — DRY=${DRY}\n`)

  const existing = await readClient.fetch(`*[_id == $id][0]{ _id }`, { id: ARTICLE_ID })
  if (existing) {
    console.log('⚠️  Article already exists:', ARTICLE_ID, '- script will overwrite if DRY=false')
  }

  const edition = await readClient.fetch(`*[_id == $id][0]{ _id }`, { id: EDITION_ID })
  if (!edition) {
    console.error('❌ Edition not found:', EDITION_ID)
    process.exit(1)
  }

  if (DRY) {
    console.log('[DRY] Would create/update newsPost:', ARTICLE_ID)
    console.log('   title:', TITLE)
    console.log('   slug:', SLUG)
    console.log('   content blocks:', content.length)
    console.log('\n✅ DRY done. Run DRY=false to publish.\n')
  } else {
    await writeClient.createOrReplace(doc)
    console.log('[PUBLISHED] newsPost:', ARTICLE_ID)
    console.log('\n⚠️  Remember: site must be manually redeployed for the article to appear.\n')
  }
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
