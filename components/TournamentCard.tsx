import Link from 'next/link'
import Image from 'next/image'
import { Tournament, getTournamentStatus } from '@/lib/tournamentApi'

function StatusBadge({ status }: { status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' }) {
  const styles = {
    UPCOMING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ONGOING:  'bg-green-500/10 text-green-400 border-green-500/30',
    COMPLETED:'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }
  const dot = {
    UPCOMING: 'bg-blue-400',
    ONGOING:  'bg-green-400 animate-pulse',
    COMPLETED:'bg-gray-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'TBA'
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const status = getTournamentStatus(tournament.startDate, tournament.endDate)

  return (
    <Link
      href={`/tournaments/${tournament.slug.current}`}
      className="group relative flex flex-col h-full bg-white dark:bg-[#0E0E12] rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-blue-500/40 dark:hover:border-[#00E5FF]/40 transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,229,255,0.05)] overflow-hidden hover:-translate-y-1"
    >
      <div className="relative flex items-center justify-center bg-gray-100 dark:bg-[#13131A] aspect-video border-b border-gray-200 dark:border-gray-800/60 overflow-hidden">
        {tournament.logoUrl ? (
          <Image
            src={tournament.logoUrl}
            alt={tournament.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <span className="text-4xl font-black text-gray-300 dark:text-gray-700 select-none">
            {tournament.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5 gap-3">
        <h3 className="text-lg font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors">
          {tournament.name}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs font-mono text-gray-500 dark:text-gray-500 mt-auto">
          {tournament.organizer && (
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF]">ORG</span>
              <span className="text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {tournament.organizer}
              </span>
            </div>
          )}
          {tournament.prizePool && (
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF]">PRIZE</span>
              <span className="text-gray-700 dark:text-gray-300">{tournament.prizePool}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[#00E5FF]">DATE</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end text-xs text-blue-600 dark:text-[#00E5FF] group-hover:gap-2 gap-1 transition-all font-mono uppercase tracking-widest">
          View <span className="text-base leading-none">→</span>
        </div>
      </div>
    </Link>
  )
}
