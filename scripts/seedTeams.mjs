import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Error: SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

const DRY = process.env.DRY !== 'false'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

function slug(current) {
  return { _type: 'slug', current }
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function pick(obj, keys) {
  const out = {}
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      out[key] = obj[key]
    }
  }
  return out
}

const TEAMS = [
  // BGMI — India
  { name: 'Orangutan Gaming', abbreviation: 'OG', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'GodLike Esports', abbreviation: 'GL', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Soul', abbreviation: 'SOUL', game: 'BGMI', region: 'India', country: 'India' },
  { name: '7Sea Esports', abbreviation: '7SEA', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Entity Gaming', abbreviation: 'EN', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Reckoning Esports', abbreviation: 'RGE', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Revenant Esports', abbreviation: 'RVT', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'FS Esports', abbreviation: 'FS', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Marcos Gaming', abbreviation: 'MS', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'GenxFM Esports', abbreviation: 'GX', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Big Brother Esports', abbreviation: 'BB', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Hyderabad Hydras', abbreviation: 'HH', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Tamilas', abbreviation: 'TTM', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Insane', abbreviation: 'INS', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Carnival Gaming', abbreviation: 'CARN', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'XSpark', abbreviation: 'XSP', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Blind Esports', abbreviation: 'BLIND', game: 'BGMI', region: 'India', country: 'India' },
  { name: '8Bit', abbreviation: '8B', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Velocity Gaming', abbreviation: 'VEL', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'True Rippers', abbreviation: 'TR', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Chemin Esports', abbreviation: 'CHM', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Global Esports', abbreviation: 'GE', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Medal Esports', abbreviation: 'MDL', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Numen Gaming', abbreviation: 'NUM', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Kerala Skilled', abbreviation: 'KS', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Forever', abbreviation: 'TF', game: 'BGMI', region: 'India', country: 'India' },

  // PUBG Mobile — Global
  { name: 'Natus Vincere', abbreviation: 'NAVI', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Virtus.pro', abbreviation: 'VP', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Four Angry Men', abbreviation: '4AM', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Nova Esports', abbreviation: 'NOVA', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Tianba Esports', abbreviation: 'TIAN', game: 'PUBG Mobile', region: 'Global' },
  { name: 'TJB Esports', abbreviation: 'TJB', game: 'PUBG Mobile', region: 'Global' },
  { name: 'INCO Gaming', abbreviation: 'INCO', game: 'PUBG Mobile', region: 'Global' },
  { name: "D'Xavier", abbreviation: 'DX', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Morph Team', abbreviation: 'MOR', game: 'PUBG Mobile', region: 'Global' },
  { name: 'IHC Esports', abbreviation: 'IHC', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Vampire Esports', abbreviation: 'VMP', game: 'PUBG Mobile', region: 'Global' },
  { name: 'FaZe Clan', abbreviation: 'FAZE', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Twisted Minds', abbreviation: 'TM', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Stalwart Esports', abbreviation: 'STA', game: 'PUBG Mobile', region: 'Global' },
  { name: 'SEM9', abbreviation: 'SEM9', game: 'PUBG Mobile', region: 'Global' },
  { name: 'NRX', abbreviation: 'NRX', game: 'PUBG Mobile', region: 'Global' },
  { name: 'BOOM Esports', abbreviation: 'BOOM', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Team Falcons', abbreviation: 'FLC', game: 'PUBG Mobile', region: 'Global' },
  { name: 'Soniqs', abbreviation: 'SNQ', game: 'PUBG Mobile', region: 'Global' },
]

const seededSlugs = new Set()
const results = { created: 0, patched: 0, skipped: 0, dry: 0 }

async function ensureTeam(team) {
  const teamSlug = slugify(team.name)
  const id = `team-${teamSlug}`

  if (seededSlugs.has(teamSlug)) {
    console.warn(`Duplicate in seed list: ${team.name} (${teamSlug})`)
    results.skipped++
    return null
  }
  seededSlugs.add(teamSlug)

  const existing = await client.fetch(
    `*[_type == "team" && slug.current == $slug] { _id, name }[0]`,
    { slug: teamSlug }
  )

  if (existing && existing._id !== id) {
    console.warn(`Existing team with slug "${teamSlug}" and different _id ${existing._id}: ${existing.name}. Skipping.`)
    results.skipped++
    return null
  }

  const baseDoc = {
    _id: id,
    _type: 'team',
    name: team.name,
    slug: slug(teamSlug),
    active: true,
    status: 'active',
  }

  // Only set core metadata. Never overwrite logo, banner, or social URLs.
  const safeFields = pick(team, ['shortName', 'abbreviation', 'game', 'region', 'country', 'status'])

  if (DRY) {
    console.log(`[DRY] ${existing ? 'patch' : 'create'} ${id}: ${team.name}`)
    results.dry++
    return id
  }

  if (!existing) {
    await client.createIfNotExists({ ...baseDoc, ...safeFields })
    results.created++
  } else {
    await client
      .patch(id)
      .setIfMissing({ ...safeFields, active: true, status: 'active', slug: slug(teamSlug) })
      .commit()
    results.patched++
  }

  return id
}

async function main() {
  for (const team of TEAMS) {
    await ensureTeam(team)
  }

  console.log('\n--- Seed summary ---')
  console.log(`DRY run: ${DRY}`)
  if (DRY) {
    console.log(`Would process: ${results.dry} teams`)
  } else {
    console.log(`Created: ${results.created}`)
    console.log(`Patched: ${results.patched}`)
    console.log(`Skipped: ${results.skipped}`)
  }
}

main().catch((err) => {
  console.error('Team seed failed:', err)
  process.exit(1)
})
