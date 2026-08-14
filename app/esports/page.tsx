import { getTournaments } from '@/lib/tournamentApi'
import { getEsportsRelatedNews } from '@/lib/api'
import TournamentCard from '@/components/TournamentCard'
import PageHeader from '@/components/PageHeader'
import Reveal from '@/components/Reveal'
import EsportsRelatedNews from '@/components/EsportsRelatedNews'
import { Trophy } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Esports | PHONEOCEAN',
  description: 'Browse every esports tournament we cover — BGMI (flagship), Free Fire, PUBG Mobile, Valorant and more. Results, prize pools, teams, and champions.',
}

// ISR budget guard: primarily on-demand via /api/revalidate (tournament
// docs revalidate '/esports' on publish). 1-hour fallback in case the
// webhook is ever misconfigured/paused.
export const revalidate = 3600

export default async function TournamentsPage() {
  const [tournaments, relatedNews] = await Promise.all([
    getTournaments(),
    getEsportsRelatedNews(),
  ])

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="Esports Hub"
        title={<>All <span className="text-blue-600 dark:text-[#00E5FF]">Tournaments</span></>}
        description="BGMI is our flagship coverage, alongside Free Fire, PUBG Mobile, Valorant and other mobile/PC esports — brackets, prize pools, teams, and champions, all in one place."
        accent="cyan"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {tournaments.length} {tournaments.length === 1 ? 'tournament' : 'tournaments'}
          </span>
        }
      />

      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
          <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600" />
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-base">
            No tournaments yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm max-w-md">
            Check back soon for upcoming BGMI, PUBG Mobile, Free Fire, and Valorant coverage.
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

      <EsportsRelatedNews articles={relatedNews} />
    </div>
  )
}
