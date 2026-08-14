import { getActiveEdition, getStandings } from '@/lib/tournamentApi'
import StandingsTables from '@/components/StandingsTables'
import { BarChart2 } from 'lucide-react'

// ZERO-ISR MODE: live tournament data, rendered per request. Never written
// to the ISR cache, so it consumes no Vercel ISR Write Units and reflects
// Sanity updates immediately.
export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const edition = await getActiveEdition()
  if (!edition) {
    return (
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <BarChart2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
          <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            No active tournament
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs max-w-md">
            Standings will appear here once an active edition is available.
          </p>
        </div>
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

      <StandingsTables standings={standings} />
    </main>
  )
}
