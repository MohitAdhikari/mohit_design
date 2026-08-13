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

async function fixGodLikeGame() {
  const godlike = await client.fetch(
    '*[_type == "team" && slug.current == "godlike-esports"][0]{ _id, name, game }'
  )

  if (!godlike) {
    console.warn('GodLike Esports team not found. Skipping game fix.')
    return
  }

  if (godlike.game === 'BGMI') {
    console.log(`GodLike Esports (${godlike._id}) already has game=BGMI`)
    return
  }

  if (DRY) {
    console.log(`[DRY] Would patch GodLike Esports (${godlike._id}) game -> BGMI`)
    return
  }

  await client.patch(godlike._id).set({ game: 'BGMI' }).commit()
  console.log(`Patched GodLike Esports (${godlike._id}) game -> BGMI`)
}

async function replaceTeamReferences(badId, canonicalId) {
  const referrers = await client.fetch(
    `*[_type in ["tournamentEdition","match","standing","player"] && references($id)] { _id, _type }`,
    { id: badId }
  )

  if (referrers.length === 0) {
    return
  }

  for (const doc of referrers) {
    const patch = client.patch(doc._id)
    let changed = false

    if (doc._type === 'tournamentEdition') {
      const data = await client.fetch(
        `*[_id == $id][0]{
          "winnerRef": winner._ref,
          "runnerUpRef": runnerUp._ref,
          "teamRefs": teams[]._ref,
          "participantRefs": participants[].team._ref
        }`,
        { id: doc._id }
      )

      if (data.winnerRef === badId) {
        patch.set({ 'winner._ref': canonicalId })
        changed = true
      }
      if (data.runnerUpRef === badId) {
        patch.set({ 'runnerUp._ref': canonicalId })
        changed = true
      }
      if (data.teamRefs?.includes(badId)) {
        patch.set({ [`teams[_ref == "${badId}"]._ref`]: canonicalId })
        changed = true
      }
      if (data.participantRefs?.includes(badId)) {
        patch.set({ [`participants[team._ref == "${badId}"].team._ref`]: canonicalId })
        changed = true
      }
    } else if (doc._type === 'match') {
      const data = await client.fetch(
        `*[_id == $id][0]{
          "team1Ref": team1._ref,
          "team2Ref": team2._ref,
          "winnerRef": winner._ref,
          "participantRefs": participants[].team._ref
        }`,
        { id: doc._id }
      )

      if (data.team1Ref === badId) {
        patch.set({ 'team1._ref': canonicalId })
        changed = true
      }
      if (data.team2Ref === badId) {
        patch.set({ 'team2._ref': canonicalId })
        changed = true
      }
      if (data.winnerRef === badId) {
        patch.set({ 'winner._ref': canonicalId })
        changed = true
      }
      if (data.participantRefs?.includes(badId)) {
        patch.set({ [`participants[team._ref == "${badId}"].team._ref`]: canonicalId })
        changed = true
      }
    } else if (doc._type === 'standing') {
      const data = await client.fetch(
        `*[_id == $id][0]{ "rowTeamRefs": rows[].team._ref }`,
        { id: doc._id }
      )
      if (data.rowTeamRefs?.includes(badId)) {
        patch.set({ [`rows[team._ref == "${badId}"].team._ref`]: canonicalId })
        changed = true
      }
    } else if (doc._type === 'player') {
      const data = await client.fetch(
        `*[_id == $id][0]{ "teamRef": team._ref }`,
        { id: doc._id }
      )
      if (data.teamRef === badId) {
        patch.set({ 'team._ref': canonicalId })
        changed = true
      }
    }

    if (!changed) {
      console.log(`No migratable reference fields found for ${doc._id} (${doc._type})`)
      continue
    }

    if (DRY) {
      console.log(`[DRY] Would update references in ${doc._id} (${doc._type}) ${badId} -> ${canonicalId}`)
      continue
    }

    await patch.commit()
    console.log(`Updated references in ${doc._id} (${doc._type}) ${badId} -> ${canonicalId}`)
  }
}

async function deleteDuplicateTeams() {
  const dups = [
    { badId: 'team-entity', keepSlug: 'entity-gaming' },
    { badId: 'team-orangutan-gaming', keepSlug: 'orangutan' },
  ]

  for (const { badId, keepSlug } of dups) {
    const bad = await client.fetch('*[_type == "team" && _id == $id][0]{ _id, name }', { id: badId })
    const keep = await client.fetch('*[_type == "team" && slug.current == $slug][0]{ _id, name }', {
      slug: keepSlug,
    })

    if (!bad) {
      console.log(`Duplicate ${badId} does not exist. Nothing to delete.`)
      continue
    }

    if (!keep) {
      console.warn(`Cannot delete ${badId}: canonical team with slug "${keepSlug}" does not exist. Skipping delete.`)
      continue
    }

    // Move any existing references to the canonical doc before deleting.
    await replaceTeamReferences(badId, keep._id)

    if (DRY) {
      console.log(`[DRY] Would delete duplicate ${badId} (${bad.name}) and keep ${keep._id} (${keep.name})`)
      continue
    }

    await client.delete(badId)
    console.log(`Deleted duplicate ${badId} (${bad.name}). Kept ${keep._id} (${keep.name}).`)
  }
}

