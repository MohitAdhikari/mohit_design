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

          <div className="overflow-x-auto bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-2xl">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-gray-500 dark:text-gray-500 uppercase text-xs font-mono tracking-widest border-b border-gray-200 dark:border-gray-800/60">
                  <th className="py-3 px-4 text-left w-8">#</th>
                  <th className="py-3 px-2 text-left">Team</th>
                  <th className="py-3 px-2 text-center">MP</th>
                  <th className="py-3 px-2 text-center">WWCD</th>
                  <th className="py-3 px-2 text-center">Place</th>
                  <th className="py-3 px-2 text-center">Kills</th>
                  <th className="py-3 px-4 text-center font-bold text-blue-600 dark:text-[#00E5FF]">Pts</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {(table.rows || []).map((row, i) => (
                  <tr
                    key={row._key || `${table._id}-${i}`}
                    className={`border-b border-gray-100 dark:border-gray-800/40 last:border-0 ${
                      i < 3 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-gray-400 dark:text-gray-600">
                      {row.rank ?? i + 1}
                    </td>

                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={row.team?.logoUrl ?? null} name={teamLabel(row)} size={28} className="w-7 h-7" />
                        <span className="font-semibold">{teamLabel(row)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">{row.matchesPlayed ?? 0}</td>
                    <td className="py-3 px-2 text-center">{row.wwcd ?? row.wins ?? 0}</td>
                    <td className="py-3 px-2 text-center">{row.placementPoints ?? 0}</td>
                    <td className="py-3 px-2 text-center">{row.kills ?? 0}</td>

                    <td className="py-3 px-4 text-center font-bold text-yellow-600 dark:text-yellow-400">
                      {row.points ?? 0}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {row.qualified ? (
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                          Qualified
                        </span>
                      ) : row.eliminated ? (
                        <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
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
