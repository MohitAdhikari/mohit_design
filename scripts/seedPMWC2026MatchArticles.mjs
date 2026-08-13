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

const ARTICLES = [
  {
    _id: 'article-pmwc-2026-survival-m7',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 7: GOAT Team Explode on Rondo With 15 Kills',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-7-results' },
    status: 'published',
    publishDate: '2026-08-12T12:30:00.000Z',
    excerpt: 'GOAT Team fired 15 kills and claimed the Match 7 WWCD on Rondo. Tianba had their worst game of the tournament — just 2 points.',
    category: 'results',
    content: [
      p('Match 7 on Rondo belonged to GOAT Team. After a quiet Day 1, they detonated — 15 kills, 25 points, and a dominant WWCD that pushed them to joint second in the overall standings.'),
      h2('GOAT Team Finally Arrive'),
      p('GOAT Team ended Day 1 on 32 points — alive but off the pace. Match 7 changed everything. Their 25-point haul was the largest single-game total of the entire Survival Stage. They now sit on 57 points, level with FURIA Esports.'),
      h2('Tianba\'s First Real Stumble'),
      p('Tianba, who had looked untouchable all of Day 1, scored just 2 points in Match 7 — 14th place, 1 kill. They still lead comfortably at 77 points, but the pack is starting to close in.'),
      h2('Full Match 7 Results'),
      p('1. GOAT Team — 15 kills, 25 pts (WWCD)\n2. RRQ RYU — 9 kills, 14 pts\n3. Yangon Galacticos — 7 kills, 13 pts\n4. Alpha7 Esports — 9 kills, 13 pts\n5. AlUla Club Esports — 12 kills, 12 pts\n6. Wolves Esports — 8 kills, 10 pts\n7. AG.AL — 5 kills, 8 pts\n8. FURIA Esports — 8 kills, 8 pts\n9. GS 721 — 5 kills, 5 pts\n10. Geekay Esports — 5 kills, 5 pts\n11. eArena — 5 kills, 5 pts\n12. ULF Esports — 3 kills, 4 pts\n13. NongShim RedForce — 4 kills, 4 pts\n14. Tianba — 1 kill, 2 pts\n15. Kiwoom DRX — 2 kills, 2 pts\n16. DOPENESS — 1 kill, 1 pt'),
      h2('Overall Standings After Match 7'),
      p('1. Tianba — 77 pts\n2. GOAT Team — 57 pts\n3. FURIA Esports — 57 pts\n4. Alpha7 Esports — 55 pts\n5. RRQ RYU — 49 pts\n6. Wolves Esports — 47 pts\n─── Cutline ───\n7. Geekay Esports — 46 pts\n8. eArena — 46 pts\n9. Yangon Galacticos — 44 pts\n10. NongShim RedForce — 43 pts\n11. AlUla Club Esports — 41 pts\n12. AG.AL — 40 pts\n13. ULF Esports — 36 pts\n14. DOPENESS — 32 pts\n15. GS 721 — 31 pts\n16. Kiwoom DRX — 12 pts'),
      p('Match 8 (Erangel) is next. Follow PHONEOCEAN for live updates.'),
    ],
  },
  {
    _id: 'article-pmwc-2026-survival-m8',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 8: eArena Win on Erangel, AG.AL Collect 11 Kills in Second',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-8-results' },
    status: 'published',
    publishDate: '2026-08-12T13:30:00.000Z',
    excerpt: 'eArena claimed their first WWCD of the Survival Stage with 17 points. AG.AL went nuclear in second with 11 kills.',
    category: 'results',
    content: [
      p('Match 8 on Erangel delivered chaos. eArena — sitting outside the qualification zone — took a commanding WWCD with 17 points and 7 kills. Behind them, AG.AL detonated for 11 kills and 15 points. The standings reshuffled dramatically.'),
      h2('eArena Back in the Picture'),
      p('eArena entered Match 8 on 46 points — joint seventh. Their WWCD pushed them to 63 points and into fourth place overall. With two matches still to play, they are in a genuine qualification position.'),
      h2('Kiwoom DRX: From Dead to Dangerous'),
      p('Everyone wrote off Kiwoom DRX after Day 1\'s 10-point horror show. They placed fourth in Match 8 with 9 points and crept to 21 total. Still far back, but two big Miramar games could cause disruption.'),
      h2('Full Match 8 Results'),
      p('1. eArena — 7 kills, 17 pts (WWCD)\n2. AG.AL — 11 kills, 15 pts\n3. Alpha7 Esports — 5 kills, 11 pts\n4. Kiwoom DRX — 4 kills, 9 pts\n5. GOAT Team — 8 kills, 8 pts\n6. AlUla Club Esports — 3 kills, 6 pts\n7. DOPENESS — 4 kills, 6 pts\n8. NongShim RedForce — 5 kills, 6 pts\n9. Geekay Esports — 6 kills, 6 pts\n10. Tianba — 5 kills, 5 pts\n11. GS 721 — 0 kills, 1 pt\n12. Yangon Galacticos — 1 kill, 1 pt\n13. RRQ RYU — 1 kill, 1 pt\n14. ULF Esports — 0 kills, 0 pts\n15. FURIA Esports — 0 kills, 0 pts\n16. Wolves Esports — 0 kills, 0 pts'),
      h2('Overall Standings After Match 8'),
      p('1. Tianba — 82 pts\n2. Alpha7 Esports — 66 pts\n3. GOAT Team — 65 pts\n4. eArena — 63 pts\n5. FURIA Esports — 57 pts\n6. AG.AL — 55 pts\n─── Cutline ───\n7. Geekay Esports — 52 pts\n8. RRQ RYU — 50 pts\n9. NongShim RedForce — 49 pts\n10. Wolves Esports — 47 pts\n11. AlUla Club Esports — 47 pts\n12. Yangon Galacticos — 45 pts\n13. DOPENESS — 38 pts\n14. ULF Esports — 36 pts\n15. GS 721 — 32 pts\n16. Kiwoom DRX — 21 pts'),
      p('Match 9 (Erangel) next. Follow PHONEOCEAN.'),
    ],
  },
  {
    _id: 'article-pmwc-2026-survival-m9',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 9: ULF Esports Dominate Erangel With 12 Kills and a WWCD',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-9-results' },
    status: 'published',
    publishDate: '2026-08-12T14:30:00.000Z',
    excerpt: 'ULF Esports won Match 9 on Erangel with 22 points — their first WWCD. Wolves Esports took second with 11 kills. The qualification race tightened to a single point across ranks 3 to 6.',
    category: 'results',
    content: [
      p('ULF Esports had been on the fringes all tournament. Match 9 on Erangel was their answer — 12 kills, 22 points, a commanding WWCD that fired them from 14th to 8th overall. Two matches remain. They are alive.'),
      h2('Wolves Esports Making a Late Push'),
      p('Wolves scored zero in Match 8 — their worst game. They responded in Match 9 with 11 kills and 17 points from second. That single result took them from 10th to 6th overall. They are now on 64 points — just one point outside the top six. Both remaining matches are Miramar.'),
      h2('The Qualification Race'),
      p('After 9 matches, ranks 3 through 6 are: FURIA (67), eArena (67), GOAT Team (66), Wolves (64). A two-point spread across four teams with two games left. AG.AL (57), Geekay (60), and ULF (58) are all still alive.'),
      h2('Full Match 9 Results'),
      p('1. ULF Esports — 12 kills, 22 pts (WWCD)\n2. Wolves Esports — 11 kills, 17 pts\n3. FURIA Esports — 6 kills, 10 pts\n4. Tianba — 6 kills, 9 pts\n5. AlUla Club Esports — 3 kills, 8 pts\n6. Geekay Esports — 6 kills, 8 pts\n7. eArena — 4 kills, 4 pts\n8. NongShim RedForce — 4 kills, 4 pts\n9. Alpha7 Esports — 1 kill, 2 pts\n10. GS 721 — 2 kills, 2 pts\n11. DOPENESS — 2 kills, 2 pts\n12. AG.AL — 2 kills, 2 pts\n13. RRQ RYU — 0 kills, 1 pt\n14. GOAT Team — 1 kill, 1 pt\n15. Yangon Galacticos — 0 kills, 0 pts\n16. Kiwoom DRX — 0 kills, 0 pts'),
      h2('Overall Standings After Match 9'),
      p('1. Tianba — 91 pts\n2. Alpha7 Esports — 68 pts\n3. FURIA Esports — 67 pts\n4. eArena — 67 pts\n5. GOAT Team — 66 pts\n6. Wolves Esports — 64 pts\n─── Cutline ───\n7. Geekay Esports — 60 pts\n8. ULF Esports — 58 pts\n9. AG.AL — 57 pts\n10. AlUla Club Esports — 55 pts\n11. NongShim RedForce — 53 pts\n12. RRQ RYU — 51 pts\n13. Yangon Galacticos — 45 pts\n14. DOPENESS — 40 pts\n15. GS 721 — 34 pts\n16. Kiwoom DRX — 21 pts'),
      p('Match 10 (last Erangel of the Survival Stage) is next.'),
    ],
  },
  {
    _id: 'article-pmwc-2026-survival-m10',
    _type: 'newsPost',
    title: 'PMWC 2026 Survival Stage Match 10: Kiwoom DRX Shock the Lobby With a WWCD on Erangel',
    slug: { _type:'slug', current:'pmwc-2026-survival-stage-match-10-results' },
    status: 'published',
    publishDate: '2026-08-12T15:30:00.000Z',
    excerpt: 'Kiwoom DRX — 10 points after Day 1 — won Match 10 on Erangel. NongShim RedForce also took 18 points from second. Two Miramar matches decide who qualifies.',
    category: 'results',
    content: [
      p('Nobody saw this coming. Kiwoom DRX, who ended Day 1 with just 10 points and were the first team written off, won Match 10 on Erangel — 8 kills, 18 points, their first WWCD of the Survival Stage. It does not save their campaign, but it makes the last two matches significantly more chaotic.'),
      h2('NongShim RedForce Fire Back'),
      p('NS RedForce have been quietly building throughout Day 2. They placed second in Match 10 with 12 kills and 18 points — equal to Kiwoom\'s total — and vaulted from 11th to 3rd overall. Now on 71 points with two Miramar matches left. They won a Miramar WWCD on Day 1. Watch them closely.'),
      h2('The Final Qualification Race'),
      p('With two matches remaining (both Miramar), the picture:\n\n1. Tianba — 98 pts ✅ Safe\n2. FURIA Esports — 79 pts ✅ Safe\n3. NongShim RedForce — 71 pts\n4. Alpha7 Esports — 70 pts\n\nFor the last 2 spots — 5 teams in 3 points:\n5. GOAT Team — 67 pts\n6. eArena — 67 pts\n7. Wolves Esports — 66 pts\n8. Geekay Esports — 65 pts\n9. ULF Esports — 64 pts\n\nOne WWCD changes everything.'),
      h2('Full Match 10 Results'),
      p('1. Kiwoom DRX — 8 kills, 18 pts (WWCD)\n2. NongShim RedForce — 12 kills, 18 pts\n3. FURIA Esports — 8 kills, 12 pts\n4. GS 721 — 7 kills, 10 pts\n5. Tianba — 6 kills, 7 pts\n6. ULF Esports — 1 kill, 6 pts\n7. Geekay Esports — 3 kills, 5 pts\n8. AlUla Club Esports — 4 kills, 4 pts\n9. RRQ RYU — 1 kill, 2 pts\n10. DOPENESS — 2 kills, 2 pts\n11. Alpha7 Esports — 2 kills, 2 pts\n12. Wolves Esports — 2 kills, 2 pts\n13. AG.AL — 1 kill, 1 pt\n14. Yangon Galacticos — 1 kill, 1 pt\n15. GOAT Team — 1 kill, 1 pt\n16. eArena — 0 kills, 0 pts'),
      h2('Overall Standings After Match 10'),
      p('1. Tianba — 98 pts\n2. FURIA Esports — 79 pts\n3. NongShim RedForce — 71 pts\n4. Alpha7 Esports — 70 pts\n5. GOAT Team — 67 pts\n6. eArena — 67 pts\n─── Cutline ───\n7. Wolves Esports — 66 pts\n8. Geekay Esports — 65 pts\n9. ULF Esports — 64 pts\n10. AlUla Club Esports — 59 pts\n11. AG.AL — 58 pts\n12. RRQ RYU — 53 pts\n13. Yangon Galacticos — 46 pts\n14. GS 721 — 44 pts\n15. DOPENESS — 42 pts\n16. Kiwoom DRX — 39 pts'),
      p('Matches 11 and 12 are both on Miramar. The top six after Match 12 qualify for the PMWC 2026 Grand Finals. Follow PHONEOCEAN for live updates.'),
    ],
  },
]

async function main() {
  console.log(`\n📝 Match Articles M7–M10 — DRY=${DRY}\n`)
  for (const article of ARTICLES) {
    if (DRY) { console.log(`[DRY] ${article._id} — ${article.slug.current}`); continue }
    await client.createOrReplace(article)
    console.log(`[✓] ${article._id}`)
  }
  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to publish.' : '✅ All 4 articles live.'}\n`)
}
main().catch(e => { console.error('❌', e.message); process.exit(1) })
