import { getActiveEdition, getStandings } from '@/lib/tournamentApi'
import type { Standing } from '@/lib/tournamentApi'

export default async function StandingsPage() {
  const edition = await getActiveEdition()
  if (!edition) return <p className="text-center py-20 text-zinc-400">No active tournament.</p>

  const standings = await getStandings(edition._id)

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Standings</h1>
      <p className="text-zinc-400 mb-10">{edition.name}</p>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {standings.map((s: Standing, i: number) => (
              <tr key={s._id} className={`${i % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900'} hover:bg-zinc-800 transition-colors`}>
                <td className="px-4 py-3 text-zinc-500 font-mono">{s.rank ?? i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.team?.logoUrl && (
                      <img src={s.team.logoUrl} alt={s.team.name} className="w-7 h-7 object-contain" />
                    )}
                    <span className="font-semibold text-white">{s.team?.name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-green-400 font-semibold">{s.wins ?? 0}</td>
                <td className="px-4 py-3 text-center text-red-400 font-semibold">{s.losses ?? 0}</td>
                <td className="px-4 py-3 text-center text-yellow-400 font-bold">{s.points ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
