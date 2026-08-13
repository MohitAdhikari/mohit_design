// scripts/seedMissingTeams.mjs
// DRY=false node --env-file=.env.local scripts/seedMissingTeams.mjs

import { createClient } from '@sanity/client'

const DRY = process.env.DRY !== 'false'
const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production',
  token:      process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-04-28',
  useCdn: false,
})

const teams = [
  { slug: 'furia-esports',       name: 'FURIA Esports',       shortName: 'FURIA',   country: 'Brazil',        region: 'Americas',  game: 'PUBG Mobile' },
  { slug: 'earena',              name: 'eArena',              shortName: 'eArena',  country: 'Thailand',      region: 'SEA',       game: 'PUBG Mobile' },
  { slug: 'geekay-esports',      name: 'Geekay Esports',      shortName: 'GKY',     country: 'Saudi Arabia',  region: 'MENA',      game: 'PUBG Mobile' },
  { slug: 'goat-team',           name: 'GOAT Team',           shortName: 'GOAT',    country: 'Uzbekistan',    region: 'CIS',       game: 'PUBG Mobile' },
  { slug: 'ulf-esports',         name: 'ULF Esports',         shortName: 'ULF',     country: 'Turkey',        region: 'Europe',    game: 'PUBG Mobile' },
  { slug: 'rrq-ryu',             name: 'RRQ RYU',             shortName: 'RRQ',     country: 'Indonesia',     region: 'SEA',       game: 'PUBG Mobile' },
  { slug: 'ag-al',               name: 'AG.AL',               shortName: 'AG',      country: 'China',         region: 'China',     game: 'PUBG Mobile' },
  { slug: 'gs-721',              name: 'GS 721',              shortName: 'GS721',   country: 'Iraq',          region: 'MENA',      game: 'PUBG Mobile' },
  { slug: 'dopeness',            name: 'DOPENESS',            shortName: 'DPS',     country: 'Japan',         region: 'East Asia', game: 'PUBG Mobile' },
  { slug: 'wolves-esports',      name: 'Wolves Esports',      shortName: 'WLV',     country: 'United States', region: 'Americas',  game: 'PUBG Mobile' },
  { slug: 'alula-club-esports',  name: 'AlUla Club Esports',  shortName: 'ULA',     country: 'Saudi Arabia',  region: 'MENA',      game: 'PUBG Mobile' },
]

for (const team of teams) {
  const doc = {
    _id:       `team-${team.slug}`,
    _type:     'team',
    name:      team.name,
    shortName: team.shortName,
    slug:      { _type: 'slug', current: team.slug },
    country:   team.country,
    region:    team.region,
    game:      team.game,
  }
  if (DRY) { console.log('[DRY]', doc._id, doc.name); continue }
  await client.createIfNotExists(doc)
  console.log('[✓]', doc._id, doc.name)
}

console.log(`\n${DRY ? '✅ DRY done. Run DRY=false to write.' : '✅ All 11 teams created.'}\n`)
