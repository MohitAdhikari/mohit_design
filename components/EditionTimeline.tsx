import Link from 'next/link'
import TeamLogo from '@/components/TeamLogo'
import { formatCurrency } from '@/lib/currency'
import type { TournamentEdition } from '@/lib/tournamentApi'

interface Props {
  editions: TournamentEdition[]
  tournamentSlug: string
  currentEditionId?: string
}

type DisplayStatus = 'live' | 'upcoming' | 'completed'

function deriveStatus(e: TournamentEdition): DisplayStatus {
  const ts = e.tournamentStatus
  if (ts === 'completed') return 'completed'
  if (ts === 'upcoming')  return 'upcoming'
  if (ts === 'group_stage' || ts === 'survival_stage' || ts === 'grand_finals') return 'live'
  if (!e.startDate) return 'upcoming'
  const now   = Date.now()
  const start = new Date(e.startDate).getTime()
  const end   = e.endDate ? new Date(e.endDate).getTime() : null
  if (now < start) return 'upcoming'
  if (end && now > end) return 'completed'
  return 'live'
}

function StatusBadge({ s }: { s: DisplayStatus }) {
  if (s === 'live') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      Live
    </span>
  )
  if (s === 'upcoming') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/25 border-dashed">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      Upcoming
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      Completed
    </span>
  )
}

function fmtRange(start: string | null, end: string | null): string {
  if (!start) return 'TBA'
  const s    = new Date(start)
  const e    = end ? new Date(end) : null
  const full: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  const noYr: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (!e) return s.toLocaleDateString('en-IN', full)
  if (s.getFullYear() === e.getFullYear())
    return `${s.toLocaleDateString('en-IN', noYr)} – ${e.toLocaleDateString('en-IN', full)}` 
  return `${s.toLocaleDateString('en-IN', full)} – ${e.toLocaleDateString('en-IN', full)}` 
}

function prizeLabel(e: TournamentEdition): string | null {
  if (e.prizePoolDisplay) return e.prizePoolDisplay
  if (e.totalPrizePool)   return formatCurrency(e.totalPrizePool, e.prizePoolCurrency ?? 'INR')
  return null
}

const STAGE_LABELS: Record<string, string> = {
  group_stage: 'Group Stage', survival_stage: 'Survival Stage', grand_finals: 'Grand Finals',
}

export default function EditionTimeline({ editions, tournamentSlug, currentEditionId }: Props) {
  if (!editions.length) return null

  const sorted = [...editions].sort((a, b) => {
    if (!a.startDate) return 1
    if (!b.startDate) return -1
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

  return (
    <div className="relative">
      {/* Vertical spine — desktop only */}
      <div aria-hidden className="hidden md:block absolute left-[88px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800/60" />

      <div className="flex flex-col gap-3">
        {sorted.map((edition, idx) => {
          const status   = deriveStatus(edition)
          const prize    = prizeLabel(edition)
          const isPast   = status === 'completed'
          const isCurrent = edition._id === currentEditionId || idx === 0
          const stageNow = edition.tournamentStatus && !['upcoming','completed'].includes(edition.tournamentStatus)
            ? STAGE_LABELS[edition.tournamentStatus] ?? null
            : null

          return (
            <Link
              key={edition._id}
              href={`/esports/${tournamentSlug}`}
              className={[
                'group relative flex items-stretch rounded-2xl overflow-hidden border transition-all duration-200',
                isCurrent
                  ? 'border-[#00E5FF]/40 bg-white dark:bg-[#0E0E12] shadow-[0_0_0_1px_rgba(0,229,255,0.1)]'
                  : isPast
                    ? 'border-gray-100 dark:border-gray-800/40 bg-white/60 dark:bg-[#0E0E12]/60 hover:border-gray-300 dark:hover:border-gray-700'
                    : 'border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] hover:border-[#00E5FF]/30',
              ].join(' ')}
            >
              {/* Year column — desktop */}
              <div className={[
                'hidden md:flex flex-shrink-0 w-[88px] flex-col items-center justify-center px-3 py-5 border-r',
                isPast ? 'border-gray-100 dark:border-gray-800/40' : 'border-gray-200 dark:border-gray-800/60',
              ].join(' ')}>
                <span className={[
                  'w-2.5 h-2.5 rounded-full mb-2 flex-shrink-0',
                  status === 'live'      ? 'bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.4)]' : '',
                  status === 'upcoming'  ? 'bg-blue-400' : '',
                  status === 'completed' ? 'bg-gray-400 dark:bg-gray-700' : '',
                ].join(' ')} />
                <span className={[
                  'text-sm font-black font-space-grotesk leading-tight text-center',
                  isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white',
                ].join(' ')}>
                  {edition.year}
                </span>
              </div>

              {/* Main content */}
              <div className={['flex-1 px-5 py-4 flex flex-col gap-2', isPast ? 'opacity-70' : ''].join(' ')}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="md:hidden text-sm font-black font-space-grotesk text-gray-900 dark:text-white">
                    {edition.year}
                  </span>
                  <StatusBadge s={status} />
                  {stageNow && (
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      {stageNow}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={['text-xs font-mono', isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'].join(' ')}>
                    {fmtRange(edition.startDate, edition.endDate)}
                  </span>
                  {edition.format && (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600">
                      {edition.format}
                    </span>
                  )}
                  {edition.venue && (
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 truncate max-w-[200px]">
                      {edition.venue}
                    </span>
                  )}
                </div>

                {edition.winner && (
                  <div className="flex items-center gap-2">
                    <TeamLogo src={edition.winner.logoUrl} name={edition.winner.name} size={20} className="w-5 h-5 flex-shrink-0" />
                    <span className={['text-xs font-semibold', isPast ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'].join(' ')}>
                      {edition.winner.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600">
                      Champion
                    </span>
                  </div>
                )}
              </div>

              {/* Prize — right column */}
              {prize && (
                <div className={[
                  'hidden sm:flex flex-shrink-0 flex-col items-end justify-center px-5 py-4 border-l',
                  isPast ? 'border-gray-100 dark:border-gray-800/40' : 'border-gray-200 dark:border-gray-800/60',
                ].join(' ')}>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">
                    Prize Pool
                  </span>
                  <span className={[
                    'text-base font-black font-space-grotesk tabular-nums',
                    isPast
                      ? 'text-gray-500 dark:text-gray-500'
                      : 'text-gray-900 dark:text-white group-hover:text-[#00E5FF] transition-colors',
                  ].join(' ')}>
                    {prize}
                  </span>
                  {(edition.prizePoolStages?.length ?? 0) > 0 && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600 mt-0.5">
                      {edition.prizePoolStages.length} stages
                    </span>
                  )}
                </div>
              )}

              {/* Chevron */}
              <div className="hidden md:flex items-center pr-4 pl-1 text-gray-300 dark:text-gray-700 group-hover:text-[#00E5FF] transition-colors" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
