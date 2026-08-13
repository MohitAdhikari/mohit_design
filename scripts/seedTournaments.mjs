import { createClient } from '@sanity/client'
import { randomUUID } from 'node:crypto'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Error: SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

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

function ref(_ref) {
  return { _type: 'reference', _ref }
}

function key() {
  return randomUUID()
}

function stageStatus(startDate, endDate) {
  const now = Date.now()
  const start = startDate ? new Date(startDate).getTime() : null
  const end = endDate ? new Date(endDate).getTime() : null
  if (start && now < start) return 'upcoming'
  if (end && now > end) return 'completed'
  return 'live'
}

function omitEmpty(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v !== undefined) out[k] = v
  }
  return out
}

const seedData = [
  {
    tournament: {
      name: 'BGMI Masters Series',
      slug: 'bgmi-masters-series',
      game: 'BGMI',
      region: 'India',
      organizer: 'NODWIN Gaming',
      description:
        'BGMI Masters Series is one of India\'s leading televised BGMI esports tournaments, featuring top domestic teams in a multi-week LAN format.',
    },
    edition: {
      year: 'Season 5 2026',
      slug: 'season-5-2026',
      tournamentStatus: 'group_stage',
      startDate: '2026-08-10T00:00:00.000Z',
      endDate: '2026-09-06T00:00:00.000Z',
      venue: 'Delhi NCR, India',
      format: 'LAN',
      prizePool: '₹1.01 Crore',
      totalTeams: 26,
      publishStatus: 'published',
      description:
        'BGMI Masters Series Season 5 is a major Indian BGMI LAN event organized by NODWIN Gaming, running from August 10 to September 6, 2026 with 26 teams and a ₹1.01 Crore prize pool.',
      stages: [
        {
          name: 'League Stage',
          startDate: '2026-08-10T00:00:00.000Z',
          endDate: '2026-09-02T00:00:00.000Z',
          venue: 'Delhi NCR, India',
          format: 'LAN',
          totalTeams: 26,
          teamsAdvancing: null,
          notes: 'Multi-week league phase. GodLike Esports and Orangutan reportedly received a later-stage bye due to PMWC 2026 participation.',
        },
        {
          name: 'Grand Finals',
          startDate: '2026-09-04T00:00:00.000Z',
          endDate: '2026-09-06T00:00:00.000Z',
          venue: 'Delhi NCR, India',
          format: 'LAN',
          totalTeams: null,
          teamsAdvancing: null,
          notes: 'Final stage of BGMI Masters Series Season 5.',
        },
      ],
      broadcastLinks: [],
      prizeBreakdown: [],
    },
  },
  {
    tournament: {
      name: 'Battlegrounds Mobile India Showdown',
      slug: 'battlegrounds-mobile-india-showdown',
      game: 'BGMI',
      region: 'India',
      organizer: 'KRAFTON India',
      description:
        'Battlegrounds Mobile India Showdown is an invite-only BGMI tournament featuring top Indian teams, with qualification links to international competition.',
    },
    edition: {
      year: '2026',
      slug: '2026',
      tournamentStatus: 'upcoming',
      startDate: '2026-09-22T00:00:00.000Z',
      endDate: '2026-10-18T00:00:00.000Z',
      venue: 'India',
      format: 'Hybrid',
      prizePool: '₹1 Crore',
      totalTeams: 48,
      publishStatus: 'published',
      description:
        'Battlegrounds Mobile India Showdown 2026 is an invite-only BGMI event organized by KRAFTON India, featuring 48 Indian teams and a ₹1 Crore prize pool. The top six teams qualify for BMIC 2026.',
      stages: [
        {
          name: 'Promotion / Relegation and Survival Stages',
          startDate: '2026-09-22T00:00:00.000Z',
          endDate: '2026-10-13T00:00:00.000Z',
          venue: 'India',
          format: 'Online',
          totalTeams: 48,
          teamsAdvancing: null,
          notes: 'Invite-only domestic stage based on KIE Leaderboard, BGIS, and BMPS performances.',
        },
        {
          name: 'LAN Grand Finals',
          startDate: '2026-10-16T00:00:00.000Z',
          endDate: '2026-10-18T00:00:00.000Z',
          venue: 'India',
          format: 'LAN',
          totalTeams: null,
          teamsAdvancing: 6,
          notes: 'Top six teams qualify for BGMI International Cup 2026.',
        },
      ],
      broadcastLinks: [],
      prizeBreakdown: [],
    },
  },
  {
    tournament: {
      name: 'BGMI International Cup',
      slug: 'bgmi-international-cup',
      game: 'BGMI',
      region: 'South Asia',
      organizer: 'KRAFTON India',
      description:
        'BGMI International Cup is KRAFTON India\'s international BGMI LAN event featuring top teams from India, South Korea, and Japan.',
    },
    edition: {
      year: 'Season 2 2026',
      slug: 'season-2-2026',
      tournamentStatus: 'upcoming',
      startDate: '2026-10-30T00:00:00.000Z',
      endDate: '2026-11-01T00:00:00.000Z',
      venue: 'The Dome, SVP Indoor Stadium, Mumbai, India',
      format: 'LAN',
      prizePool: '₹1 Crore',
      totalTeams: 16,
      publishStatus: 'published',
      description:
        'BGMI International Cup Season 2 2026 is a cross-regional LAN event organized by KRAFTON India, featuring 16 teams from India, South Korea, and Japan. The champion qualifies for PMGC 2026.',
      stages: [
        {
          name: 'Main Event',
          startDate: '2026-10-30T00:00:00.000Z',
          endDate: '2026-11-01T00:00:00.000Z',
          venue: 'The Dome, SVP Indoor Stadium, Mumbai, India',
          format: 'LAN',
          totalTeams: 16,
          teamsAdvancing: 1,
          notes: '16 teams: 6 from India, 5 from South Korea, and 5 from Japan. Champion qualifies for PMGC 2026.',
        },
      ],
      broadcastLinks: [],
      prizeBreakdown: [],
    },
  },
  {
    tournament: {
      name: 'PUBG Mobile World Cup',
      slug: 'pubg-mobile-world-cup',
      game: 'PUBG Mobile',
      region: 'Global',
      organizer: 'KRAFTON, Level Infinite, Esports World Cup Foundation',
      description:
        'PUBG Mobile World Cup is a global mid-season PUBG Mobile championship featuring top teams from major competitive regions.',
    },
    edition: {
      year: '2026',
      slug: '2026',
      tournamentStatus: 'survival_stage',
      startDate: '2026-08-06T00:00:00.000Z',
      endDate: '2026-08-16T00:00:00.000Z',
      venue: 'Paris Expo Porte de Versailles, Paris, France',
      format: 'LAN',
      prizePool: '$3,000,000',
      totalTeams: 32,
      publishStatus: 'published',
      description:
        'PUBG Mobile World Cup 2026 is a global PUBG Mobile LAN championship held in Paris, featuring 32 teams and a $3 million prize pool across Group Stage, Survival Stage, and Grand Finals.',
      stages: [
        {
          name: 'Group Stage',
          startDate: '2026-08-06T00:00:00.000Z',
          endDate: '2026-08-09T00:00:00.000Z',
          venue: 'Paris Expo Porte de Versailles, Paris, France',
          format: 'LAN',
          totalTeams: 32,
          teamsAdvancing: 10,
          notes: '32 teams split into two groups. Top five from each group advanced directly to Grand Finals.',
        },
        {
          name: 'Survival Stage',
          startDate: '2026-08-11T00:00:00.000Z',
          endDate: '2026-08-12T00:00:00.000Z',
          venue: 'Paris Expo Porte de Versailles, Paris, France',
          format: 'LAN',
          totalTeams: 16,
          teamsAdvancing: 6,
          notes: 'Teams placed 6th to 13th from the Group Stage compete for the final six Grand Finals slots.',
        },
        {
          name: 'Grand Finals',
          startDate: '2026-08-14T00:00:00.000Z',
          endDate: '2026-08-16T00:00:00.000Z',
          venue: 'Paris Expo Porte de Versailles, Paris, France',
          format: 'LAN',
          totalTeams: 16,
          teamsAdvancing: 1,
          notes: '10 Group Stage qualifiers and six Survival Stage qualifiers compete for the PMWC 2026 title. Final day includes Smash Rule / match-point format.',
        },
      ],
      broadcastLinks: [],
      prizeBreakdown: [
        { place: 'Total Prize Pool', amount: '$3,000,000' },
        { place: 'Grand Finals Allocation', amount: '$1,700,000' },
        { place: 'Group Stage Allocation', amount: '$1,148,000' },
        { place: 'Survival Stage Allocation', amount: '$152,000' },
        { place: 'Tournament MVP', amount: '$25,000' },
      ],
    },
  },
]

