import { notFound } from 'next/navigation'
import { getActiveEditionByTournamentSlug, getStandings } from '@/lib/tournamentApi'
import { EditionTabs } from '@/components/EditionTabs'
import StandingsTables from '@/components/StandingsTables'

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

      <StandingsTables standings={standings} />
    </main>
  )
}
