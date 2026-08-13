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

const SECTION_COLORS: Record<string, string> = {
  group_stage: 'text-blue-500',
  survival_stage: 'text-orange-500',
  grand_finals: 'text-yellow-500',
}

type Props = { params: Promise<{ slug: string }> }

function formatDateRange(matches: Match[]) {
  const dates = matches
    .map((m) => new Date(m.scheduledAt))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }))
  const unique = [...new Set(dates)]
  if (unique.length === 0) return ''
  if (unique.length === 1) return ` · ${unique[0]}`
  const first = unique[0]
  const last = unique[unique.length - 1]
  const firstMonth = first.split(' ')[0]
  const lastMonth = last.split(' ')[0]
  if (firstMonth && firstMonth === lastMonth) {
    return ` · ${firstMonth} ${first.split(' ')[1]}–${last.split(' ')[1]}`
  }
  return ` · ${first} – ${last}`
}

function sectionTitle(slug: string, stage: string, group: string | undefined, matches: Match[]) {
  // PMWC 2026 hardcoded date ranges (computed ranges match these for Group/Survival stages,
  // but Grand Finals is known to run Aug 14-16 even though only Day 1 data may exist).
  if (slug === 'pmwc-2026') {
    if (stage === 'group_stage' && group === 'Group A') return 'Group A · Aug 6–7'
    if (stage === 'group_stage' && group === 'Group B') return 'Group B · Aug 8–9'
    if (stage === 'survival_stage') return 'Survival Stage · Aug 11–12'
    if (stage === 'grand_finals') return 'Grand Finals · Aug 14–16'
  }
  if (stage === 'group_stage' && group) {
    return `${group}${formatDateRange(matches)}`
  }
  return `${STAGE_LABELS[stage] ?? stage}${formatDateRange(matches)}`
}

function sectionColor(stage: string) {
  return SECTION_COLORS[stage] ?? 'text-blue-600 dark:text-[#00E5FF]'
}

function MatchCard({ match }: { match: Match }) {
  if (match.matchFormat === 'battle_royale') {
    return (
      <div key={match._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            MATCH {match.matchNumber}
            {match.map ? ` · ${match.map.toUpperCase()}` : ''}
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
    )
  }

  return (
    <div key={match._id} className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-1/3">
        <TeamLogo src={match.team1?.logoUrl ?? null} name={match.team1?.name ?? 'TBD'} size={32} className="w-8 h-8" />
        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{match.team1?.name ?? 'TBD'}</span>
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[90px]">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">
          MATCH {match.matchNumber}
        </span>
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
}

export default async function MatchesPage({ params }: Props) {
  const { slug } = await params
  const edition = await getActiveEditionByTournamentSlug(slug)
  if (!edition) notFound()

  const matches = await getMatches(edition._id)

  const groupAMatches = matches.filter((m) => m.stage === 'group_stage' && m.group === 'Group A')
  const groupBMatches = matches.filter((m) => m.stage === 'group_stage' && m.group === 'Group B')
  const survivalMatches = matches.filter((m) => m.stage === 'survival_stage')
  const gfMatches = matches.filter((m) => m.stage === 'grand_finals')

  // Any non-group stages or unknown group values fall back to stage-based grouping
  const known = new Set([...groupAMatches, ...groupBMatches, ...survivalMatches, ...gfMatches])
  const otherMatches = matches.filter((m) => !known.has(m))
  const otherGrouped = otherMatches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.stage ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const stageOrder = ['group_stage', 'survival_stage', 'league_stage', 'quarterfinals', 'semifinals', 'grand_finals', 'other']
  for (const key of Object.keys(otherGrouped)) {
    if (!stageOrder.includes(key)) stageOrder.push(key)
  }

  const sections: { stage: string; group?: string; matches: Match[] }[] = []
  if (groupAMatches.length > 0) sections.push({ stage: 'group_stage', group: 'Group A', matches: groupAMatches })
  if (groupBMatches.length > 0) sections.push({ stage: 'group_stage', group: 'Group B', matches: groupBMatches })
  if (survivalMatches.length > 0) sections.push({ stage: 'survival_stage', matches: survivalMatches })
  for (const stage of stageOrder) {
    if (stage === 'group_stage' || stage === 'survival_stage' || stage === 'grand_finals') continue
    if (otherGrouped[stage]?.length > 0) {
      sections.push({ stage, matches: otherGrouped[stage] })
    }
  }
  if (gfMatches.length > 0) sections.push({ stage: 'grand_finals', matches: gfMatches })

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

      {sections.map(({ stage, group, matches: sectionMatches }) => (
        <section key={`${stage}-${group ?? 'default'}`} className="mb-10">
          <h2 className={`text-xs font-mono uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-800/60 pb-3 ${sectionColor(stage)}`}>
            {sectionTitle(slug, stage, group, sectionMatches)}
          </h2>

          <div className="flex flex-col gap-3">
            {sectionMatches.map((match) => <MatchCard key={match._id} match={match} />)}
          </div>
        </section>
      ))}
    </main>
  )
}
