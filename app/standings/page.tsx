import { getActiveEdition, getStandings } from '@/lib/tournamentApi'
import type { Standing } from '@/lib/tournamentApi'

export default async function StandingsPage() {
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

  const standings = await getStandings(edition._id)

  return (
    <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white">
          Standings
        </h1>
        <p className="text-gray-500 dark:text-gray-500 text-sm font-mono uppercase tracking-widest mt-1">{edition.name}</p>
      </div>

      {standings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
          <span className="text-4xl">📊</span>
          <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-xs">
            No standings data yet
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-[#13131A] text-gray-500 dark:text-gray-500 uppercase text-xs font-mono tracking-widest">
              <tr>
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
              {standings.map((s: Standing, i: number) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-[#15151C] transition-colors">
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-600 font-mono">{s.rank ?? i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.team?.logoUrl && (
                        <img src={s.team.logoUrl} alt={s.team.name} className="w-7 h-7 object-contain" />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{s.team?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">{s.wins ?? 0}</td>
                  <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-semibold">{s.losses ?? 0}</td>
                  <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-bold">{s.points ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
