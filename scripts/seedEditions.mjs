import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Error: SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const seedData = JSON.parse(
  readFileSync(new URL('./seedEditionsData.json', import.meta.url), 'utf8')
)

function slug(current) {
  return { _type: 'slug', current }
}

function ref(_ref) {
  return { _type: 'reference', _ref }
}

function key() {
  return randomUUID()
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function stageStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'upcoming'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  const toDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const today = toDay(now)
  const startDay = toDay(start)
  const endDay = toDay(end) + 86_400_000 // inclusive of the end day
  if (today < startDay) return 'upcoming'
  if (today > endDay) return 'completed'
  return 'live'
}

function normalizeName(name) {
  return String(name).trim().toLowerCase()
}

async function getTournaments() {
  return client.fetch(`*[_type == "tournament"]{ _id, name, "slug": slug.current, game, region }`)
}

function buildTournamentMap(tournaments) {
  const bySlug = new Map()
  const byName = new Map()
  for (const t of tournaments) {
    if (t.slug) {
      const existing = bySlug.get(t.slug)
      // prefer deterministic _id (starts with "tournament-") over older random ids
      if (!existing || (String(t._id).startsWith('tournament-') && !String(existing._id).startsWith('tournament-'))) {
        bySlug.set(t.slug, t)
      }
    }
    if (t.name) byName.set(normalizeName(t.name), t)
  }
  return { bySlug, byName }
}

async function getExistingTeams() {
  return client.fetch(`*[_type == "team"]{ _id, name, "slug": slug.current, game, region }`)
}

async function getExistingEditions() {
  return client.fetch(`*[_type == "tournamentEdition"]{
    _id,
    year,
    "slug": slug.current,
    "tournamentId": tournament->_id,
    "tournamentName": tournament->name
  }`)
}

async function ensureTeam(name, game, teamByName) {
  if (!name) return null
  const normalized = normalizeName(name)
  const teamSlug = slugify(name)
  const existing = teamByName.get(normalized)

  if (existing) {
    const patch = client.patch(existing._id)
    if (!existing.slug) patch.setIfMissing({ slug: slug(teamSlug) })
    if (!existing.game) patch.setIfMissing({ game })
    if (existing.active !== false) patch.setIfMissing({ active: true })
    await patch.commit()
    return existing._id
  }

  const teamId = `team-${teamSlug}`
  await client.createIfNotExists({
    _id: teamId,
    _type: 'team',
    name,
    slug: slug(teamSlug),
    ...(game ? { game } : {}),
    active: true,
  })
  teamByName.set(normalized, { _id: teamId, name, slug: { current: teamSlug }, game, active: true })
  return teamId
}

function yearNumber(yearStr) {
  const m = String(yearStr).match(/\d{4}/)
  return m ? parseInt(m[0], 10) : null
}

function findExistingEdition(existingEditions, tournament, editionSlug, editionYear) {
  // primary: exact tournament + slug match
  const bySlug = existingEditions.find(
    (e) => e.tournamentId === tournament._id && e.slug === editionSlug
  )
  if (bySlug) return bySlug

  // fallback: same tournament name + same 4-digit year (catches editions linked to duplicate/older tournament docs)
  const normalizedTournamentName = normalizeName(tournament.name)
  const year = yearNumber(editionYear)
  if (!year) return null
  return existingEditions.find(
    (e) =>
      e.tournamentId &&
      normalizeName(e.tournamentName) === normalizedTournamentName &&
      yearNumber(e.year) === year
  )
}

