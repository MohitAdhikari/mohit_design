import { notFound } from 'next/navigation'
import { getEditionBySlug, getStandings } from '@/lib/tournamentApi'
import type { Standing } from '@/lib/tournamentApi'

type Props = { params: Promise<{ slug: string }> }

export default async function StandingsPage({ params }: Props) {
  const { slug } = await params
  const edition = await getEditionBySlug(slug)
  if (!edition) notFound()

  const standings = await getStandings(edition._id)

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{edition.title}</h1>
      <p className="text-zinc-400 mb-8">Standings</p>

      {standings.length === 0 && (
        <p className="text-zinc-500">No standings data yet.</p>
      )}

      {standings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 uppercase text-xs border-b border-zinc-800">
                <th className="py-3 text-left w-8">#</th>
                <th className="py-3 text-left">Team</th>
                <th className="py-3 text-center">MP</th>
                <th className="py-3 text-center">W</th>
                <th className="py-3 text-center">L</th>
                <th className="py-3 text-center">WWCD</th>
                <th className="py-3 text-center">Kills</th>
                <th className="py-3 text-center font-bold text-white">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: Standing, i: number) => (
                <tr
                  key={s._id}
                  className={`border-b border-zinc-800/50 ${
                    i < 3 ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  <td className="py-3 font-bold text-zinc-500">{s.rank}</td>
                  <td className="py-3 font-semibold">{s.team?.name ?? '—'}</td>
                  <td className="py-3 text-center">{s.matchesPlayed}</td>
                  <td className="py-3 text-center">{s.wins}</td>
                  <td className="py-3 text-center">{s.losses}</td>
                  <td className="py-3 text-center">{s.wwcd}</td>
                  <td className="py-3 text-center">{s.kills}</td>
                  <td className="py-3 text-center font-bold text-yellow-400">
                    {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
