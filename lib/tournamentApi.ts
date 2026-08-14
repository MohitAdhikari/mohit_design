import { client } from './sanityClient'

// ─── Shared types ──────────────────────────────────────────────────────

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

export interface TeamSummary {
  _id: string
  name: string
  shortName?: string | null
  slug?: { current: string } | null
  game?: string | null
  country?: string | null
  region?: string | null
  logoUrl: string | null
}

export interface EditionParticipant {
  _key?: string
  team: TeamSummary | null
  group?: string | null
  seed?: number | null
  inviteSource?: string | null
  status?: 'invited' | 'qualified' | 'active' | 'eliminated' | 'withdrawn' | null
  notes?: string | null
}

export interface PrizeStage {
  _key?: string
  stageName: string
  stagePool?: number | null
  stageCurrency?: string | null
  stageNotes?: string | null
}

export interface PrizePlacement {
  _key?: string
  placement: string
  prize?: number | null
  currency?: string | null
  team?: TeamSummary | null
  notes?: string | null
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
  totalPrizePool: number | null
  prizePoolCurrency: string | null
  prizePoolDisplay: string | null
  prizePoolStages: PrizeStage[]
  prizePlacements: PrizePlacement[]
  totalTeams: number | null
  liquipediaUrl: string | null
  officialUrl: string | null
  twitterUrl: string | null
  publishStatus: 'draft' | 'review' | 'published' | null
  description: string | null
  winner: TeamSummary | null
  runnerUp: TeamSummary | null
  mvp: { _id: string; name: string; photoUrl: string | null } | null
  broadcastLinks: { platform: string; url: string }[]
  teams: TeamSummary[]
  participants: EditionParticipant[]
}

// ─── GROQ fragments ────────────────────────────────────────────────────

const TEAM_FRAGMENT = `
  _id, name, shortName, slug, game, country, region,
  "logoUrl": logo.asset->url
`

// ─── Tournament queries ────────────────────────────────────────────────

export async function getTournaments(): Promise<Tournament[]> {
  const query = `*[_type == "tournament"] {
    _id, _createdAt, name, slug, game, region,
    "logoUrl": logo.asset->url,
    "bannerUrl": banner.asset->url,
    organizer, liquipediaUrl, officialUrl, twitterUrl, description,
    "latestEdition": *[
      _type == "tournamentEdition" &&
      tournament._ref == ^._id &&
      publishStatus == "published"
    ] | order(startDate desc) [0] {
      tournamentStatus, startDate, endDate
    }
  }`

  const raw = (await client.fetch(query)) ?? []

  const order: Record<string, number> = {
    group_stage: 0, survival_stage: 0, grand_finals: 0, upcoming: 1, completed: 2,
  }

  return (raw as any[]).slice().sort((a, b) => {
    const aS = a.latestEdition?.tournamentStatus ?? 'upcoming'
    const bS = b.latestEdition?.tournamentStatus ?? 'upcoming'
    const aO = order[aS] ?? 1
    const bO = order[bS] ?? 1
    if (aO !== bO) return aO - bO
    const aD = a.latestEdition?.startDate ?? ''
    const bD = b.latestEdition?.startDate ?? ''
    return aO === 1 ? (aD < bD ? -1 : 1) : (aD > bD ? -1 : 1)
  })
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  return client.fetch(
    `*[_type == "tournament" && slug.current == $slug][0] {
      _id, _createdAt, name, slug, game, region,
      "logoUrl": logo.asset->url,
      "bannerUrl": banner.asset->url,
      organizer, liquipediaUrl, officialUrl, twitterUrl, description
    }`,
    { slug },
  )
}

export async function getTournamentEditions(tournamentId: string): Promise<TournamentEdition[]> {
  return client.fetch(
    `*[
      _type == "tournamentEdition" &&
      tournament._ref == $tournamentId &&
      publishStatus == "published"
    ] | order(startDate desc) {
      _id, year, slug, tournamentStatus,
      "stages": stages[]{ name, status, startDate, endDate, venue, format, totalTeams, teamsAdvancing, notes },
      "editionBannerUrl": editionBanner.asset->url,
      startDate, endDate, venue, format,
      totalPrizePool, prizePoolCurrency, prizePoolDisplay,
      "prizePoolStages": prizePoolStages[]{ _key, stageName, stagePool, stageCurrency, stageNotes },
      "prizePlacements": prizePlacements[]{
        _key, placement, prize, currency, notes,
        "team": team->{ ${TEAM_FRAGMENT} }
      },
      totalTeams, liquipediaUrl, officialUrl, twitterUrl,
      publishStatus, description,
      "winner":   winner->{ ${TEAM_FRAGMENT} },
      "runnerUp": runnerUp->{ ${TEAM_FRAGMENT} },
      "mvp": mvp->{ _id, name, "photoUrl": photo.asset->url },
      "broadcastLinks": broadcastLinks[]{ platform, url },
      "participants": coalesce(participants[]{
        _key, group, seed, inviteSource, status, notes,
        "team": team->{ ${TEAM_FRAGMENT} }
      }, []),
      "teams": coalesce(teams[]->{ ${TEAM_FRAGMENT} }, [])
    }`,
    { tournamentId },
  )
}