async function main() {
  const [tournaments, existingEditions, existingTeams] = await Promise.all([
    getTournaments(),
    getExistingEditions(),
    getExistingTeams(),
  ])

  const { bySlug: tournamentBySlug, byName: tournamentByName } = buildTournamentMap(tournaments)
  const teamByName = new Map(existingTeams.map((t) => [normalizeName(t.name), t]))

  // Resolve (and create if missing) parent tournaments
  const requiredTournaments = new Map()
  for (const e of seedData) {
    const tournamentSlug = slugify(e.tournamentName)
    let tournament = tournamentBySlug.get(tournamentSlug) || tournamentByName.get(normalizeName(e.tournamentName))

    if (!tournament) {
      for (const [, t] of tournamentByName) {
        if (normalizeName(t.name).includes(normalizeName(e.tournamentName)) || normalizeName(e.tournamentName).includes(normalizeName(t.name))) {
          tournament = t
          break
        }
      }
    }

    if (!tournament) {
      // Create minimal stub for missing BGMI India-Korea Invitational parent
      if (normalizeName(e.tournamentName).includes('korea')) {
        const newId = 'tournament-bgmi-india-korea-invitational'
        const newDoc = {
          _id: newId,
          _type: 'tournament',
          name: 'BGMI India-Korea Invitational',
          slug: slug('bgmi-india-korea-invitational'),
          game: 'BGMI',
          region: 'India',
          organizer: 'KRAFTON India',
        }
        await client.createIfNotExists(newDoc)
        tournament = { _id: newId, name: newDoc.name, slug: { current: 'bgmi-india-korea-invitational' }, game: newDoc.game, region: newDoc.region }
        tournamentBySlug.set('bgmi-india-korea-invitational', tournament)
      } else {
        throw new Error(`Missing parent tournament: ${e.tournamentName}`)
      }
    }

    requiredTournaments.set(e.tournamentName, tournament)
  }

  for (const e of seedData) {
    const tournament = requiredTournaments.get(e.tournamentName)
    const editionSlug = e.slug || slugify(e.year)
    const existing = findExistingEdition(existingEditions, tournament, editionSlug, e.year)
    const editionId = existing ? existing._id : `edition-${tournament.slug.current}-${slugify(editionSlug)}`

    const game = tournament.game || ''
    const winnerId = e.winner ? await ensureTeam(e.winner, game, teamByName) : undefined
    const runnerUpId = e.runnerUp ? await ensureTeam(e.runnerUp, game, teamByName) : undefined

    const stages = (e.stages || []).map((s) => ({
      _type: 'stage',
      _key: key(),
      name: s.name,
      status: stageStatus(s.startDate, s.endDate),
      startDate: s.startDate,
      endDate: s.endDate,
      venue: s.venue || null,
      format: s.format || null,
      ...(s.totalTeams != null ? { totalTeams: s.totalTeams } : {}),
      ...(s.teamsAdvancing != null ? { teamsAdvancing: s.teamsAdvancing } : {}),
      notes: s.notes || null,
    }))

    const editionDoc = {
      _id: editionId,
      _type: 'tournamentEdition',
      tournament: ref(tournament._id),
      year: e.year,
      slug: slug(editionSlug),
      tournamentStatus: e.tournamentStatus,
      startDate: e.startDate,
      endDate: e.endDate,
      venue: e.venue || null,
      format: e.format || null,
      prizePool: e.prizePool || null,
      totalTeams: e.totalTeams ?? null,
      publishStatus: e.publishStatus || 'draft',
      description: e.description || null,
      stages,
      broadcastLinks: (e.broadcastLinks || []).map((b) => ({
        _type: 'object',
        _key: key(),
        platform: b.platform,
        url: b.url,
      })),
      prizeBreakdown: (e.prizeBreakdown || []).map((p) => ({
        _type: 'object',
        _key: key(),
        place: p.place,
        amount: p.amount,
      })),
      ...(winnerId ? { winner: ref(winnerId) } : {}),
      ...(runnerUpId ? { runnerUp: ref(runnerUpId) } : {}),
    }

    await client.createOrReplace(editionDoc)
    console.log(`${existing ? 'Updated' : 'Created'}: ${e.tournamentName} — ${e.year} (${editionId})`)
  }

  console.log('Edition upsert complete.')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
