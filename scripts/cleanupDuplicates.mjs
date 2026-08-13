import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('SANITY_API_WRITE_TOKEN not set')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const DRY = process.env.DRY !== 'false'

const DUPLICATE_TOURNAMENT_SLUGS = [
  'bgmi-masters-series-season-5',
  'bmic-2026',
  'bmsd-2026',
]

const CANONICAL_SLUGS = {
  'bgmi-masters-series-season-5': 'bgmi-masters-series',
  'bmic-2026': 'bgmi-international-cup',
  'bmsd-2026': 'battlegrounds-mobile-india-showdown',
  'pubg-mobile-world-cup': 'pubg-mobile-world-cup',
}

async function getCanonicalTournamentMap() {
  const canonicalSlugs = Object.values(CANONICAL_SLUGS)
  const canonical = await client.fetch(
    `*[_type == "tournament" && slug.current in $slugs]{ _id, name, "slug": slug.current }`,
    { slugs: canonicalSlugs }
  )
  const map = new Map()
  for (const c of canonical) {
    // prefer deterministic _id for slugs that collide
    const existing = map.get(c.slug)
    if (!existing || (String(c._id).startsWith('tournament-') && !String(existing._id).startsWith('tournament-'))) {
      map.set(c.slug, c)
    }
  }
  return map
}

async function main() {
  const canonicalBySlug = await getCanonicalTournamentMap()
  const toDelete = []

  // 1. Duplicate tournaments by known stale slugs
  const slugMatches = await client.fetch(
    `*[_type == "tournament" && slug.current in $slugs]{ _id, _type, name, "slug": slug.current }`,
    { slugs: DUPLICATE_TOURNAMENT_SLUGS }
  )
  toDelete.push(...slugMatches)

  // 2. Duplicate PUBG Mobile World Cup (not the canonical deterministic one)
  const pmwcDuplicates = await client.fetch(
    `*[_type == "tournament" && name == "PUBG Mobile World Cup" && _id != "tournament-pubg-mobile-world-cup"]{ _id, _type, name, "slug": slug.current }`
  )
  toDelete.push(...pmwcDuplicates)

  // 3. Editions linked to any duplicate tournament found above
  const duplicateTournamentIds = toDelete.map((t) => t._id)
  const linkedEditions = await client.fetch(
    `*[_type == "tournamentEdition" && tournament._ref in $ids]{ _id, year, "tournamentName": tournament->name }`,
    { ids: duplicateTournamentIds }
  )
  toDelete.push(...linkedEditions)

  // 4. Broken draft editions with no tournament/year/slug
  const brokenDrafts = await client.fetch(
    `*[_type == "tournamentEdition" && (!defined(tournament) || !defined(year) || !defined(slug.current))]{ _id, _createdAt }`
  )
  toDelete.push(...brokenDrafts)

  if (!toDelete.length) {
    console.log('Nothing to clean up.')
    return
  }

  const toDeleteTournaments = toDelete.filter((d) => d._type === 'tournament')
  const toDeleteEditions = toDelete.filter((d) => d._type !== 'tournament')

  console.log(`Found ${toDelete.length} document(s) to delete:`)
  for (const d of toDelete) {
    console.log(`- ${d._id} ${d.name ? `(${d.name})` : d.year ? `(${d.year})` : ''}`)
  }

  // Patch references in other document types before deleting tournaments
  for (const dup of toDeleteTournaments) {
    const canonicalSlug = CANONICAL_SLUGS[dup.slug]
    if (!canonicalSlug) continue
    const canonical = canonicalBySlug.get(canonicalSlug)
    if (!canonical) continue

    const refs = await client.fetch(
      `*[references($id) && _type != "tournamentEdition"]{ _id, _type, ..., "tournament": tournament, "tournamentBanner": tournamentBanner }`,
      { id: dup._id }
    )
    for (const r of refs) {
      const updates = {}

      if (r.tournament && r.tournament._ref === dup._id) {
        updates.tournament = { _type: 'reference', _ref: canonical._id }
      }
      if (r.tournamentBanner && r.tournamentBanner._ref === dup._id) {
        updates.tournamentBanner = { _type: 'reference', _ref: canonical._id }
      }

      if (Object.keys(updates).length) {
        await client.patch(r._id).set(updates).commit()
        console.log(`Patched ${r._type} ${r._id}: ${Object.keys(updates).join(', ')} -> ${canonical._id}`)
      }
    }
  }

  if (DRY) {
    console.log('\nDRY RUN — set DRY=false to actually delete.')
    return
  }

  // Delete editions and drafts first (they reference tournaments)
  console.log('\nDeleting editions/drafts...')
  for (const d of toDeleteEditions) {
    await client.delete(d._id)
    console.log(`Deleted ${d._id}`)
  }

  // Then delete duplicate tournaments
  console.log('Deleting tournaments...')
  for (const d of toDeleteTournaments) {
    await client.delete(d._id)
    console.log(`Deleted ${d._id}`)
  }
  console.log('Cleanup complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