export async function getAllTournamentSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(
    `*[_type == "tournament" && defined(slug.current)]{ "slug": slug.current }`,
  )
}

export async function getEditionBySlug(
  slug: string,
): Promise<{ _id: string; title: string; slug: { current: string } | null } | null> {
  return client.fetch(
    `*[_type in ["edition","tournamentEdition"] && slug.current == $slug && publishStatus == "published"][0]{
      _id, "title": tournament->name + " — " + year, slug
    }`,
    { slug },
  )
}

export async function getActiveEditionByTournamentSlug(
  slug: string,
): Promise<{ _id: string; title: string; slug: { current: string } | null } | null> {
  return client.fetch(
    `*[_type in ["edition","tournamentEdition"] && tournament->slug.current == $slug]
     | order(startDate desc)[0]{
       _id, "title": tournament->name + " — " + year, slug
     }`,
    { slug },
  )
}

/** Same as getActiveEditionByTournamentSlug, but looked up by the tournament's document _id. */
export async function getActiveEditionByTournamentId(
  tournamentId: string,
): Promise<{ _id: string; title: string; slug: { current: string } | null; tournamentStatus: string | null } | null> {
  return client.fetch(
    `*[_type in ["edition","tournamentEdition"] && tournament._ref == $tournamentId]
     | order(startDate desc)[0]{
       _id, "title": tournament->name + " — " + year, slug, tournamentStatus
     }`,
    { tournamentId },
  )
}

// ─── Status helpers ────────────────────────────────────────────────────

export function getTournamentStatus(
  startDate: string | null,
  endDate: string | null,
  tournamentStatus?: string | null,
): 'UPCOMING' | 'ONGOING' | 'COMPLETED' {
  if (tournamentStatus) {
    if (tournamentStatus === 'completed') return 'COMPLETED'
    if (tournamentStatus === 'upcoming')  return 'UPCOMING'
    return 'ONGOING'
  }
  if (!startDate) return 'UPCOMING'
  const now   = Date.now()
  const start = new Date(startDate).getTime()
  const end   = endDate ? new Date(endDate).getTime() : null
  if (now < start) return 'UPCOMING'
  if (end && now > end) return 'COMPLETED'
  return 'ONGOING'
}

export function getCurrentStageLabel(stages: TournamentStage[]): string | null {
  const live = stages.find((s) => s.status === 'live')
  if (live) return live.name
  const next = stages.find((s) => s.status === 'upcoming')
  if (next) return `${next.name} (Upcoming)` 
  return null
}

/** Returns the best human-readable prize string for an edition, no import needed. */
export function getEditionPrizeDisplay(
  edition: Pick<TournamentEdition, 'prizePoolDisplay' | 'totalPrizePool' | 'prizePoolCurrency'>,
): string | null {
  if (edition.prizePoolDisplay) return edition.prizePoolDisplay
  if (edition.totalPrizePool == null) return null
  // inline to avoid circular import
  const currency = edition.prizePoolCurrency ?? 'INR'
  const amount   = edition.totalPrizePool
  const sym      = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `${sym}${(amount / 10_000_000).toFixed(2).replace(/\.?0+$/, '')} Cr` 
    if (amount >= 100_000)   return `${sym}${(amount / 100_000).toFixed(1).replace(/\.0$/, '')} L` 
    return `${sym}${amount.toLocaleString('en-IN')}` 
  }
  if (amount >= 1_000_000) return `${sym}${(amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M` 
  if (amount >= 1_000)     return `${sym}${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K` 
  return `${sym}${amount.toLocaleString()}` 
}

// ─── Match types ───────────────────────────────────────────────────────

export interface MatchParticipant {
  team: { _id: string; name: string; logoUrl: string | null } | null
  placement: number | null
  kills: number | null
  placementPoints: number | null
  points: number | null
}

export interface Match {
  _id: string
  matchFormat: 'head_to_head' | 'battle_royale'
  team1: { name: string; logoUrl: string | null } | null
  team2: { name: string; logoUrl: string | null } | null
  team1Score: number | null
  team2Score: number | null
  participants: MatchParticipant[]
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  stage: string | null
  group: string | null
  matchNumber: number | null
  map: string | null
  scheduledAt: string
  winner: { name: string } | null
  broadcastUrl: string | null
}

