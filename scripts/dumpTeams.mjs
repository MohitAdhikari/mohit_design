import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-04-28',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const teams = await client.fetch(`*[_type == "team"]{ _id, name, "slug": slug.current } | order(name asc)`)
for (const t of teams) {
  console.log(`${t.slug || '---'}\t${t.name}`)
}
