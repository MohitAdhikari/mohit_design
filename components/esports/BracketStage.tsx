/**
 * components/esports/BracketStage.tsx
 *
 * Renders one tournament stage:
 * - battle_royale matches → standings table (sorted by placement)
 * - head_to_head matches  → score cards in a grid
 */
'use client'

import Image from 'next/image'

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
  map?: string
  status: string
  scheduledAt: string
  participants?: MatchParticipant[]
  team1?: { _id: string; name: string; slug: string }
  team2?: { _id: string; name: string; slug: string }
  team1Score?: number
  team2Score?: number
  winner?: { _ref: string }
}

const MAP_LABELS: Record<string, string> = {
  erangel: 'Erangel', miramar: 'Miramar', sanhok: 'Sanhok',
  vikendi: 'Vikendi', rondo: 'Rondo', nusa: 'Nusa',
}

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400',
  live:      'bg-red-500/20 text-red-400 animate-pulse',
  scheduled: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-yellow-500/20 text-yellow-400',
}

export default function BracketStage({ label, matches }: { label: string; matches: Match[] }) {
  const brMatches = matches.filter((m) => m.matchFormat === 'battle_royale')
  const h2hMatches = matches.filter((m) => m.matchFormat === 'head_to_head')

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white">{label}</h2>

      {/* ── Battle Royale ─────────────────────────────────────────── */}
      {brMatches.length > 0 && (
        <div className="space-y-6">
          {brMatches.map((match) => {
            const sorted = [...(match.participants ?? [])].sort(
              (a, b) => a.placement - b.placement,
            )
            return (
              <div
                key={match._id}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                {/* Match header */}
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        Match {match.matchNumber}
                      </span>
                      {match.map && (
                        <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                          {MAP_LABELS[match.map] ?? match.map}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-mono uppercase tracking-widest text-gray-500">
                      {match.matchFormat === 'battle_royale'
                        ? `${match.participants?.length ?? 16} Teams · Battle Royale`
                        : 'Head to Head'}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_BADGE[match.status] ?? STATUS_BADGE.scheduled
                    }`}
                  >
                    {match.status}
                  </span>
                </div>

                {/* Standings table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-gray-500">
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Team</th>
                        <th className="px-4 py-2 text-center">Kills</th>
                        <th className="px-4 py-2 text-center">Placement Pts</th>
                        <th className="px-4 py-2 text-center font-semibold text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((p) => {
                        const name = p.team?.name ?? p.teamName ?? '—'
                        const logo = p.team?.logoUrl
                        const isWinner = p.placement === 1
                        return (
                          <tr
                            key={p._key}
                            className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                              isWinner ? 'bg-yellow-500/5' : ''
                            }`}
                          >
                            <td className="px-4 py-2.5 text-gray-400">{p.placement}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {logo && (
                                  <Image
                                    src={logo}
                                    alt={name}
                                    width={20}
                                    height={20}
                                    className="rounded-full object-contain"
                                  />
                                )}
                                <span className={`font-medium ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                                  {name}
                                </span>
                                {isWinner && (
                                  <span className="text-xs text-yellow-500">WWCD</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center text-gray-300">{p.kills}</td>
                            <td className="px-4 py-2.5 text-center text-gray-300">{p.placementPoints}</td>
                            <td className="px-4 py-2.5 text-center font-bold text-white">{p.points}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Head-to-Head ──────────────────────────────────────────── */}
      {h2hMatches.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {h2hMatches.map((match) => {
            const t1wins = match.winner?._ref && match.team1 && match.winner._ref === match.team1._id
            return (
              <div
                key={match._id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Match {match.matchNumber}</span>
                  <span className={`rounded px-1.5 py-0.5 capitalize ${STATUS_BADGE[match.status] ?? ''}`}>
                    {match.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex-1 truncate text-sm font-semibold ${t1wins ? 'text-green-400' : 'text-white'}`}>
                    {match.team1?.name ?? '—'}
                  </span>
                  <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 text-sm font-bold text-white">
                    {match.team1Score ?? '—'} : {match.team2Score ?? '—'}
                  </span>
                  <span className={`flex-1 truncate text-right text-sm font-semibold ${!t1wins && match.winner ? 'text-green-400' : 'text-white'}`}>
                    {match.team2?.name ?? '—'}
                  </span>
                </div>
                {match.map && (
                  <p className="mt-2 text-center text-xs text-gray-600">
                    {MAP_LABELS[match.map] ?? match.map}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
