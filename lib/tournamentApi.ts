import { client } from './sanityClient'

export interface TournamentStage {
  name: string
  status: 'upcoming' | 'live' | 'completed'
  startDate: string | null
  endDate: string | null
  venue: string | null
  format: string | null
  totalTeams: number | null
  teamsAdvancing: number | null
  notes: string | null
}

export interface Tournament {
  _id: string
  _createdAt: string
  name: string
  slug: { current: string }
  game: string | null
  region: string | null
  logoUrl: string | null
  bannerUrl: string | null
  organizer: string | null
  liquipediaUrl: string | null
  officialUrl: string | null
  twitterUrl: string | null
  description: string | null
  latestEdition?: {
    tournamentStatus: string | null
    startDate: string | null
    endDate: string | null
  } | null
}

export interface TournamentEdition {
  _id: string
  year: string
  slug: { current: string } | null
  tournamentStatus: 'upcoming' | 'group_stage' | 'survival_stage' | 'grand_finals' | 'completed' | null
  stages: TournamentStage[]
  editionBannerUrl: string | null
  startDate: string | null
  endDate: string | null
  venue: string | null
  format: 'Online' | 'LAN' | 'Hybrid' | null
  prizePool: string | null
  prizeBreakdown: { place: string; amount: string }[]
  totalTeams: number | null
  liquipediaUrl: string | null
  officialUrl: string | null
  twitterUrl: string | null
  publishStatus: 'draft' | 'review' | 'published' | null
  description: string | null
  winner: { _id: string; name: string; logoUrl: string | null } | null
  runnerUp: { _id: string; name: string; logoUrl: string | null } | null
  mvp: { _id: string; name: string; photoUrl: string | null } | null
  broadcastLinks: { platform: string; url: string }[]
  teams: { _id: string; name: string; logoUrl: string | null }[]
}

// Returns ONGOING first, then UPCOMING (soonest first), then COMPLETED (most recent first)
export async function getTournaments(): Promise<Tournament[]> {
  const query = `*[_type == "tournament"] {
    _id,
    _createdAt,
    name,
    slug,
    game,
    region,
    "logoUrl": logo.asset->url,
    "bannerUrl": banner.asset->url,
    organizer,
    liquipediaUrl,
    officialUrl,
    twitterUrl,
    description,
    // Pull latest edition's status + dates for sorting
    "latestEdition": *[_type == "tournamentEdition" && tournament._ref == ^._id && publishStatus == "published"] | order(startDate desc) [0] {
      tournamentStatus,
      startDate,
      endDate
    }
  }`

  const raw = await client.fetch(query)

  // Sort: ongoing → upcoming → completed
  const order = { group_stage: 0, survival_stage: 0, grand_finals: 0, upcoming: 1, completed: 2 }

  return raw.sort((a: any, b: any) => {
    const aStatus = a.latestEdition?.tournamentStatus ?? 'upcoming'
    const bStatus = b.latestEdition?.tournamentStatus ?? 'upcoming'
    const aOrder = order[aStatus as keyof typeof order] ?? 1
    const bOrder = order[bStatus as keyof typeof order] ?? 1
    if (aOrder !== bOrder) return aOrder - bOrder
    // Within same group: upcoming → ascending date, completed → descending date
    const aDate = a.latestEdition?.startDate ?? ''
    const bDate = b.latestEdition?.startDate ?? ''
    if (aOrder === 1) return aDate < bDate ? -1 : 1   // upcoming: soonest first
    return aDate > bDate ? -1 : 1                      // completed: most recent first
  })
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const query = `*[_type == "tournament" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    game,
    region,
    "logoUrl": logo.asset->url,
    "bannerUrl": banner.asset->url,
    organizer,
    liquipediaUrl,
    officialUrl,
    twitterUrl,
    description
  }`
  return client.fetch(query, { slug })
}

export async function getTournamentEditions(tournamentId: string): Promise<TournamentEdition[]> {
  const query = `*[_type == "tournamentEdition" && tournament._ref == $tournamentId && publishStatus == "published"] | order(startDate desc) {
    _id,
    year,
    slug,
    tournamentStatus,
    "stages": stages[] {
      name,
      status,
      startDate,
      endDate,
      venue,
      format,
      totalTeams,
      teamsAdvancing,
      notes
    },
    "editionBannerUrl": editionBanner.asset->url,
    startDate,
    endDate,
    venue,
    format,
    prizePool,
    "prizeBreakdown": prizeBreakdown[]{ place, amount },
    totalTeams,
    liquipediaUrl,
    officialUrl,
    twitterUrl,
    publishStatus,
    description,
    "winner": winner->{ _id, name, "logoUrl": logo.asset->url },
    "runnerUp": runnerUp->{ _id, name, "logoUrl": logo.asset->url },
    "mvp": mvp->{ _id, name, "photoUrl": photo.asset->url },
    "broadcastLinks": broadcastLinks[]{ platform, url },
    "teams": teams[]->{ _id, name, "logoUrl": logo.asset->url }
  }`
  return client.fetch(query, { tournamentId })
}

export async function getAllTournamentSlugs(): Promise<{ slug: string }[]> {
  const query = `*[_type == "tournament" && defined(slug.current)] { "slug": slug.current }` 
  return client.fetch(query)
}

// Derives display status from the tournamentStatus field on the latest edition
export function getTournamentStatus(
  startDate: string | null,
  endDate: string | null,
  tournamentStatus?: string | null
): 'UPCOMING' | 'ONGOING' | 'COMPLETED' {
  if (tournamentStatus) {
    if (tournamentStatus === 'completed') return 'COMPLETED'
    if (tournamentStatus === 'upcoming') return 'UPCOMING'
    return 'ONGOING' // group_stage, survival_stage, grand_finals
  }
  // Fallback to date-based
  if (!startDate) return 'UPCOMING'
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = endDate ? new Date(endDate).getTime() : null
  if (now < start) return 'UPCOMING'
  if (end && now > end) return 'COMPLETED'
  return 'ONGOING'
}

// Returns the current live stage label for display (e.g. "Grand Finals")
export function getCurrentStageLabel(stages: TournamentStage[]): string | null {
  const live = stages.find((s) => s.status === 'live')
  if (live) return live.name
  const upcoming = stages.find((s) => s.status === 'upcoming')
  if (upcoming) return `${upcoming.name} (Upcoming)` 
  return null
}