async function main() {
  for (const item of seedData) {
    const t = item.tournament
    const tournamentId = `tournament-${t.slug}`

    const tournamentDoc = omitEmpty({
      _id: tournamentId,
      _type: 'tournament',
      name: t.name,
      slug: slug(t.slug),
      game: t.game || null,
      region: t.region || null,
      organizer: t.organizer || null,
      description: t.description || null,
    })

    await client.createIfNotExists(tournamentDoc)
    console.log(`Tournament ensured: ${t.name} (${tournamentId})`)

    const e = item.edition
    const editionId = `edition-${t.slug}-${e.slug}`

    const editionDoc = {
      _id: editionId,
      _type: 'tournamentEdition',
      tournament: ref(tournamentId),
      year: e.year,
      slug: slug(e.slug),
      tournamentStatus: e.tournamentStatus,
      startDate: e.startDate,
      endDate: e.endDate,
      venue: e.venue || null,
      format: e.format || null,
      prizePool: e.prizePool || null,
      totalTeams: e.totalTeams ?? null,
      publishStatus: e.publishStatus,
      description: e.description || null,
      stages: (e.stages || []).map((s) => ({
        _type: 'stage',
        _key: key(),
        name: s.name,
        status: stageStatus(s.startDate, s.endDate),
        startDate: s.startDate,
        endDate: s.endDate,
        venue: s.venue || null,
        format: s.format || null,
        totalTeams: s.totalTeams ?? null,
        teamsAdvancing: s.teamsAdvancing ?? null,
        notes: s.notes || null,
      })),
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
    }

    await client.createIfNotExists(editionDoc)
    console.log(`Edition ensured: ${e.year} for ${t.name} (${editionId})`)
  }

  console.log('Seeding complete.')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
