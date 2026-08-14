/**
 * scripts/attachTournamentBanners.mjs
 *
 * Several tournament banner-style photos were uploaded to Sanity already
 * (via news article thumbnails, e.g. "pubg-mobile-world-cup-2026-paris.webp")
 * but never attached to the `tournament` document itself — so the
 * /esports/[slug] hero always showed a blank gradient instead of a photo.
 * Images are just assets in Sanity; the same uploaded image can be
 * referenced by multiple documents, so this re-uses the existing PMWC
 * upload as the tournament's banner instead of re-uploading anything.
 *
 * DRY RUN (safe, just prints):
 *   node --env-file=.env.local scripts/attachTournamentBanners.mjs
 *
 * LIVE WRITE:
 *   DRY=false node --env-file=.env.local scripts/attachTournamentBanners.mjs
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

// tournament _id → existing image asset _id to use as its banner.
const BANNERS = {
  'tournament-pubg-mobile-world-cup': 'image-ca2588d4739b1500a55a4e328f41c4b0f657a6a0-1672x941-webp',
}

async function main() {
  console.log(`\n🚀 Attach tournament banners — DRY=${DRY}\n`)

  for (const [tournamentId, assetId] of Object.entries(BANNERS)) {
    const doc = await client.fetch(`*[_id == $id][0]{ _id, name, banner }`, { id: tournamentId })
    if (!doc) {
      console.warn(`⚠️  Tournament not found: ${tournamentId}`)
      continue
    }
    if (doc.banner) {
      console.log(`·  ${doc.name} already has a banner, skipping.`)
      continue
    }

    const bannerField = { _type: 'image', asset: { _type: 'reference', _ref: assetId } }

    if (DRY) {
      console.log(`[DRY] Would set ${doc.name} (${tournamentId}).banner ->`, assetId)
    } else {
      await client.patch(tournamentId).set({ banner: bannerField }).commit()
      console.log(`[PATCHED] ${doc.name} (${tournamentId}).banner -> ${assetId}`)
    }
  }

  console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ Done.'}\n`)
}

main().catch((err) => { console.error('❌', err.message); process.exit(1) })
