/**
 * scripts/publishPMWCMatch2Article.mjs
 * Publishes the Article 2 — PMWC 2026 Grand Finals Match 2 recap.
 *
 * DRY RUN (safe):
 *   node --env-file=.env.local scripts/publishPMWCMatch2Article.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/publishPMWCMatch2Article.mjs
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
const ARTICLE_ID = 'pmwc-2026-grand-finals-match-2-recap'
const SLUG = 'pmwc-2026-grand-finals-match-2-s2g-esports-win-nigma-galaxy-lead'
const TITLE = "PMWC 2026 Grand Finals Match 2: S2G Esports Win It, But Nigma Galaxy Aren't Moving"

const MATCH_2_TABLE = `Pos|Team|PP|EP|Total
1|S2G Esports|10|9|19
2|Team Flash|6|6|12
3|4Thrives Esports|4|8|12
4|Horaa Esports|5|5|10
5|Nongshim RedForce|1|9|10
6|Team Vitality|2|6|8
7|Earena|0|7|7
8|AlUla Club Esports|1|3|4
9|GodLike Esports|0|4|4
10|Nigma Galaxy|3|0|3
11|ULF Esports|0|2|2
12|Tianba|0|2|2
13|Aurora Gaming|0|1|1
14|Orangutan|0|1|1
15|IDA Esports|0|0|0
16|FURIA|0|0|0`

const OVERALL_TABLE = `Pos|Team|Wins|PP|EP|Total
1|Nigma Galaxy|1|13|13|26
2|Aurora Gaming|0|6|18|24
3|S2G Esports|1|10|11|21
4|Nongshim RedForce|0|1|18|19
5|Tianba|0|0|18|18
6|Team Flash|0|7|10|17
7|Earena|0|3|14|17
8|Horaa Esports|0|5|11|16`

function h2(text) {
  return {
    _type: 'block',
    _key: `h-${text.slice(0, 30).replace(/\W+/g, '-')}--${Math.random().toString(36).slice(2, 6)}`,
    style: 'h2',
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

const content = [
  p('S2G Esports had a quiet Match 1. Match 2 was a completely different story.'),
  p(
    'The Turkish squad took the Erangel Chicken Dinner with 19 points — 10 from placement, 9 from kills — and immediately made their presence felt at the top of the Grand Finals. Two matches in, they sit third overall on 21 points with a game win already banked.',
  ),
  p(
    "At the top, though, Nigma Galaxy still lead on 26 points. Even on a 3-point match, they're ahead. That's what a Match 1 Chicken Dinner buys you.",
  ),
  h2('Match 2 Results'),
  tableBlock('PMWC 2026 Grand Finals — Match 2 Results', MATCH_2_TABLE),
  h2('Overall Standings After Match 2'),
  tableBlock('Overall Standings After Match 2', OVERALL_TABLE),
  h2("Nigma's Cushion Does Its Job"),
  p(
    'Nigma Galaxy picked up just 3 points in Match 2 — no kills, quiet exit. In any other scenario that\'s a bad match. Here, it barely dents them.',
  ),
  p(
    "Their Match 1 Chicken Dinner built enough of a lead that they can absorb a rough game and still sit at the top. That's the value of winning early in a Grand Finals format.",
  ),
  p(
    "Aurora Gaming had it worse — just 1 point from Match 2. They've gone from being level with Nigma after Match 1 to sitting 2 points behind. Not a crisis yet, but they can't keep gifting matches like this.",
  ),
  h2('Team Flash and 4Thrives Are Quietly Climbing'),
  p("Both teams finished on 12 points and neither is getting enough attention."),
  p(
    '4Thrives had 8 eliminations — second-highest of the entire match. Team Flash combined zone control with 6 kills and 6 placement points. These two are building something and are well within reach of the top group.',
  ),
  h2('India Still Looking for a Foothold'),
  p(
    "GodLike picked up 4 points in Match 2, all from kills. It's progress from Match 1, but still no placement points — they're not surviving long enough to convert their aggression into real totals.",
  ),
  p(
    "Orangutan finished 14th for the second match running with 1 point. Three total points from two matches. Something has to change in Match 3, because this run rate won't keep them in contention.",
  ),
  p(
    "S2G have shown the top of these standings isn't settled. With Nigma, Aurora, S2G, Nongshim and Tianba all capable of winning any given match, this Grand Finals is going to be tight right to the end.",
  ),
]

const doc = {
  _type: 'newsPost',
  _id: ARTICLE_ID,
  title: TITLE,
  slug: { _type: 'slug', current: SLUG },
  excerpt:
    'S2G Esports win Match 2 of the PMWC 2026 Grand Finals with 19 points, but Nigma Galaxy hold onto the overall lead thanks to their Match 1 Chicken Dinner cushion.',
  content,
  wordCount: 480,
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
  console.log(`\n🚀 Publishing PMWC Match 2 article — DRY=${DRY}\n`)

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
    console.log('\n⚠️  Remember: this is a static page — push a commit to trigger a Vercel redeploy for it to appear. Not an ISR write.\n')
  }
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
