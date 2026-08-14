/**
 * app/esports/[slug]/bracket/page.tsx
 *
 * Bracket / match results page for a tournament edition.
 * Route: /esports/[slug]/bracket
 *
 * Fetches all matches for the latest edition, grouped by stage.
 * Battle-royale matches render a standings-style table.
 * Head-to-head matches render a score card.
 */

import { getTournamentBySlug, getTournamentEditions, getAllTournamentSlugs } from '@/lib/tournamentApi'
import { client } from '@/lib/sanityClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EditionTabs } from '@/components/EditionTabs'
import BracketStage from '@/components/esports/BracketStage'
import PrizePoolTable from '@/components/esports/PrizePoolTable'
import type { TournamentEdition } from '@/lib/tournamentApi'

// ISR-MODE: static — on-demand only via the Sanity webhook (/api/revalidate)
// or a manual redeploy. Zero time-based ISR writes. Switch back with:
//   node scripts/setIsrMode.mjs normal
export const revalidate = false

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchParticipant {
  _key: string
  teamName?: string
  team?: { _id: string; name: string; slug: string; logoUrl?: string }
  placement: number
  kills: number
  placementPoints: number
  points: number
}

interface Match {
  _id: string
  matchNumber: number
  matchFormat: 'battle_royale' | 'head_to_head'
  stage: string
  group?: string
  map?: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  scheduledAt: string
  participants?: MatchParticipant[]
  team1?: { _id: string; name: string; slug: string }
  team2?: { _id: string; name: string; slug: string }
  team1Score?: number
  team2Score?: number
  winner?: { _ref: string }
}

// ─── GROQ query ───────────────────────────────────────────────────────────────

const MATCHES_QUERY = `*[_type == "match" && edition._ref == $editionId] | order(matchNumber asc) {
  _id, matchNumber, matchFormat, stage, group, map, status, scheduledAt,
  participants[] {
    _key,
    teamName,
    team->{ _id, name, "slug": slug.current, "logoUrl": logo.asset->url },
    placement, kills, placementPoints, points
  },
  team1->{ _id, name, "slug": slug.current },
  team2->{ _id, name, "slug": slug.current },
  team1Score, team2Score,
  winner { _ref }
}`

const STAGE_ORDER = [
  'group_stage',
  'survival_stage',
  'league_stage',
  'quarterfinals',
  'semifinals',
  'grand_finals',
]

const STAGE_LABELS: Record<string, string> = {
  group_stage:    'Group Stage',
  survival_stage: 'Survival Stage',
  league_stage:   'League Stage',
  quarterfinals:  'Quarterfinals',
  semifinals:     'Semifinals',
  grand_finals:   'Grand Finals',
}

// ─── Static params (reuse tournament slugs) ───────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllTournamentSlugs()
  return slugs.map((t) => ({ slug: t.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const t = await getTournamentBySlug(slug)
  if (!t) return { title: 'Bracket | PHONEOCEAN' }
  return {
    title: `${t.name} Bracket & Results | PHONEOCEAN`,
    description: `Match results and bracket for ${t.name}.`,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BracketPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tournament = await getTournamentBySlug(slug)
  if (!tournament) notFound()

  const editions = await getTournamentEditions(tournament._id).catch(() => [])
  const latest: TournamentEdition | null = editions[0] ?? null

  const matches: Match[] = latest
    ? await client.fetch(MATCHES_QUERY, { editionId: latest._id }).catch(() => [])
    : []

  const hasPrizePlacements = (latest?.prizePlacements?.length ?? 0) > 0

  // Group by stage, preserve STAGE_ORDER
  const grouped = STAGE_ORDER.reduce<Record<string, Match[]>>((acc, s) => {
    const ms = matches.filter((m) => m.stage === s)
    if (ms.length) acc[s] = ms
    return acc
  }, {})

  // Catch any stage not in STAGE_ORDER
  for (const m of matches) {
    if (m.stage && !grouped[m.stage]) {
      grouped[m.stage] = grouped[m.stage] ?? []
      grouped[m.stage].push(m)
    }
  }

  const hasMatches = Object.keys(grouped).length > 0

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Tournament header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {tournament.name}
          </h1>
          {latest && (
            <p className="mt-1 text-sm text-gray-400">
              {latest.year} · Bracket &amp; Results
            </p>
          )}
        </div>

        {/* Tab nav */}
        <EditionTabs slug={slug} active="bracket" />

        {/* Content */}
        <div className="mt-8 space-y-12">
          {hasMatches ? (
            Object.entries(grouped).map(([stage, stageMatches]) => {
              if (stage === 'group_stage') {
                const groupA = stageMatches.filter((m) => m.group === 'Group A')
                const groupB = stageMatches.filter((m) => m.group === 'Group B')
                const ungrouped = stageMatches.filter((m) => !m.group)
                return (
                  <div key={stage} className="space-y-10">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400">
                      {STAGE_LABELS[stage]}
                    </h2>
                    {groupA.length > 0 && (
                      <BracketStage
                        label={slug === 'pmwc-2026' ? 'Group A · Aug 6–7' : 'Group A'}
                        matches={groupA}
                      />
                    )}
                    {groupB.length > 0 && (
                      <BracketStage
                        label={slug === 'pmwc-2026' ? 'Group B · Aug 8–9' : 'Group B'}
                        matches={groupB}
                      />
                    )}
                    {ungrouped.length > 0 && (
                      <BracketStage label="Group Stage" matches={ungrouped} />
                    )}
                  </div>
                )
              }

              return (
                <BracketStage
                  key={stage}
                  label={STAGE_LABELS[stage] ?? stage}
                  matches={stageMatches}
                />
              )
            })
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-gray-300">No matches yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Results will appear here once the tournament is underway.
              </p>
            </div>
          )}

          {hasPrizePlacements && latest && (
            <section>
              <PrizePoolTable
                placements={latest.prizePlacements}
                totalUSD={latest.totalPrizePool}
                rate={84}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
