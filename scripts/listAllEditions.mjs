import { createClient } from '@sanity/client'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})
const editions = await client.fetch(`*[_type == "tournamentEdition"]{ _id, "slug": slug.current, "tournamentName": tournament->name, year }[0...50]`)
console.log(JSON.stringify(editions, null, 2))
