import { client } from './sanityClient'

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface Tournament {
  _id: string
  _createdAt: string
  name: string
  slug: { current: string }
  logoUrl: string | null
  bannerUrl: string | null
  organizer: string | null
  prizePool: string | null
  venue: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

export interface TournamentEdition {
  _id: string
  year: string
  slug: { current: string } | null
  editionBannerUrl: string | null
  startDate: string | null
  endDate: string | null
  venue: string | null
  format: 'Online' | 'LAN' | 'Hybrid' | null
  prizePool: string | null
  totalTeams: number | null
  publishStatus: 'draft' | 'review' | 'published' | null
  description: string | null
  winner: { _id: string; name: string; logoUrl: string | null } | null
  runnerUp: { _id: string; name: string; logoUrl: string | null } | null
  mvp: { _id: string; name: string; photoUrl: string | null } | null
  broadcastLinks: { platform: string; url: string }[]
  teams: { _id: string; name: string; logoUrl: string | null }[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTournaments(): Promise<Tournament[]> {
  const query = `*[_type == "tournament"] | order(startDate desc) {
    _id,
    _createdAt,
    name,
    slug,
    "logoUrl": logo.asset->url,
    "bannerUrl": banner.asset->url,
    organizer,
    prizePool,
    venue,
    startDate,
    endDate,
    description
  }`
  return client.fetch(query)
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const query = `*[_type == "tournament" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    "logoUrl": logo.asset->url,
    "bannerUrl": banner.asset->url,
    organizer,
    prizePool,
    venue,
    startDate,
    endDate,
    description
  }`
  return client.fetch(query, { slug })
}

export async function getTournamentEditions(tournamentId: string): Promise<TournamentEdition[]> {
  const query = `*[_type == "tournamentEdition" && tournament._ref == $tournamentId && publishStatus == "published"] | order(startDate desc) {
    _id,
    year,
    slug,
    "editionBannerUrl": editionBanner.asset->url,
    startDate,
    endDate,
    venue,
    format,
    prizePool,
    totalTeams,
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

// ─── Helper: compute status from dates ───────────────────────────────────────

export function getTournamentStatus(
  startDate: string | null,
  endDate: string | null
): 'UPCOMING' | 'ONGOING' | 'COMPLETED' {
  if (!startDate) return 'UPCOMING'
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = endDate ? new Date(endDate).getTime() : null
  if (now < start) return 'UPCOMING'
  if (end && now > end) return 'COMPLETED'
  return 'ONGOING'
}
