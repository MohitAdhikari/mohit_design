import { createClient } from '@sanity/client'
const client = createClient({
  projectId: 'nlydr3l6',
  dataset: 'production',
  token: process.env.SANITY_API_READ_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})
const [edition, tournament, existing] = await Promise.all([
  client.fetch('*[_id == "edition-bmps-2025"][0]{ _id }'),
  client.fetch('*[_id == "tournament-bmps"][0]{ _id }'),
  client.fetch('*[_id == "standing-overall-bmps-2025"][0]{ _id }'),
])
console.log(JSON.stringify({ edition, tournament, existing }))
