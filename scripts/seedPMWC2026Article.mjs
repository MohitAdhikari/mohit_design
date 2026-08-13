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

function b(text, style = 'normal') {
  return { _type:'block', _key:nanoid(), style, markDefs:[], children:[{ _type:'span', _key:nanoid(), text, marks:[] }] }
}
const h2 = t => b(t,'h2')
const h3 = t => b(t,'h3')
const p  = t => b(t,'normal')

async function main() {
  console.log(`\n📝 Day 1 Article — DRY=${DRY}\n`)
  const doc = {
    _id: 'article-pmwc-2026-survival-day1',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Day 1: Tianba Dominate, Six Grand Finals Spots Still Up for Grabs',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-day-1-results' },
    status: 'published',
    publishDate: '2026-08-11T20:00:00.000Z',
    excerpt: 'Tianba finished PMWC 2026 Survival Stage Day 1 with 75 points and a 26-point lead after back-to-back WWCDs. Full match breakdown, standings, and what to watch on Day 2.',
    category: 'results',
    content: [
      p('The PUBG Mobile World Cup 2026 Survival Stage opened on August 11 in Riyadh with 16 teams across six matches. Only the top six from the combined 12-match standings qualify for the Grand Finals. One team made Day 1 look easy.'),
      h2('Tianba Take Full Control'),
      p('Tianba won back-to-back WWCDs in Matches 1 and 2, added a top-three in Match 4, and finished Day 1 on 75 points — 26 clear of second-placed FURIA Esports. Star fragger MiLu led the tournament with 18 kills on the day. Their only stumble: Match 6, where they scored zero.'),
      h2('Match-by-Match Breakdown'),
      h3('Match 1 — Rondo'),
      p('Tianba WWCD: 13 kills, 23 pts. AlUla Club second (16 pts), NS RedForce third (13 pts), eArena fourth (11 pts), Geekay and GOAT both on 10.'),
      h3('Match 2 — Erangel'),
      p('Tianba WWCD again: 12 kills, 22 pts. FURIA second (12 pts), GOAT and ULF on nine each, RRQ seven, eArena six.'),
      h3('Match 3 — Erangel'),
      p('NongShim RedForce WWCD: 8 kills, 18 pts. FURIA and RRQ both 13 pts. Alpha7 and GS 721 on 10 each.'),
      h3('Match 4 — Erangel'),
      p('Geekay Esports WWCD: 10 kills, 20 pts. Alpha7 second (15 pts), Tianba third (12 pts). Kiwoom DRX picked up just 6.'),
      h3('Match 5 — Miramar'),
      p('DOPENESS WWCD: 11 kills, 21 pts — their tournament statement. Tianba and FURIA both 14 pts.'),
      h3('Match 6 — Miramar'),
      p('AG.AL WWCD: 8 kills, 18 pts. Wolves Esports second (17 pts). Tianba eliminated early — 0 pts.'),
      h2('Day 1 Final Standings'),
      p('1. Tianba — 75 pts (2 WWCD, 44 kills)\n2. FURIA Esports — 49 pts\n3. Alpha7 Esports — 42 pts\n4. Geekay Esports — 41 pts (1 WWCD)\n5. eArena — 41 pts\n6. NongShim RedForce — 39 pts (1 WWCD)\n─── Cutline ───\n7. Wolves Esports — 37 pts\n8. RRQ RYU — 35 pts\n9. AG.AL — 32 pts (1 WWCD)\n10. ULF Esports — 32 pts\n11. GOAT Team — 32 pts\n12. DOPENESS — 31 pts (1 WWCD)\n13. Yangon Galacticos — 31 pts\n14. AlUla Club Esports — 29 pts\n15. GS 721 — 26 pts\n16. Kiwoom DRX — 10 pts'),
      h2('What to Watch on Day 2'),
      p('Only 4 points separate ranks 4 through 8. Wolves (37) and RRQ (35) are two and four points outside the cutline. Kiwoom DRX at 10 points need a miracle. Day 2 runs six matches: Rondo, Erangel x3, Miramar x2. Top six after Match 12 go to the Grand Finals.'),
      p('Follow PHONEOCEAN for live standings updates after every match.'),
    ],
  }
  if (DRY) { console.log(`[DRY] ${doc._id} — slug: ${doc.slug.current}`); return }
  await client.createOrReplace(doc)
  console.log(`[✓] ${doc._id}\n    /news/${doc.slug.current}\n\n✅ Done.\n`)
}
main().catch(e => { console.error('❌', e.message); process.exit(1) })
