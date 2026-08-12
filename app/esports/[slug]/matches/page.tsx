import { notFound } from 'next/navigation'
import { getActiveEditionByTournamentSlug, getMatches } from '@/lib/tournamentApi'
import type { Match } from '@/lib/tournamentApi'
import { EditionTabs } from '@/components/EditionTabs'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage',
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

  const stageOrder = ['group_stage', 'quarterfinals', 'semifinals', 'grand_finals', 'other']

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
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
          <span className="text-4xl">🎮</span>
          <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-xs">
            No matches scheduled yet
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
              {(grouped[stage] ?? []).map((match: Match) => (
                <div
                  key={match._id}
                  className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  {/* Team 1 */}
                  <span className="w-28 sm:w-36 text-right font-semibold truncate text-gray-900 dark:text-gray-100">
                    {match.team1?.name ?? 'TBD'}
                  </span>

                  {/* Score / Status */}
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
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[match.status] ?? ''}`}
                    >
                      {match.status}
                    </span>
                  </div>

                  {/* Team 2 */}
                  <span className="w-28 sm:w-36 font-semibold truncate text-gray-900 dark:text-gray-100">
                    {match.team2?.name ?? 'TBD'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
    </main>
  )
}
