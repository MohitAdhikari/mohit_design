import { getTournaments } from '@/lib/tournamentApi'
import TournamentCard from '@/components/TournamentCard'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Esports | PHONEOCEAN',
  description: 'Browse all BGMI and mobile esports tournaments — results, prize pools, teams, and more.',
}

export const revalidate = 60

export default async function TournamentsPage() {
  const tournaments = await getTournaments()

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="Esports Hub"
        title={<>All <span className="text-blue-600 dark:text-[#00E5FF]">Esports</span></>}
        description="Track every major BGMI and mobile esports tournament — brackets, prize pools, teams, and champions."
        accent="cyan"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {tournaments.length} {tournaments.length === 1 ? 'tournament' : 'tournaments'}
          </span>
        }
      />

      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <span className="text-5xl">🏆</span>
          <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-sm">
            No tournaments yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {tournaments.map((tournament, i) => (
            <Reveal key={tournament._id} delay={(i % 3) * 90} className="h-full">
              <TournamentCard tournament={tournament} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
