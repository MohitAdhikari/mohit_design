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

// ─── MATCH TYPES ──────────────────────────────────────────────────────

export interface Match {
  _id: string
  matchNumber: number | null
  stage: 'group_stage' | 'survival_stage' | 'semifinals' | 'grand_finals' | null
  group: string | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  scheduledAt: string | null
  team1: { _id: string; name: string; logoUrl: string | null } | null
  team2: { _id: string; name: string; logoUrl: string | null } | null
  team1Score: number
  team2Score: number
  winner: { _id: string; name: string; logoUrl: string | null } | null
  map: string | null
  broadcastUrl: string | null
  playerOfMatch: { _id: string; name: string; photoUrl: string | null } | null
  highlightStat: string | null
}

export interface Standing {
  _id: string
  rank: number
  team: { _id: string; name: string; logoUrl: string | null }
  group: string
  matchesPlayed: number
  wins: number
  losses: number
  points: number
  kills: number
  placementPoints: number
  killPoints: number
  isEliminated: boolean
  isAdvanced: boolean
  lastUpdated: string | null
}

export interface Article {
  _id: string
  title: string
  slug: { current: string }
  type: 'news' | 'preview' | 'recap' | 'standings' | 'analysis' | 'tournament_report' | 'roster_move' | 'guide'
  status: 'draft' | 'review' | 'published'
  publishedAt: string | null
  excerpt: string | null
  coverImageUrl: string | null
  coverImageAlt: string | null
  author: { name: string; photoUrl: string | null } | null
  tournament: { _id: string; name: string; slug: { current: string } } | null
  edition: { _id: string; year: string } | null
  relatedTeams: { _id: string; name: string; logoUrl: string | null }[]
  tags: { _id: string; title: string; slug: { current: string } }[]
}

export interface ArticleDetail extends Article {
  body: any[]
  relatedMatches: { _id: string }[]
  relatedPlayers: { _id: string; name: string }[]
  seo: { metaTitle: string | null; metaDescription: string | null } | null
}

// ─── MATCH QUERIES ────────────────────────────────────────────────────

const MATCH_FIELDS = `
  _id, matchNumber, stage, group, status, scheduledAt,
  "team1": team1->{ _id, name, "logoUrl": logo.asset->url },
  "team2": team2->{ _id, name, "logoUrl": logo.asset->url },
  team1Score, team2Score,
  "winner": winner->{ _id, name, "logoUrl": logo.asset->url },
  map, broadcastUrl,
  "playerOfMatch": playerOfMatch->{ _id, name, "photoUrl": photo.asset->url },
  highlightStat
`

export async function getMatchesByEdition(editionId: string): Promise<Match[]> {
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId] | order(scheduledAt asc) { ${MATCH_FIELDS} }`,
    { editionId }
  )
}

export async function getLiveMatches(editionId: string): Promise<Match[]> {
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId && status == "live"] | order(scheduledAt asc) { ${MATCH_FIELDS} }`,
    { editionId }
  )
}

export async function getTodaysMatches(editionId: string): Promise<Match[]> {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setHours(23, 59, 59, 999)
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId && scheduledAt >= $start && scheduledAt <= $end] | order(scheduledAt asc) { ${MATCH_FIELDS} }`,
    { editionId, start: start.toISOString(), end: end.toISOString() }
  )
}

export async function getMatchesByStage(editionId: string, stage: string): Promise<Match[]> {
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId && stage == $stage] | order(scheduledAt asc) { ${MATCH_FIELDS} }`,
    { editionId, stage }
  )
}

// ─── STANDING QUERIES ─────────────────────────────────────────────────

const STANDING_FIELDS = `
  _id, rank,
  "team": team->{ _id, name, "logoUrl": logo.asset->url },
  group, matchesPlayed, wins, losses, points, kills,
  placementPoints, killPoints, isEliminated, isAdvanced, lastUpdated
`

export async function getStandingsByEdition(editionId: string): Promise<Standing[]> {
  return client.fetch(
    `*[_type == "standing" && edition._ref == $editionId] | order(rank asc) { ${STANDING_FIELDS} }`,
    { editionId }
  )
}

export async function getStandingsByGroup(editionId: string, group: string): Promise<Standing[]> {
  return client.fetch(
    `*[_type == "standing" && edition._ref == $editionId && group == $group] | order(rank asc) { ${STANDING_FIELDS} }`,
    { editionId, group }
  )
}

// ─── ARTICLE QUERIES ──────────────────────────────────────────────────

const ARTICLE_FIELDS = `
  _id, title, slug, type, status, publishedAt, excerpt,
  "coverImageUrl": coverImage.asset->url,
  "coverImageAlt": coverImage.alt,
  "author": author->{ name, "photoUrl": photo.asset->url },
  "tournament": tournament->{ _id, name, slug },
  "edition": edition->{ _id, year },
  "relatedTeams": relatedTeams[]->{ _id, name, "logoUrl": logo.asset->url },
  "tags": tags[]->{ _id, title, slug }
`

export async function getArticles(limit = 20): Promise<Article[]> {
  return client.fetch(
    `*[_type == "article" && status == "published"] | order(publishedAt desc) [0...$limit] { ${ARTICLE_FIELDS} }`,
    { limit }
  )
}

export async function getArticlesByType(type: string, limit = 10): Promise<Article[]> {
  return client.fetch(
    `*[_type == "article" && status == "published" && type == $type] | order(publishedAt desc) [0...$limit] { ${ARTICLE_FIELDS} }`,
    { type, limit }
  )
}

export async function getArticlesByEdition(editionId: string): Promise<Article[]> {
  return client.fetch(
    `*[_type == "article" && status == "published" && edition._ref == $editionId] | order(publishedAt desc) { ${ARTICLE_FIELDS} }`,
    { editionId }
  )
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return client.fetch(
    `*[_type == "article" && slug.current == $slug && status == "published"][0] {
      ${ARTICLE_FIELDS},
      body,
      "relatedMatches": relatedMatches[]->{ _id },
      "relatedPlayers": relatedPlayers[]->{ _id, name },
      "seo": seo { metaTitle, metaDescription }
    }`,
    { slug }
  )
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(
    `*[_type == "article" && status == "published" && defined(slug.current)] { "slug": slug.current }`
  )
}

export async function getActiveEdition(): Promise<{ _id: string; name: string } | null> {
  return client.fetch(
    `*[_type == "tournamentEdition" && publishStatus == "published"] | order(startDate desc) [0] {
      _id,
      "name": tournament->name + " — " + year
    }`
  )
}