export type StandingRow = {
  _key?: string
  rank: number
  team?: { _id: string; name: string; slug?: { current: string }; logoUrl?: string | null } | null
  teamName?: string | null
  matchesPlayed?: number | null
  wins?: number | null
  losses?: number | null
  wwcd?: number | null
  placementPoints?: number | null
  kills?: number | null
  points: number
  change?: number | null
  qualified?: boolean | null
  eliminated?: boolean | null
  notes?: string | null
}

export type StandingTable = {
  _id: string
  title: string
  stage?: string | null
  group?: string | null
  day?: number | null
  afterMatch?: number | null
  status?: string | null
  lastUpdated?: string | null
  mobileCardStyle?: 'modern' | 'classic' | null
  mobileHiddenStats?: string[] | null
  rows: StandingRow[]
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

// ─── Match queries ─────────────────────────────────────────────────────

export async function getMatches(editionId: string): Promise<Match[]> {
  return client.fetch(
    `*[_type == "match" && edition._ref == $editionId] | order(scheduledAt asc) {
      _id, matchFormat,
      team1->{ name, "logoUrl": logo.asset->url },
      team2->{ name, "logoUrl": logo.asset->url },
      team1Score, team2Score,
      "participants": participants[]{
        "team": team->{ _id, name, "logoUrl": logo.asset->url },
        placement, kills, placementPoints, points
      } | order(placement asc),
      status, stage, group, matchNumber, map, scheduledAt,
      winner->{ name }, broadcastUrl
    }`,
    { editionId },
  )
}

// ─── Standing queries ──────────────────────────────────────────────────

export async function getStandings(editionId: string): Promise<StandingTable[]> {
  return client.fetch(
    `*[_type == "standing" && edition._ref == $editionId && status == "published"]
     | order(stage asc, group asc, day asc, afterMatch asc, _createdAt desc) {
       _id, title, stage, group, day, afterMatch, status, lastUpdated, mobileCardStyle, mobileHiddenStats,
       rows[]{
         _key, rank, teamName, matchesPlayed, wins, losses, wwcd,
         placementPoints, kills, points, change, qualified, eliminated, notes,
         team->{ _id, name, slug, "logoUrl": logo.asset->url }
       }
     }`,
    { editionId },
  )
}

export type Standing = StandingRow

/**
 * Picks the standing table whose lastUpdated (falling back to _createdAt-like
 * ordering already applied by getStandings) is closest to a given reference
 * date. Used to show the most relevant standings snapshot next to an article
 * when no same-day match data is available.
 */
export function getClosestStandingTable(
  standings: StandingTable[],
  referenceDate: string | Date,
): StandingTable | null {
  if (!standings.length) return null
  const ref = new Date(referenceDate).getTime()
  return standings
    .filter((t) => t.lastUpdated)
    .reduce<{ table: StandingTable | null; diff: number }>((best, table) => {
      const diff = Math.abs(new Date(table.lastUpdated as string).getTime() - ref)
      return diff < best.diff ? { table, diff } : best
    }, { table: standings[0], diff: Infinity }).table
}

// ─── Article queries ───────────────────────────────────────────────────

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
    `*[_type == "newsPost" && status == "published" &&
      (!defined(publishDate) || dateTime(publishDate) <= dateTime(now()))
    ] | order(dateTime(coalesce(publishDate, _createdAt)) desc) [0...$limit] { ${ARTICLE_FIELDS} }`,
    { limit },
  )
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return client.fetch(
    `*[_type == "newsPost" && slug.current == $slug && status == "published" &&
      (!defined(publishDate) || dateTime(publishDate) <= dateTime(now()))
    ][0] {
      ${ARTICLE_FIELDS},
      imageCaption, authorName, badge, badgeCustom, hideHeroImage,
      content[]{
        ...,
        _type == "image" => { ..., "assetUrl": asset->url, "assetDimensions": asset->metadata{ dimensions } }
      },
      "relatedTeams":   teams[]->{ _id, name, "logoUrl": logo.asset->url },
      "relatedPlayers": players[]->{ _id, name },
      "seo": { "metaTitle": seo.seoTitle, "metaDescription": seo.metaDescription, "ogImage": seo.socialShareImage.asset->url }
    }`,
    { slug },
  )
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  return client.fetch(
    `*[_type == "newsPost" && status == "published" && defined(slug.current)]{ "slug": slug.current }`,
  )
}

export async function getActiveEdition(): Promise<any | null> {
  return client.fetch(
    `*[_type == "tournamentEdition" && publishStatus == "published"]
     | order(startDate desc)[0]{
       _id,
       startDate,
       endDate,
       tournamentStatus,
       "tournament": tournament->{ name, "slug": slug.current }
     }`,
  )
}
