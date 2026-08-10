import { notFound } from 'next/navigation'
import { getActiveEditionByTournamentSlug, getStandings } from '@/lib/tournamentApi'
import type { Standing } from '@/lib/tournamentApi'
import { EditionTabs } from '@/components/EditionTabs'

type Props = { params: Promise<{ slug: string }> }

export default async function StandingsPage({ params }: Props) {
  const { slug } = await params
  const edition = await getActiveEditionByTournamentSlug(slug)
  if (!edition) notFound()

  const standings = await getStandings(edition._id)

  return (
    <main className="min-h-screen bg-white dark:bg-[#0B0B0F] px-4 sm:px-6 lg:px-8 py-10 md:py-14 max-w-[1300px] mx-auto">
      <EditionTabs slug={slug} active="standings" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black font-space-grotesk text-gray-900 dark:text-white">
          {edition.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-500 text-sm font-mono uppercase tracking-widest mt-1">Standings</p>
      </div>

      {standings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
          <span className="text-4xl">📊</span>
          <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-xs">
            No standings data yet
          </p>
        </div>
      )}

      {standings.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-[#0E0E12] border border-gray-200 dark:border-gray-800/60 rounded-2xl">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-gray-500 dark:text-gray-500 uppercase text-xs font-mono tracking-widest border-b border-gray-200 dark:border-gray-800/60">
                <th className="py-3 px-4 text-left w-8">#</th>
                <th className="py-3 px-2 text-left">Team</th>
                <th className="py-3 px-2 text-center">MP</th>
                <th className="py-3 px-2 text-center">W</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">WWCD</th>
                <th className="py-3 px-2 text-center">Kills</th>
                <th className="py-3 px-4 text-center font-bold text-blue-600 dark:text-[#00E5FF]">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s: Standing, i: number) => (
                <tr
                  key={s._id}
                  className={`border-b border-gray-100 dark:border-gray-800/40 last:border-0 ${
                    i < 3 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-gray-400 dark:text-gray-600">{s.rank}</td>
                  <td className="py-3 px-2 font-semibold">{s.team?.name ?? '—'}</td>
                  <td className="py-3 px-2 text-center">{s.matchesPlayed}</td>
                  <td className="py-3 px-2 text-center">{s.wins}</td>
                  <td className="py-3 px-2 text-center">{s.losses}</td>
                  <td className="py-3 px-2 text-center">{s.wwcd}</td>
                  <td className="py-3 px-2 text-center">{s.kills}</td>
                  <td className="py-3 px-4 text-center font-bold text-yellow-600 dark:text-yellow-400">
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
