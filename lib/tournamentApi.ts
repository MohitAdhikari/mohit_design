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

export async function getEditionBySlug(
  slug: string
): Promise<{ _id: string; title: string; slug: { current: string } | null } | null> {
  return client.fetch(
    `*[_type in ["edition", "tournamentEdition"] && slug.current == $slug && publishStatus == "published"][0] {
      _id,
      "title": tournament->name + " — " + year,
      slug
    }`,
    { slug }
  )
}

export async function getActiveEditionByTournamentSlug(
  slug: string
): Promise<{ _id: string; title: string; slug: { current: string } | null } | null> {
  return client.fetch(
    `*[_type in ["edition", "tournamentEdition"] && tournament->slug.current == $slug]
     | order(startDate desc)[0] {
        _id,
        "title": tournament->name + " — " + year,
        slug
      }`,
    { slug }
  )
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
  team1: { name: string; logoUrl: string | null }
  team2: { name: string; logoUrl: string | null }
  team1Score: number | null
  team2Score: number | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  stage: string | null
  group: string | null
  matchNumber: number | null
  map: string | null
  scheduledAt: string
  winner: { name: string } | null
  broadcastUrl: string | null
}

export interface Standing {
  _id: string
  team: { name: string; logoUrl: string | null }
  group: string | null
  rank: number
  wins: number
  losses: number
  points: number
  kills: number
  placementPoints: number
  matchesPlayed: number
  wwcd: number
  lastUpdated: string
}

export interface Article {
  _id: string
  title: string
  slug: { current: string }
  publishDate: string | null
  excerpt: string | null
  thumbnailUrl: string | null
  imageAlt: string | null
  author: { name: string; photoUrl: string | null } | null
  category: string | null
  tags: { _id: string; title: string; slug: { current: string } }[]
  tournament: { _id: string; name: string; slug: { current: string } } | null
}

export interface ArticleDetail extends Article {
  imageCaption: string | null
  authorName: string | null
  badge: string | null
  badgeCustom: string | null
  hideHeroImage: boolean
  content: any[]
  relatedTeams: { _id: string; name: string; logoUrl: string | null }[]
  relatedPlayers: { _id: string; name: string }[]
  seo: { metaTitle: string | null; metaDescription: string | null; ogImage: string | null } | null
}

// ─── MATCH QUERIES ────────────────────────────────────────────────────

export async function getMatches(editionId: string): Promise<Match[]> {
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId] | order(scheduledAt asc) {
      _id,
      team1->{ name, "logoUrl": logo.asset->url },
      team2->{ name, "logoUrl": logo.asset->url },
      team1Score, team2Score,
      status, stage, group, matchNumber, map,
      scheduledAt,
      winner->{ name },
      broadcastUrl
    }`,
    { editionId }
  )
}

// ─── STANDING QUERIES ─────────────────────────────────────────────────

export async function getStandings(editionId: string): Promise<Standing[]> {
  return client.fetch(
    `*[_type == "standing" && edition._ref == $editionId] | order(rank asc) {
      _id,
      team->{ name, "logoUrl": logo.asset->url },
      group, rank, wins, losses,
      points, kills, placementPoints,
      matchesPlayed, wwcd, lastUpdated
    }`,
    { editionId }
  )
}

// ─── ARTICLE QUERIES ──────────────────────────────────────────────────

const ARTICLE_FIELDS = `
  _id, title, slug, publishDate, excerpt,
  "thumbnailUrl": thumbnail.asset->url,
  "imageAlt": imageAlt,
  "author": author->{ name, "photoUrl": photo.asset->url },
  "category": category,
  "tournament": tournament->{ _id, name, slug },
  "tags": tags[]->{ _id, title, slug }
`

export async function getArticles(limit = 20): Promise<Article[]> {
  return client.fetch(
    `*[_type == "newsPost" && status == "published" && (!defined(publishDate) || dateTime(publishDate) <= dateTime(now()))] | order(dateTime(coalesce(publishDate, _createdAt)) desc) [0...$limit] { ${ARTICLE_FIELDS} }`,
    { limit }
  )
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return client.fetch(
    `*[_type == "newsPost" && slug.current == $slug && status == "published" && (!defined(publishDate) || dateTime(publishDate) <= dateTime(now()))][0] {
      ${ARTICLE_FIELDS},
      "imageCaption": imageCaption,
      "authorName": authorName,
      "badge": badge,
      "badgeCustom": badgeCustom,
      "hideHeroImage": hideHeroImage,
      content[]{
        ...,
        _type == "image" => {
          ...,
          "assetUrl": asset->url,
          "assetDimensions": asset->metadata { dimensions }
        }
      },
      "relatedTeams": teams[]->{ _id, name, "logoUrl": logo.asset->url },
      "relatedPlayers": players[]->{ _id, name },
      "seo": { "metaTitle": seo.seoTitle, "metaDescription": seo.metaDescription, "ogImage": seo.socialShareImage.asset->url }
    }`,
    { slug }
  )
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(
    `*[_type == "newsPost" && status == "published" && defined(slug.current)] { "slug": slug.current }`
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
