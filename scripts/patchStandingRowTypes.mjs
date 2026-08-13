/**
 * scripts/patchStandingRowTypes.mjs
 * Adds _type: 'standingRow' to each row in the PMWC 2026 Survival Stage standing docs.
 * Also ensures the required `tournament` reference is set from the edition.
 *
 * DRY=false node --env-file=.env.local scripts/patchStandingRowTypes.mjs
 */
import { createClient } from '@sanity/client'

const DRY = process.env.DRY !== 'false'
const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production',
  token:      process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const EDITION_ID = 'edition-pubg-mobile-world-cup-2026'
const STANDING_IDS = [
  'standing-pmwc-2026-survival-day1',
  'standing-pmwc-2026-survival-day2',
]

async function main() {
  console.log(`\n🔧 Patch standing row types — DRY=${DRY}\n`)

  const edition = await client.fetch(`*[_id == $id][0]{ "tournamentId": tournament._ref }`, { id: EDITION_ID })
  if (!edition?.tournamentId) {
    console.error('❌ Could not find tournament reference on edition:', EDITION_ID)
    process.exit(1)
  }
  console.log('✅ Edition tournament ref:', edition.tournamentId)

  for (const id of STANDING_IDS) {
    const doc = await client.fetch(`*[_id == $id][0]{ _id, rows, tournament }`, { id })
    if (!doc) {
      console.warn('⚠️  Standing not found:', id)
      continue
    }

    const rows = (doc.rows || []).map(r => ({
      _type: 'standingRow',
      ...r,
    }))

    const patch = client.patch(id)
      .set({ rows })
    if (!doc.tournament) {
      patch.set({ tournament: { _type: 'reference', _ref: edition.tournamentId } })
    }

    if (DRY) {
      console.log(`[DRY PATCH] ${id} — rows ${rows.length}, tournament ${doc.tournament ? 'already set' : edition.tournamentId}`)
      continue
    }

    await patch.commit()
    console.log(`[✓ PATCH] ${id} — rows ${rows.length}, tournament ${doc.tournament ? 'already set' : 'set'}`)
  }

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false.' : '✅ Standing rows patched.'}\n`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
