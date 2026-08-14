import { createClient } from '@sanity/client'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})
const [news, guides, editions, tags] = await Promise.all([
  client.fetch(`count(*[_type == "newsPost" && defined(slug.current)])`),
  client.fetch(`count(*[_type == "guide" && defined(slug.current)])`),
  client.fetch(`count(*[_type == "tournament" && defined(slug.current)])`),
  client.fetch(`count(*[_type == "tag" && defined(slug.current)])`),
])
console.log({ news, guides, tournaments: editions, tags, total: news + guides + editions + tags })
