import { getActiveEdition, getMatchesByEdition } from '@/lib/tournamentApi'
import type { Match } from '@/lib/tournamentApi'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage',
  survival_stage: 'Survival Stage',
  semifinals: 'Semi Finals',
  grand_finals: 'Grand Finals',
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-zinc-700 text-zinc-300',
  live: 'bg-red-600 text-white animate-pulse',
  completed: 'bg-green-800 text-green-200',
  cancelled: 'bg-zinc-800 text-zinc-500 line-through',
}

export default async function SchedulePage() {
  const edition = await getActiveEdition()
  if (!edition) return <p className="text-center py-20 text-zinc-400">No active tournament.</p>

  const matches = await getMatchesByEdition(edition._id)

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.stage ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const stageOrder = ['group_stage', 'survival_stage', 'semifinals', 'grand_finals', 'other']

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
      <p className="text-zinc-400 mb-10">{edition.name}</p>

      {stageOrder.filter(s => grouped[s]).map(stage => (
        <section key={stage} className="mb-12">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4 border-b border-zinc-700 pb-2">
            {STAGE_LABELS[stage] ?? stage}
          </h2>
          <div className="space-y-3">
            {grouped[stage].map(match => (
              <div key={match._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">

                {/* Team 1 */}
                <div className="flex items-center gap-3 w-1/3">
                  {match.team1?.logoUrl && (
                    <img src={match.team1.logoUrl} alt={match.team1.name} className="w-8 h-8 object-contain" />
                  )}
                  <span className="font-semibold text-white truncate">{match.team1?.name ?? 'TBD'}</span>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center min-w-[80px]">
                  {match.status === 'completed' ? (
                    <span className="text-2xl font-bold text-white">
                      {match.team1Score} — {match.team2Score}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm font-medium">VS</span>
                  )}
                  <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[match.status]}`}>
                    {match.status === 'live' ? '🔴 LIVE' : match.status.toUpperCase()}
                  </span>
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-3 w-1/3 justify-end">
                  <span className="font-semibold text-white truncate text-right">{match.team2?.name ?? 'TBD'}</span>
                  {match.team2?.logoUrl && (
                    <img src={match.team2.logoUrl} alt={match.team2.name} className="w-8 h-8 object-contain" />
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
