'use client';

import { useMemo, useState } from 'react';
import TournamentCard from '@/components/TournamentCard';
import Reveal from '@/components/Reveal';
import type { Tournament } from '@/lib/tournamentApi';

type Status = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

const TABS: { key: 'all' | Status; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ONGOING', label: 'Ongoing' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
];

/**
 * Client-side status filter for the tournaments hub. Status per tournament
 * is pre-computed on the server (from `getTournamentStatus`, which already
 * auto-expires "Ongoing" once an edition's end date has passed) so this
 * component only needs to filter/group — no date math here.
 */
export default function TournamentGrid({
  tournaments,
}: {
  tournaments: (Tournament & { status: Status })[];
}) {
  const [tab, setTab] = useState<'all' | Status>('all');

  const counts = useMemo(() => {
    const c: Record<Status, number> = { ONGOING: 0, UPCOMING: 0, COMPLETED: 0 };
    tournaments.forEach((t) => { c[t.status]++; });
    return c;
  }, [tournaments]);

  const filtered = tab === 'all' ? tournaments : tournaments.filter((t) => t.status === tab);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-none px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-widest border transition-colors ${
              tab === key
                ? 'bg-[#00E5FF] text-[#0B0B0F] border-[#00E5FF]'
                : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]'
            }`}
          >
            {label}
            {key !== 'all' && ` (${counts[key]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">No {tab.toLowerCase()} tournaments right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((tournament, i) => (
            <Reveal key={tournament._id} delay={(i % 3) * 90} className="h-full">
              <TournamentCard tournament={tournament} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
