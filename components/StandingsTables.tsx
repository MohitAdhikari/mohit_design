import { BarChart2 } from 'lucide-react'
import type { StandingTable, StandingRow } from '@/lib/tournamentApi'
import TeamLogo from './TeamLogo'

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage',
  survival_stage: 'Survival Stage',
  grand_finals: 'Grand Finals',
  league_stage: 'League Stage',
  finals: 'Finals',
  overall: 'Overall',
}

function formatMeta(table: StandingTable) {
  const parts = [
    table.stage ? STAGE_LABELS[table.stage] ?? table.stage : null,
    table.group,
    table.day ? `Day ${table.day}` : null,
    table.afterMatch ? `After Match ${table.afterMatch}` : null,
  ].filter(Boolean)

  return parts.join(' • ')
}

function teamLabel(row: StandingRow) {
  return row.team?.name || row.teamName || '—'
}

const RANK_MEDALS: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' }

function rankAccent(rank: string) {
  if (rank === '1') return { stripe: 'bg-yellow-400', badge: 'bg-yellow-400/15 text-yellow-500 dark:text-yellow-400' }
  if (rank === '2') return { stripe: 'bg-gray-400', badge: 'bg-gray-300/25 dark:bg-gray-500/20 text-gray-500 dark:text-gray-300' }
  if (rank === '3') return { stripe: 'bg-amber-600', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-500' }
  return null
}

export default function StandingsTables({ standings }: { standings: StandingTable[] }) {
  if (!standings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
        <BarChart2 className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
          No standings published yet
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">
          Standings will appear here once the latest official table is available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {standings.map((table) => (
        <section key={table._id}>
          <div className="mb-3">
            <h2 className="text-lg md:text-xl font-black font-space-grotesk text-gray-900 dark:text-white">
              {table.title}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
              {formatMeta(table) && <span>{formatMeta(table)}</span>}
              {table.lastUpdated && (
                <span>
                  Updated{' '}
                  {new Date(table.lastUpdated).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Mobile: stacked cards */}
          {(() => {
            const isModern = table.mobileCardStyle !== 'classic'
            const hidden = new Set(table.mobileHiddenStats || [])
            type StatKey = 'matchesPlayed' | 'wwcd' | 'placementPoints' | 'kills'
            const ALL_STATS: { key: StatKey; label: string; get: (row: StandingRow) => number }[] = [
              { key: 'matchesPlayed', label: 'MP', get: (row: StandingRow) => row.matchesPlayed ?? 0 },
              { key: 'wwcd', label: 'WWCD', get: (row: StandingRow) => row.wwcd ?? row.wins ?? 0 },
              { key: 'placementPoints', label: 'Place', get: (row: StandingRow) => row.placementPoints ?? 0 },
              { key: 'kills', label: 'Kills', get: (row: StandingRow) => row.kills ?? 0 },
            ]
            const STATS = ALL_STATS.filter((s) => !hidden.has(s.key))

            return (
              <div className="flex flex-col gap-2.5 sm:hidden">
                {(table.rows || []).map((row, i) => {
                  const rank = String(row.rank ?? i + 1)
                  const accent = isModern ? rankAccent(rank) : null
                  return (
                    <div
                      key={row._key || `${table._id}-m${i}`}
                      className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] p-3.5 ${isModern ? 'pl-4' : ''}`}
                    >
                      {accent && <span className={`absolute inset-y-0 left-0 w-1 ${accent.stripe}`} />}
                      <div className={`flex items-center justify-between gap-3 ${isModern ? 'pb-2.5 border-b border-gray-100 dark:border-gray-800/40' : 'mb-2'}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={
                              isModern
                                ? `flex items-center justify-center w-8 h-8 rounded-full text-sm font-black shrink-0 ${
                                    accent ? accent.badge : 'bg-gray-100 dark:bg-[#13131A] text-gray-400 dark:text-gray-600'
                                  }`
                                : 'text-sm font-bold text-gray-400 dark:text-gray-600 font-mono w-6 shrink-0'
                            }
                          >
                            {RANK_MEDALS[rank] || (isModern ? rank : `#${rank}`)}
                          </span>
                          <TeamLogo src={row.team?.logoUrl ?? null} name={teamLabel(row)} size={26} className="shrink-0" />
                          <span className={`font-bold text-gray-900 dark:text-gray-100 truncate ${isModern ? 'text-[15px]' : 'text-sm'}`}>
                            {teamLabel(row)}
                          </span>
                        </div>
                        {isModern ? (
                          <div className="text-right shrink-0 pl-2">
                            <div className="text-lg font-black font-space-grotesk text-blue-600 dark:text-[#00E5FF] leading-none">
                              {row.points ?? 0}
                            </div>
                            <div className="text-[9px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-600 mt-0.5">
                              pts
                            </div>
                          </div>
                        ) : (
                          <span className="font-bold text-yellow-600 dark:text-yellow-400 text-base shrink-0">
                            {row.points ?? 0} <span className="text-[10px] font-mono uppercase text-gray-400 dark:text-gray-600">pts</span>
                          </span>
                        )}
                      </div>
                      <div className={`flex flex-wrap items-center gap-1.5 ${isModern ? 'mt-2.5' : ''}`}>
                        {STATS.map((stat) => (
                          <span
                            key={stat.key}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13131A] text-gray-500 dark:text-gray-400"
                          >
                            <span className="uppercase tracking-wider opacity-70">{stat.label}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{stat.get(row)}</span>
                          </span>
                        ))}
                        {row.qualified ? (
                          <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                            Qualified
                          </span>
                        ) : row.eliminated ? (
                          <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                            Eliminated
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Desktop: real table — VLR.gg-style dense standings: sticky
              header, hover highlight, and a colored left-edge bar per row
              (green = qualified, red = eliminated) instead of only a
              status pill, so table state reads at a glance while scanning. */}
          <div className="hidden sm:block overflow-x-auto bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-2xl">
            <table className="w-full text-sm min-w-[760px] border-collapse">
              <thead>
                <tr className="text-gray-500 dark:text-gray-500 uppercase text-[11px] font-mono tracking-widest border-b border-gray-200 dark:border-gray-800/60">
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 pl-5 pr-2 text-left w-10">#</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-2 text-left">Team</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-2 text-center">MP</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-2 text-center">WWCD</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-2 text-center">Place</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-2 text-center">Kills</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-4 text-center font-bold text-blue-600 dark:text-[#00E5FF]">Pts</th>
                  <th className="sticky top-0 bg-gray-50 dark:bg-[#13131A] py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {(table.rows || []).map((row, i) => (
                  <tr
                    key={row._key || `${table._id}-${i}`}
                    className={`relative border-b border-gray-100 dark:border-gray-800/40 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                      i < 3 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <td className="relative py-2.5 pl-5 pr-2 font-bold text-gray-400 dark:text-gray-600">
                      {row.qualified && (
                        <span className="absolute inset-y-0 left-0 w-[3px] bg-green-500" />
                      )}
                      {row.eliminated && (
                        <span className="absolute inset-y-0 left-0 w-[3px] bg-red-500/70" />
                      )}
                      {row.rank ?? i + 1}
                    </td>

                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={row.team?.logoUrl ?? null} name={teamLabel(row)} size={28} className="w-7 h-7" />
                        <span className="font-semibold">{teamLabel(row)}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-center tabular-nums">{row.matchesPlayed ?? 0}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums">{row.wwcd ?? row.wins ?? 0}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums">{row.placementPoints ?? 0}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums">{row.kills ?? 0}</td>

                    <td className="py-2.5 px-4 text-center font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
                      {row.points ?? 0}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      {row.qualified ? (
                        <span className="inline-flex rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                          Qualified
                        </span>
                      ) : row.eliminated ? (
                        <span className="inline-flex rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                          Eliminated
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
