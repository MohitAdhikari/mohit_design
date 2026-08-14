import {
  getTournamentBySlug,
  getTournamentEditions,
  getAllTournamentSlugs,
  getTournamentStatus,
  getEditionPrizeDisplay,
  type TournamentEdition,
  type EditionParticipant,
  type PrizeStage,
  type PrizePlacement,
} from '@/lib/tournamentApi'
import { formatCurrency } from '@/lib/currency'
import TeamLogo from '@/components/TeamLogo'
import PrizePoolDisplay from '@/components/PrizePoolDisplay'
import EditionTimeline from '@/components/EditionTimeline'
import PrizePoolTable from '@/components/esports/PrizePoolTable'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Users, ChevronDown } from 'lucide-react'
import Tabs from '@/components/Tabs'
import { EditionTabs } from '@/components/EditionTabs'
import type { Metadata } from 'next'

// ISR-MODE: static — on-demand only via the Sanity webhook (/api/revalidate)
// or a manual redeploy. Zero time-based ISR writes. Switch back with:
//   node scripts/setIsrMode.mjs normal
export const revalidate = false

export async function generateStaticParams() {
  const slugs = await getAllTournamentSlugs()
  return slugs.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const t = await getTournamentBySlug(slug)
  if (!t) return { title: 'Esports | PHONEOCEAN' }
  return {
    title: `${t.name} | PHONEOCEAN`,
    description: t.description ?? `${t.name} — esports tournament coverage, results, and prize pool information.`,
    openGraph: { images: t.bannerUrl ? [{ url: t.bannerUrl }] : [] },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return 'TBA'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusPill({ status }: { status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' }) {
  const ring = { UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/30', ONGOING: 'bg-green-500/10 text-green-400 border-green-500/30', COMPLETED: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
  const dot  = { UPCOMING: 'bg-blue-400', ONGOING: 'bg-green-400 animate-pulse', COMPLETED: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${ring[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}

// ── Prize section (all editions with data) ─────────────────────────────

function PrizeSection({ editions }: { editions: TournamentEdition[] }) {
  const withPrize = editions.filter((e) => e.totalPrizePool != null || e.prizePoolDisplay)

  if (!withPrize.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
        <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No prize pool data yet</p>
        <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">Details will appear once the official announcement is made.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {withPrize.map((edition) => {
        const currency   = edition.prizePoolCurrency ?? 'INR'
        const stages     = edition.prizePoolStages ?? []
        const all        = edition.prizePlacements ?? []
        const top        = all.slice(0, 8)
        const rest       = all.slice(8)

        return (
          <div key={edition._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800/60 flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF]">{edition.year}</span>
                {edition.totalPrizePool != null && (
                  <div className="mt-1">
                    <PrizePoolDisplay
                      amount={edition.totalPrizePool}
                      currency={currency}
                      displayOverride={edition.prizePoolDisplay}
                      showConverter
                      className="text-3xl md:text-4xl text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
              {edition.winner && (
                <div className="flex items-center gap-2.5">
                  <TeamLogo src={edition.winner.logoUrl} name={edition.winner.name} size={32} className="w-8 h-8" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Champion</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{edition.winner.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-5 space-y-6">

              {/* Stage breakdown */}
              {stages.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Stage Breakdown</p>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(stages as PrizeStage[]).map((stage, i) => (
                      <div key={stage._key ?? i} className="bg-gray-50 dark:bg-[#13131A] rounded-xl p-3 flex flex-col gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600">{stage.stageName}</span>
                        <span className="text-base font-black font-space-grotesk text-gray-900 dark:text-white">
                          {stage.stagePool != null ? formatCurrency(stage.stagePool, stage.stageCurrency ?? currency) : 'TBA'}
                        </span>
                        {stage.stageNotes && <span className="text-[10px] text-gray-400 dark:text-gray-600">{stage.stageNotes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placements */}
              {top.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Prize Distribution</p>
                  <div className="rounded-xl border border-gray-100 dark:border-gray-800/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800/40">
                          <th className="py-2.5 px-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-500">Place</th>
                          <th className="py-2.5 px-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-500">Team</th>
                          <th className="py-2.5 px-4 text-right text-[10px] font-mono uppercase tracking-widest text-gray-500">Prize</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(top as PrizePlacement[]).map((row, i) => (
                          <tr key={row._key ?? i} className="border-b border-gray-50 dark:border-gray-800/20 last:border-0">
                            <td className="py-3 px-4">
                              <span className={`font-bold font-mono ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-500 dark:text-gray-500'}`}>
                                {row.placement}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {row.team ? (
                                <div className="flex items-center gap-2">
                                  <TeamLogo src={row.team.logoUrl} name={row.team.name} size={22} className="w-5 h-5 flex-shrink-0" />
                                  <span className="text-gray-900 dark:text-gray-100 font-medium">{row.team.name}</span>
                                </div>
                              ) : <span className="text-gray-400 dark:text-gray-600">—</span>}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 dark:text-gray-100">
                              {row.prize != null ? formatCurrency(row.prize, row.currency ?? currency) : '—'}
                              {row.notes && <span className="block text-[10px] text-gray-400 dark:text-gray-600 font-normal">{row.notes}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rest.length > 0 && (
                    <details className="mt-2 group/details">
                      <summary className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600 cursor-pointer select-none hover:text-[#00E5FF] transition-colors w-fit list-none">
                        <ChevronDown className="w-3 h-3 transition-transform group-open/details:rotate-180" />
                        {rest.length} more placements
                      </summary>
                      <div className="mt-2 rounded-xl border border-gray-100 dark:border-gray-800/40 overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody>
                            {(rest as PrizePlacement[]).map((row, i) => (
                              <tr key={row._key ?? `r${i}`} className="border-b border-gray-50 dark:border-gray-800/20 last:border-0">
                                <td className="py-2.5 px-4 font-mono font-bold text-gray-400 dark:text-gray-600 w-20">{row.placement}</td>
                                <td className="py-2.5 px-4">
                                  {row.team ? (
                                    <div className="flex items-center gap-2">
                                      <TeamLogo src={row.team.logoUrl} name={row.team.name} size={20} className="w-5 h-5" />
                                      <span className="text-gray-700 dark:text-gray-300 font-medium">{row.team.name}</span>
                                    </div>
                                  ) : <span className="text-gray-400 dark:text-gray-600">—</span>}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono text-gray-700 dark:text-gray-300">
                                  {row.prize != null ? formatCurrency(row.prize, row.currency ?? currency) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Teams section ──────────────────────────────────────────────────────

function TeamsSection({ edition }: { edition: TournamentEdition | null }) {
  if (!edition) return null

  const participants = (edition.participants ?? []).filter(
    (p): p is EditionParticipant & { team: NonNullable<EditionParticipant['team']> } => p.team != null,
  )
  const fallback = (edition.teams ?? []).map((t) => ({ _key: t._id, team: t, group: null, seed: null, status: null, inviteSource: null }))
  const items    = participants.length > 0 ? participants : fallback

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
        <Users className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No teams listed yet</p>
        <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">Participating teams will appear here once the edition roster is confirmed.</p>
      </div>
    )
  }

  // Group by group field
  type Item = (typeof items)[number]
  const grouped = new Map<string, Item[]>()
  for (const item of items) {
    const g = ('group' in item ? item.group : null) ?? '__all__'
    if (!grouped.has(g)) grouped.set(g, [])
    grouped.get(g)!.push(item)
  }
  const hasGroups = grouped.size > 1 || !grouped.has('__all__')

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([groupKey, rows]) => (
        <div key={groupKey}>
          {hasGroups && groupKey !== '__all__' && (
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] mb-4 pb-2 border-b border-gray-200 dark:border-gray-800/60">
              Group {groupKey}
            </h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rows.map((item) => {
              const team        = item.team
              const seed        = 'seed'        in item ? item.seed        : null
              const inviteSrc   = 'inviteSource' in item ? item.inviteSource : null
              const pStatus     = 'status'      in item ? item.status      : null

              return (
                <div key={team._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex flex-col items-center gap-2">
                  <TeamLogo src={team.logoUrl} name={team.name} size={56} className="w-14 h-14" />
                  <span className="text-xs font-bold text-center text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                    {team.name}
                  </span>
                  {team.country && (
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">{team.country}</span>
                  )}
                  <div className="flex flex-wrap justify-center gap-1">
                    {seed != null && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#13131A] text-gray-500">
                        #{seed}
                      </span>
                    )}
                    {inviteSrc === 'qualifier' && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">Q</span>
                    )}
                    {inviteSrc === 'wildcard' && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400">WC</span>
                    )}
                    {inviteSrc === 'pmwc-bye' && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">BYE</span>
                    )}
                    {pStatus === 'eliminated' && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">OUT</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tournament = await getTournamentBySlug(slug)
  if (!tournament) notFound()

  const editions: TournamentEdition[] = await getTournamentEditions(tournament._id).catch(() => [])
  const latest  = editions[0] ?? null
  const status  = getTournamentStatus(latest?.startDate ?? null, latest?.endDate ?? null, latest?.tournamentStatus ?? null)
  const latestPrize = latest ? getEditionPrizeDisplay(latest) : null

  const participantCount = (() => {
    const p = (latest?.participants ?? []).filter((p) => p.team != null)
    return p.length > 0 ? p.length : (latest?.teams ?? []).length
  })()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0F]">

      {/* Hero */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        {tournament.bannerUrl
          ? <Image src={tournament.bannerUrl} alt={tournament.name} fill priority sizes="100vw" className="object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-gray-900 via-[#0E0E1A] to-black" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link href="/esports" className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-[#00E5FF] transition-colors">
            ← Esports
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 z-10 flex items-end gap-5">
          {tournament.logoUrl && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm">
              <Image src={tournament.logoUrl} alt={tournament.name} fill sizes="96px" className="object-contain p-2" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill status={status} />
              {tournament.organizer && (
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">by {tournament.organizer}</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight font-space-grotesk">
              {tournament.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
        <EditionTabs slug={slug} active="overview" />

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Game',       value: tournament.game },
            { label: 'Region',     value: tournament.region },
            { label: 'Prize Pool', value: latestPrize },
            { label: 'Venue',      value: latest?.venue },
            { label: 'Start Date', value: fmtDate(latest?.startDate ?? null) },
            { label: 'End Date',   value: fmtDate(latest?.endDate ?? null) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF]">{label}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{value || 'TBA'}</span>
            </div>
          ))}
        </div>

        {tournament.description && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#00E5FF]">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">{tournament.description}</p>
          </div>
        )}

        <Tabs tabs={['Editions', 'Prize Pool', 'Teams']}>

          {/* EDITIONS */}
          <div key="editions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white font-space-grotesk">Editions</h2>
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500">{editions.length} recorded</span>
            </div>
            {editions.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
                  <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No editions recorded yet</p>
                </div>
              )
              : <EditionTimeline editions={editions} tournamentSlug={slug} currentEditionId={latest?._id} />
            }
          </div>

          {/* PRIZE POOL */}
          <div key="prize-pool" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white font-space-grotesk">Prize Pool</h2>
              {latestPrize && <span className="text-sm font-mono uppercase tracking-widest text-[#00E5FF]">{latestPrize}</span>}
            </div>
            <PrizeSection editions={editions} />
            {latest?.prizePlacements && latest.prizePlacements.length > 0 && (
              <PrizePoolTable
                placements={latest.prizePlacements}
                rate={84}
                totalUSD={latest.totalPrizePool}
              />
            )}
          </div>

          {/* TEAMS */}
          <div key="teams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white font-space-grotesk">Teams</h2>
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500">{participantCount} teams</span>
            </div>
            <TeamsSection edition={latest} />
          </div>

        </Tabs>
      </div>
    </div>
  )
}
