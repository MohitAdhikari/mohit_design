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
  completed: 'bg-zinc-700 text-zinc-300',
  scheduled: 'bg-blue-600 text-white',
  cancelled: 'bg-zinc-800 text-zinc-500',
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
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 max-w-4xl mx-auto">
      <EditionTabs slug={slug} active="matches" />

      <h1 className="text-3xl font-bold mb-2">{edition.title}</h1>
      <p className="text-zinc-400 mb-8">Matches</p>

      {matches.length === 0 && (
        <p className="text-zinc-500">No matches scheduled yet.</p>
      )}

      {stageOrder
        .filter((s) => grouped[s])
        .map((stage) => (
          <section key={stage} className="mb-10">
            <h2 className="text-lg font-semibold text-zinc-300 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
              {STAGE_LABELS[stage] ?? stage}
            </h2>

            <div className="flex flex-col gap-3">
              {(grouped[stage] ?? []).map((match: Match) => (
                <div
                  key={match._id}
                  className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  {/* Team 1 */}
                  <span className="w-28 text-right font-semibold truncate">
                    {match.team1?.name ?? 'TBD'}
                  </span>

                  {/* Score / Status */}
                  <div className="flex flex-col items-center gap-1 min-w-[90px]">
                    {match.status === 'completed' || match.status === 'live' ? (
                      <span className="text-2xl font-bold tabular-nums">
                        {match.team1Score ?? 0} – {match.team2Score ?? 0}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">
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
                  <span className="w-28 font-semibold truncate">
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
