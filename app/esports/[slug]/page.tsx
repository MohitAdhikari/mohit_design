import { getTournamentBySlug, getTournamentEditions, getAllTournamentSlugs, getTournamentStatus, type TournamentEdition } from '@/lib/tournamentApi'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

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
  const tournament = await getTournamentBySlug(slug)
  if (!tournament) return { title: 'Tournament | PHONEOCEAN' }
  return {
    title: `${tournament.name} | PHONEOCEAN`,
    description:
      tournament.description ||
      `${tournament.name} — esports tournament coverage, results, and prize pool information.`,
    openGraph: {
      images: tournament.bannerUrl ? [{ url: tournament.bannerUrl }] : [],
    },
  }
}

function formatDate(d: string | null) {
  if (!d) return 'TBA'
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function StatusPill({ status }: { status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' }) {
  const styles = {
    UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ONGOING:  'bg-green-500/10 text-green-400 border-green-500/30',
    COMPLETED:'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }
  const dot = {
    UPCOMING: 'bg-blue-400',
    ONGOING:  'bg-green-400 animate-pulse',
    COMPLETED:'bg-gray-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tournament = await getTournamentBySlug(slug)
  if (!tournament) notFound()

  let editions: TournamentEdition[] = []
  try {
    editions = await getTournamentEditions(tournament._id)
  } catch {
    editions = []
  }
  const latestEdition = editions[0] ?? null
  const status = getTournamentStatus(
    latestEdition?.startDate ?? null,
    latestEdition?.endDate ?? null,
    latestEdition?.tournamentStatus ?? null
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0F]">

      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        {tournament.bannerUrl ? (
          <Image
            src={tournament.bannerUrl}
            alt={tournament.name}
            fill
            priority
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-[#0E0E1A] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/esports"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-[#00E5FF] transition-colors"
          >
            ← Esports
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 z-10 flex items-end gap-5">
          {tournament.logoUrl && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm">
              <Image
                src={tournament.logoUrl}
                alt={tournament.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill status={status} />
              {tournament.organizer && (
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  by {tournament.organizer}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight font-space-grotesk">
              {tournament.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Game',       value: tournament.game },
            { label: 'Region',     value: tournament.region },
            { label: 'Prize Pool', value: latestEdition?.prizePool },
            { label: 'Venue',      value: latestEdition?.venue },
            { label: 'Start Date', value: formatDate(latestEdition?.startDate ?? null) },
            { label: 'End Date',   value: formatDate(latestEdition?.endDate ?? null) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-50 dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex flex-col gap-1"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF]">
                {label}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {value || 'TBA'}
              </span>
            </div>
          ))}
        </div>

        {tournament.description && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#00E5FF]">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
              {tournament.description}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white font-space-grotesk">
              Editions
            </h2>
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              {editions.length} recorded
            </span>
          </div>

          {editions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
              <span className="text-4xl">📋</span>
              <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-xs">
                No editions recorded yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {editions.map((edition) => (
                <div
                  key={edition._id}
                  className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-2xl overflow-hidden"
                >
                  {edition.editionBannerUrl && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={edition.editionBannerUrl}
                        alt={`${tournament.name} ${edition.year}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white font-space-grotesk">
                        {tournament.name} — {edition.year}
                      </h3>
                      {edition.format && (
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                          {edition.format}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      {edition.prizePool && (
                        <div>
                          <span className="text-[#00E5FF] uppercase tracking-widest">Prize</span>
                          <p className="text-gray-900 dark:text-gray-200 mt-0.5">{edition.prizePool}</p>
                        </div>
                      )}
                      {edition.venue && (
                        <div>
                          <span className="text-[#00E5FF] uppercase tracking-widest">Venue</span>
                          <p className="text-gray-900 dark:text-gray-200 mt-0.5">{edition.venue}</p>
                        </div>
                      )}
                      {edition.startDate && (
                        <div>
                          <span className="text-[#00E5FF] uppercase tracking-widest">Dates</span>
                          <p className="text-gray-900 dark:text-gray-200 mt-0.5">
                            {formatDate(edition.startDate)}
                            {edition.endDate && ` – ${formatDate(edition.endDate)}`}
                          </p>
                        </div>
                      )}
                      {edition.totalTeams && (
                        <div>
                          <span className="text-[#00E5FF] uppercase tracking-widest">Teams</span>
                          <p className="text-gray-900 dark:text-gray-200 mt-0.5">{edition.totalTeams}</p>
                        </div>
                      )}
                    </div>

                    {(edition.winner || edition.runnerUp || edition.mvp) && (
                      <div className="border-t border-gray-100 dark:border-gray-800/60 pt-4 flex flex-wrap gap-4">
                        {edition.winner && (
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-base">🏆</span>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Winner</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{edition.winner.name}</p>
                            </div>
                          </div>
                        )}
                        {edition.runnerUp && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-base">🥈</span>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Runner-up</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{edition.runnerUp.name}</p>
                            </div>
                          </div>
                        )}
                        {edition.mvp && (
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-base">⭐</span>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">MVP</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{edition.mvp.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {edition.broadcastLinks && edition.broadcastLinks.length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-800/60 pt-4 flex flex-wrap gap-2">
                        {edition.broadcastLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#13131A] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors"
                          >
                            ▶ {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
