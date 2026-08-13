import { createClient } from '@sanity/client'
import { nanoid } from 'nanoid'
import fs from 'node:fs'

const DRY = process.env.DRY !== 'false'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

function b(text, style = 'normal') {
  return { _type:'block', _key:nanoid(), style, markDefs:[], children:[{ _type:'span', _key:nanoid(), text, marks:[] }] }
}
const h2 = t => b(t,'h2')
const h3 = t => b(t,'h3')
const p  = t => b(t,'normal')

const data = JSON.parse(fs.readFileSync(new URL('./.pmwcFinalData.json', import.meta.url), 'utf8'))

function resultLine(r, i) {
  const tag = r.placement === 1 ? ' (WWCD)' : ''
  return `${i + 1}. ${r.teamName} — ${r.kills} kill${r.kills !== 1 ? 's' : ''}, ${r.points} pts${tag}`
}

function resultsText(results, map) {
  return results.map((r, i) => resultLine(r, i)).join('\n') + `\nMap: ${map}`
}

function standingLine(s) {
  const tag = s.qualified ? ' ✅ Qualified' : s.eliminated ? ' ❌ Eliminated' : ''
  return `${s.rank}. ${s.teamName} — ${s.points} pts (${s.kills} kills, ${s.placementPoints} placement, ${s.wwcd} WWCD)${tag}`
}

const ARTICLES = [
  {
    _id: 'article-pmwc-2026-survival-m11',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 11: AlUla Club Esports Take Miramar WWCD',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-11-results' },
    status: 'published',
    publishDate: '2026-08-12T16:30:00.000Z',
    excerpt: 'AlUla Club Esports claimed a crucial Miramar WWCD in Match 11 with 23 points, shaking up the final qualification race.',
    category: 'results',
    content: [
      p('Match 11 on Miramar delivered the biggest shake-up of the Survival Stage yet. AlUla Club Esports, sitting outside the qualification zone entering the day, won the WWCD with 13 kills and 23 points — the highest single-game score of Day 2.'),
      h2('AlUla Club Arrive When It Matters'),
      p('With only two matches left, AlUla Club were on 59 points and needed a statement. Their 23-point Match 11 propelled them into the qualification conversation and set up a dramatic final game.'),
      h2('DOPENESS and Wolves Keep the Pressure On'),
      p('DOPENESS placed second with 15 points, proving their Match 5 Miramar WWCD was no fluke. Wolves Esports took third with 12 points, keeping their Grand Finals hopes alive.'),
      h2('Full Match 11 Results'),
      p(resultsText(data.results11, 'Miramar')),
      h2('Overall Standings After Match 11'),
      p(data.standings11.map(standingLine).join('\n')),
      p('One Miramar match remains. Follow PHONEOCEAN for live updates.'),
    ],
  },
  {
    _id: 'article-pmwc-2026-survival-m12',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 12: ULF Esports Win the Final Miramar Game',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-12-results' },
    status: 'published',
    publishDate: '2026-08-12T17:30:00.000Z',
    excerpt: 'ULF Esports closed out the Survival Stage with a Miramar WWCD, but the final qualification drama came down to placement points.',
    category: 'results',
    content: [
      p('The final match of the PMWC 2026 Survival Stage went to ULF Esports. They earned their second WWCD of the day — 7 kills, 17 points — on Miramar. But the real story was the cutline: eArena edged Wolves Esports on placement points to claim the last Grand Finals spot.'),
      h2('ULF Cap a Climb from the Cutline'),
      p('ULF were on 58 points after Match 9 and looked in trouble. Back-to-back strong games, capped by the Match 12 WWCD, carried them to 84 points and fifth place — a remarkable late rally.'),
      h2('eArena Survive on Placement Points'),
      p('eArena finished level on overall points with Wolves Esports at 79, but their 33 placement points to Wolves\' 24 earned them the sixth and final Grand Finals berth. It was the closest qualification margin of the entire tournament.'),
      h2('Full Match 12 Results'),
      p(resultsText(data.results12, 'Miramar')),
      h2('Overall Standings After Match 12'),
      p(data.standings12.map(standingLine).join('\n')),
      p('The Grand Finals field is set. Sixteen teams became six.'),
    ],
  },
  {
    _id: 'article-pmwc-2026-survival-final',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Final Results: The Six Grand Finalists Are Confirmed',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-final-results-qualification' },
    status: 'published',
    publishDate: '2026-08-12T18:00:00.000Z',
    excerpt: 'Tianba, AlUla Club Esports, NongShim RedForce, FURIA, ULF Esports and eArena qualify for the PMWC 2026 Grand Finals from the Survival Stage.',
    category: 'results',
    content: [
      p('The PMWC 2026 Survival Stage is complete. Over twelve matches, sixteen teams were reduced to six Grand Finalists. Tianba finished first with 109 points — 26 clear of second place — but the real drama unfolded on the cutline.'),
      h2('Tianba Dominate, But Qualification Goes Down to the Wire'),
      p('Tianba were the class of the Survival Stage, winning two of the first four matches and never looking back. They end on 109 points with 70 kills and two WWCDs. Behind them, AlUla Club Esports (91), NongShim RedForce (89), FURIA (85), ULF Esports (84) and eArena (79) joined them in the Grand Finals.'),
      h2('The Cruelest Cut: eArena vs Wolves on Placement Points'),
      p('eArena and Wolves Esports both finished on 79 points, but eArena\'s 33 placement points gave them the edge over Wolves\' 24. It was the only tiebreaker that mattered — and it sent one of Day 2\s most consistent teams home.'),
      h2('Final Survival Stage Standings'),
      p(data.standings12.map(standingLine).join('\n')),
      h2('What Is Next'),
      p('The Grand Finals will see the six Survival Stage qualifiers joined by the top teams from the Group Stage. Follow PHONEOCEAN for full Grand Finals coverage, rosters, schedule and live standings.'),
    ],
  },
]

async function main() {
  console.log(`\n📝 Final Articles — DRY=${DRY}\n`)
  for (const doc of ARTICLES) {
    if (DRY) {
      console.log(`[DRY] ${doc._id} — /news/${doc.slug.current}`)
    } else {
      await client.createOrReplace(doc)
      console.log(`[✓] ${doc._id} — /news/${doc.slug.current}`)
    }
  }
  console.log(`\n✅ Done.\n`)
}
main().catch(e => { console.error('❌', e.message); process.exit(1) })
