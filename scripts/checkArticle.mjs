import { createClient } from '@sanity/client'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})
const query = `*[_type == "newsPost" && title match "*Match 4*"]{ _id, title, slug, status, publishDate, showOnHomepage, _createdAt }`
const res = await client.fetch(query)
console.log(JSON.stringify(res, null, 2))
