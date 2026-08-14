import { getActiveEdition, getMatches } from '@/lib/tournamentApi'
import type { Match } from '@/lib/tournamentApi'
import TeamLogo from '@/components/TeamLogo'
import { CalendarDays } from 'lucide-react'

// ZERO-ISR MODE: live tournament data, rendered per request. Never written
// to the ISR cache, so it consumes no Vercel ISR Write Units and reflects
// Sanity updates immediately.
export const dynamic = 'force-dynamic'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage',
  survival_stage: 'Survival Stage',
  semifinals: 'Semi Finals',
  grand_finals: 'Grand Finals',
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-600 text-white',
  live: 'bg-red-600 text-white animate-pulse',
  completed: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200',
  cancelled: 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 line-through',
}

export default async function SchedulePage() {
  const edition = await getActiveEdition()
  if (!edition) {
    return (
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-sm">
          No active tournament.
        </p>
      </main>
    )
  }

  const matches = await getMatches(edition._id)

  const grouped = matches.reduce<Record<string, Match[]>>((acc: Record<string, Match[]>, m: Match) => {
    const key = m.stage ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const stageOrder = ['group_stage', 'survival_stage', 'semifinals', 'grand_finals', 'other']

  return (
    <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white">
          Schedule
        </h1>
        <p className="text-gray-500 dark:text-gray-500 text-sm font-mono uppercase tracking-widest mt-1">{edition.name}</p>
      </div>

      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
          <CalendarDays className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            No matches scheduled yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">
            The match schedule will appear here once fixtures are confirmed.
          </p>
        </div>
      )}

      {stageOrder.filter(s => grouped[s]).map(stage => (
        <section key={stage} className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-[#00E5FF] mb-4 border-b border-gray-200 dark:border-gray-800/60 pb-3">
            {STAGE_LABELS[stage] ?? stage}
          </h2>
          <div className="space-y-3">
            {grouped[stage].map((match: Match) =>
              match.matchFormat === 'battle_royale' ? (
                <div key={match._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
                      {match.participants?.length ?? 0} teams · Battle Royale
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[match.status]}`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                  {match.participants && match.participants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 dark:text-gray-500 uppercase text-[10px] font-mono tracking-widest">
                          <tr>
                            <th className="px-2 py-1 w-10">#</th>
                            <th className="px-2 py-1">Team</th>
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

                  {/* Team 1 */}
                  <div className="flex items-center gap-3 w-1/3">
                    <TeamLogo src={match.team1?.logoUrl ?? null} name={match.team1?.name ?? 'TBD'} size={32} className="w-8 h-8" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{match.team1?.name ?? 'TBD'}</span>
                  </div>

                  {/* Score / VS */}
                  <div className="flex flex-col items-center min-w-[80px]">
                    {match.status === 'completed' ? (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {match.team1Score ?? 0} — {match.team2Score ?? 0}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">VS</span>
                    )}
                    <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[match.status]}`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Team 2 */}
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
