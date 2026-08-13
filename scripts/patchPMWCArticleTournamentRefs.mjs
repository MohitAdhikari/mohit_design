import { createClient } from '@sanity/client'

const DRY = process.env.DRY !== 'false'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

// These newsPost docs are PMWC 2026 match/results articles that were seeded
// without a correct `tournament` reference, which breaks homepage rotation
// logic that groups tournament updates by tournament._id.
const TOURNAMENT_ID = 'tournament-pubg-mobile-world-cup'
const DOC_IDS = [
  'article-pmwc-2026-survival-m7',   // was pointing at the wrong tournament
  'article-pmwc-2026-survival-m11',  // had no tournament ref at all
  'article-pmwc-2026-survival-m12',
  'article-pmwc-2026-survival-final',
]

async function main() {
  console.log(`\n🔧 Patch tournament refs — DRY=${DRY}\n`)
  for (const id of DOC_IDS) {
    const doc = await client.getDocument(id)
    if (!doc) {
      console.log(`[skip] ${id} — not found`)
      continue
    }
    const before = doc.tournament?._ref ?? null
    if (before === TOURNAMENT_ID) {
      console.log(`[ok]   ${id} — already correct`)
      continue
    }
    console.log(`[${DRY ? 'DRY' : 'FIX'}]  ${id} — tournament: ${before ?? 'undefined'} -> ${TOURNAMENT_ID}`)
    if (!DRY) {
      await client
        .patch(id)
        .set({ tournament: { _type: 'reference', _ref: TOURNAMENT_ID } })
        .commit()
    }
  }
  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to apply.' : '✅ All refs patched.'}\n`)
}
main().catch((e) => { console.error('❌', e.message); process.exit(1) })
