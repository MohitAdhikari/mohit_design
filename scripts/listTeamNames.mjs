import { createClient } from '@sanity/client'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})
const teams = await client.fetch(`*[_type == "team"]{ _id, name }[0...200]`)
console.log(JSON.stringify(teams.map((t) => t.name).sort(), null, 2))
