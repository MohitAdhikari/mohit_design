/**
 * scripts/fixBMPS2026LiveStatus.mjs
 * BMPS 2026 (BGMI Masters Series Season 5) is still LIVE — the earlier
 * seed script (seedBMPS2026RealData.mjs) incorrectly marked it completed
 * with a winner. This script undoes that:
 *   - unsets edition.winner and edition.runnerUp
 *   - sets tournamentStatus back to 'grand_finals' (live)
 *   - unpublishes the "Final Overall Standing" doc (kept, not deleted —
 *     just hidden from the public site until the event actually ends)
 *   - clears the "Champions"/"Runners-up" notes on the prize placements
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/fixBMPS2026LiveStatus.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/fixBMPS2026LiveStatus.mjs
 */

import { createClient } from '@sanity/client'

const DRY = process.env.DRY !== 'false'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const EDITION_ID = 'edition-bgmi-masters-series-season-5-2026'
const FINAL_STANDING_ID = 'standing-bmps-2026-gf-final'

async function main() {
  console.log(`\n🚀 BMPS 2026 live-status fix — DRY=${DRY}\n`)

  const edition = await client.fetch(`*[_id == $id][0]{ _id, winner, runnerUp, tournamentStatus, prizePlacements }`, { id: EDITION_ID })
  if (!edition) {
    console.error(`❌ Edition not found: ${EDITION_ID}`)
    process.exit(1)
  }
  console.log('✅ Edition found:', EDITION_ID, '— current status:', edition.tournamentStatus)

  const clearedPlacements = (edition.prizePlacements || []).map((p) => ({
    ...p,
    notes: '',
  }))

  if (DRY) {
    console.log('[DRY] Would patch edition:', EDITION_ID, {
      winner: null,
      runnerUp: null,
      tournamentStatus: 'grand_finals',
      prizePlacements: clearedPlacements.map((p) => ({ placement: p.placement, notes: p.notes })),
    })
    console.log('[DRY] Would unpublish standing:', FINAL_STANDING_ID)
  } else {
    await client
      .patch(EDITION_ID)
      .unset(['winner', 'runnerUp'])
      .set({ tournamentStatus: 'grand_finals', prizePlacements: clearedPlacements })
      .commit()
    console.log('[PATCHED] edition:', EDITION_ID, '→ winner/runnerUp cleared, status = grand_finals')

    const finalStanding = await client.fetch(`*[_id == $id][0]{ _id }`, { id: FINAL_STANDING_ID })
    if (finalStanding) {
      await client.patch(FINAL_STANDING_ID).set({ status: 'draft' }).commit()
      console.log('[PATCHED] standing:', FINAL_STANDING_ID, '→ status = draft (hidden, not deleted)')
    } else {
      console.log('[SKIP] Final standing doc not found, nothing to hide.')
    }
  }

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ Done — BMPS S5 now shows as live, no winner.'}\n`)
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
