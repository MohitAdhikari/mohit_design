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

async function main() {
  const tournaments = await client.fetch(`
    *[_type == "tournament"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      game,
      region,
      organizer,
      "editions": *[_type == "tournamentEdition" && tournament._ref == ^._id] | order(startDate asc) {
        _id,
        year,
        "slug": slug.current,
        tournamentStatus,
        startDate,
        endDate,
        publishStatus
      }
    }
  `)

  console.log(`Found ${tournaments.length} tournament(s):\n`)
  for (const t of tournaments) {
    console.log(`- ${t.name} (slug: ${t.slug}, _id: ${t._id})`)
    console.log(`  game: ${t.game || '-'}, region: ${t.region || '-'}, organizer: ${t.organizer || '-'}`)
    console.log(`  editions: ${t.editions?.length || 0}`)
    for (const e of t.editions || []) {
      console.log(`    - ${e.year} (${e.slug}) | status: ${e.tournamentStatus} | ${e.startDate} → ${e.endDate} | ${e.publishStatus}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