// Missing teams compiled from the user's research list.
// Slugs are explicit to match the requested deterministic _id pattern: team-<slug>.
const MISSING_TEAMS = [
  // BGMI — India
  { name: 'Gods Reign', slug: 'gods-reign', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Blind Esports', slug: 'blind-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Revenant XSpark', slug: 'revenant-xspark', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'K9 Esports', slug: 'k9-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Nebula Esports', slug: 'nebula-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Enigma Gaming', slug: 'enigma-gaming', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'OR Esports', slug: 'or-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Gladiators Esports', slug: 'gladiators-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team XSpark', slug: 'team-xspark', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'TWM Gaming', slug: 'twm-gaming', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Skylightz Gaming', slug: 'skylightz-gaming', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Kinetic', slug: 'team-kinetic', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'WSB Gaming', slug: 'wsb-gaming', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Carnival Gaming', slug: 'carnival-gaming', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Mysterious 4', slug: 'mysterious-4', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'MadKings', slug: 'madkings', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'White Walkers', slug: 'white-walkers', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Vasista Esports', slug: 'vasista-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Tamilas', slug: 'team-tamilas', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Team Forever', slug: 'team-forever', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Lucknow Giants', slug: 'lucknow-giants', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'MOGO Esports', slug: 'mogo-esports', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Victores Sumus', slug: 'victores-sumus', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'Los Hermanos', slug: 'los-hermanos', game: 'BGMI', region: 'India', country: 'India' },
  { name: 'FS Esports', slug: 'fs-esports', game: 'BGMI', region: 'India', country: 'India' },

  // International / PUBG Mobile
  { name: 'NongShim RedForce', slug: 'nongshim-redforce', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'Jecheon Phalanx', slug: 'jecheon-phalanx', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'REJECT', slug: 'reject', game: 'PUBG Mobile', region: 'Global', country: 'Japan' },
  { name: 'REIGNITE', slug: 'reignite', game: 'PUBG Mobile', region: 'Global', country: 'Japan' },
  { name: 'CAG Osaka', slug: 'cag-osaka', game: 'PUBG Mobile', region: 'Global', country: 'Japan' },
  { name: 'emTek StormX', slug: 'emtek-stormx', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'Eagle Owls', slug: 'eagle-owls', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'DUKSAN Esports', slug: 'duksan-esports', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'ROX', slug: 'rox', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'Maru Gaming', slug: 'maru-gaming', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'ZZ', slug: 'zz', game: 'PUBG Mobile', region: 'Global', country: 'South Korea' },
  { name: 'ThunderTalk Gaming', slug: 'thundertalk-gaming', game: 'PUBG Mobile', region: 'Global', country: 'China' },
  { name: 'Brute Force', slug: 'brute-force', game: 'PUBG Mobile', region: 'Global', country: 'Russia' },
  { name: 'Beşiktaş Black', slug: 'besiktas-black', game: 'PUBG Mobile', region: 'Global', country: 'Turkey' },
  { name: 'Weibo Gaming', slug: 'weibo-gaming', game: 'PUBG Mobile', region: 'Global', country: 'China' },
  { name: 'INCO Gaming', slug: 'inco-gaming', game: 'PUBG Mobile', region: 'Global', country: 'Brazil' },
]

const seededSlugs = new Set()
const results = { created: 0, patched: 0, skipped: 0, dry: 0 }

async function ensureTeam(team) {
  const teamSlug = team.slug || slugify(team.name)
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

async function seedMissingTeams() {
  for (const team of MISSING_TEAMS) {
    await ensureTeam(team)
  }
}

async function verify() {
  const teamCount = await client.fetch('count(*[_type == "team"])')
  const badTeams = await client.fetch(
    '*[_type == "team" && (!defined(name) || !defined(slug.current))] { _id, name, "slug": slug.current }'
  )
  const dupSlugs = await client.fetch(
    'array::unique(*[_type == "team"][defined(slug.current)].slug.current)[0..100] | { "slug": @, "count": count(*[_type == "team" && slug.current == @]) }[count > 1]'
  )

  console.log('\n--- Verification ---')
  console.log('Team count:', teamCount)
  console.log('Bad team docs:', JSON.stringify(badTeams))
  console.log('Duplicate slugs:', JSON.stringify(dupSlugs))
}

async function main() {
  console.log(`\nRunning repairAndExpandTeams — DRY=${DRY}`)

  await fixGodLikeGame()
  await deleteDuplicateTeams()
  await seedMissingTeams()
  await verify()

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
  console.error('repairAndExpandTeams failed:', err)
  process.exit(1)
})
