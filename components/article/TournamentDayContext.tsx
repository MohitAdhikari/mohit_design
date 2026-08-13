import Link from 'next/link'
import { Trophy, Gamepad2 } from 'lucide-react'
import type { Match, StandingTable } from '@/lib/tournamentApi'
import TeamLogo from '@/components/TeamLogo'
import StandingsTables from '@/components/StandingsTables'

const MAP_LABELS: Record<string, string> = {
  erangel: 'Erangel',
  miramar: 'Miramar',
  sanhok: 'Sanhok',
  vikendi: 'Vikendi',
  rondo: 'Rondo',
  nusa: 'Nusa',
}

function MatchCard({ match }: { match: Match }) {
  const top3 = (match.participants || []).slice(0, 3)
  return (
    <div className="bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
          {match.matchNumber ? `Match ${match.matchNumber}` : 'Match'}
          {match.map ? ` · ${MAP_LABELS[match.map] ?? match.map}` : ''}
        </span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          match.status === 'live'
            ? 'bg-red-500 text-white animate-pulse'
            : match.status === 'completed'
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              : 'bg-blue-600 text-white'
        }`}>
          {match.status}
        </span>
      </div>

      {top3.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {top3.map((p, i) => (
            <div key={p.team?.name || i} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-xs font-bold text-gray-400 dark:text-gray-600 shrink-0">{p.placement ?? i + 1}</span>
              <TeamLogo src={p.team?.logoUrl ?? null} name={p.team?.name ?? 'TBD'} size={20} className="w-5 h-5 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">{p.team?.name ?? 'TBD'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 shrink-0">{p.points ?? 0} pts</span>
            </div>
          ))}
        </div>
      ) : match.team1 && match.team2 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{match.team1.name}</span>
          <span className="font-bold tabular-nums text-gray-900 dark:text-white px-2">
            {match.team1Score ?? 0} – {match.team2Score ?? 0}
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-right">{match.team2.name}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-600">Results pending</p>
      )}
    </div>
  )
}

export default function TournamentDayContext({
  editionTitle,
  tournamentSlug,
  matches,
  standings,
}: {
  editionTitle: string | null
  tournamentSlug?: string
  matches: Match[]
  standings: StandingTable | null
}) {
  const matchesHref = tournamentSlug ? `/esports/${tournamentSlug}/matches` : null
  const standingsHref = tournamentSlug ? `/esports/${tournamentSlug}/standings` : null

  return (
    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-900">
      {matches.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
              <Gamepad2 className="w-4 h-4" />
              {editionTitle ? `${editionTitle} — Matches Today` : 'Matches Today'}
            </h2>
            {matchesHref && (
              <Link href={matchesHref} className="text-xs font-semibold text-blue-600 dark:text-[#00E5FF] hover:underline shrink-0">
                Full schedule →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matches.map((m) => (
              <MatchCard key={m._id} match={m} />
            ))}
          </div>
        </>
      ) : standings ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
              <Trophy className="w-4 h-4" />
              Latest Standings
            </h2>
            {standingsHref && (
              <Link href={standingsHref} className="text-xs font-semibold text-blue-600 dark:text-[#00E5FF] hover:underline shrink-0">
                Full standings →
              </Link>
            )}
          </div>
          <StandingsTables standings={[standings]} />
        </>
      ) : null}
    </div>
  )
}
