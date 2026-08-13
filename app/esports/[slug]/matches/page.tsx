import { notFound } from 'next/navigation'
import { getActiveEditionByTournamentSlug, getMatches } from '@/lib/tournamentApi'
import type { Match } from '@/lib/tournamentApi'
import { EditionTabs } from '@/components/EditionTabs'
import TeamLogo from '@/components/TeamLogo'
import { Gamepad2 } from 'lucide-react'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage',
  survival_stage: 'Survival Stage',
  league_stage: 'League Stage',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  grand_finals: 'Grand Finals',
}

const STATUS_STYLES: Record<string, string> = {
  live:      'bg-red-500 text-white animate-pulse',
  completed: 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  scheduled: 'bg-blue-600 text-white',
  cancelled: 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600',
}

type Props = { params: Promise<{ slug: string }> }

export default async function MatchesPage({ params }: Props) {
  const { slug } = await params
  const edition = await getActiveEditionByTournamentSlug(slug)
  if (!edition) notFound()

  const matches = await getMatches(edition._id)

  // group by stage
  const grouped = matches.reduce<Record<string, Match[]>>((acc: Record<string, Match[]>, m: Match) => {
    const key = m.stage ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const stageOrder = ['group_stage', 'survival_stage', 'league_stage', 'quarterfinals', 'semifinals', 'grand_finals', 'other']

  // Any stage value present in the data but not in our known order (e.g. a
  // typo or a brand-new stage name) still gets rendered, appended at the end,
  // instead of being silently dropped.
  for (const key of Object.keys(grouped)) {
    if (!stageOrder.includes(key)) stageOrder.push(key)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0B0B0F] px-4 sm:px-6 lg:px-8 py-10 md:py-14 max-w-[1300px] mx-auto">
      <EditionTabs slug={slug} active="matches" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black font-space-grotesk text-gray-900 dark:text-white">
          {edition.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-500 text-sm font-mono uppercase tracking-widest mt-1">Matches</p>
      </div>

      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
          <Gamepad2 className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            No matches scheduled yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">
            Match schedule will appear here once fixtures are confirmed.
          </p>
        </div>
      )}

      {stageOrder
        .filter((s) => grouped[s])
        .map((stage) => (
          <section key={stage} className="mb-10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-[#00E5FF] mb-4 border-b border-gray-200 dark:border-gray-800/60 pb-3">
              {STAGE_LABELS[stage] ?? stage}
            </h2>

            <div className="flex flex-col gap-3">
              {(grouped[stage] ?? []).map((match: Match) =>
                match.matchFormat === 'battle_royale' ? (
                  <div key={match._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
                        {match.participants?.length ?? 0} teams · Battle Royale
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[match.status] ?? ''}`}>
                        {match.status}
                      </span>
                    </div>
                    {match.participants && match.participants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-gray-500 dark:text-gray-500 uppercase text-[10px] font-mono tracking-widest">
                            <tr>
                              <th className="px-2 py-1 w-10 text-left">#</th>
                              <th className="px-2 py-1 text-left">Team</th>
                              <th className="px-2 py-1 text-center">Kills</th>
                              <th className="px-2 py-1 text-center">Points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                            {match.participants.map((p, i) => (
                              <tr key={p.team?._id || i}>
                                <td className="px-2 py-1.5 text-gray-400 dark:text-gray-600 font-mono">{p.placement ?? '—'}</td>
                                <td className="px-2 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <TeamLogo src={p.team?.logoUrl ?? null} name={p.team?.name ?? 'TBD'} size={20} className="w-5 h-5" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{p.team?.name ?? 'TBD'}</span>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">{p.kills ?? 0}</td>
                                <td className="px-2 py-1.5 text-center font-bold text-yellow-600 dark:text-yellow-400">{p.points ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-600 text-xs font-mono uppercase tracking-widest">Lineup TBD</p>
                    )}
                  </div>
                ) : (
                  <div key={match._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-1/3">
                      <TeamLogo src={match.team1?.logoUrl ?? null} name={match.team1?.name ?? 'TBD'} size={32} className="w-8 h-8" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{match.team1?.name ?? 'TBD'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[90px]">
                      {match.status === 'completed' || match.status === 'live' ? (
                        <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                          {match.team1Score ?? 0} – {match.team2Score ?? 0}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(match.scheduledAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[match.status] ?? ''}`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 w-1/3 justify-end">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-right">{match.team2?.name ?? 'TBD'}</span>
                      <TeamLogo src={match.team2?.logoUrl ?? null} name={match.team2?.name ?? 'TBD'} size={32} className="w-8 h-8" />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ))}
    </main>
  )
}
