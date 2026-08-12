'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Check } from 'lucide-react';
import { motion } from 'motion/react';
import CodeCopyBox from '@/components/blocks/CodeCopyBox';
import GameCodePoll from '@/components/GameCodePoll';
import GameCodeFeedback from '@/components/GameCodeFeedback';
import { isExpiredNow, isRedeemedNow, isUsable, type CodeEntry } from '@/lib/codeEntries';
import { optimizedImageUrl } from '@/lib/sanityImage';

interface GuideWithCodes {
  _id: string;
  title: string;
  slug: { current: string };
  gameName: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  codeEntries?: CodeEntry[];
  codesList?: string[];
}

interface FilterState {
  working: boolean;
  new: boolean;
  expired: boolean;
  redeemed: boolean;
}

const filterLabels: Record<keyof FilterState, string> = {
  working: 'Working',
  new: 'New',
  expired: 'Expired',
  redeemed: 'Redeemed',
};

function normalizeEntries(guide: GuideWithCodes): (CodeEntry & { guideId: string; guideTitle: string; guideSlug: string; gameName: string; thumbnail?: string; thumbnailAlt?: string })[] {
  const base = {
    guideId: guide._id,
    guideTitle: guide.title,
    guideSlug: guide.slug.current,
    gameName: guide.gameName,
    thumbnail: guide.thumbnail,
    thumbnailAlt: guide.thumbnailAlt,
  };

  const rich: CodeEntry[] = guide.codeEntries?.length
    ? guide.codeEntries
    : (guide.codesList || []).map((code) => ({ code, reward: guide.title, showReward: false }));

  return rich.map((entry) => ({ ...entry, ...base }));
}

export default function GameCodesClient({ guides }: { guides: GuideWithCodes[] }) {
  const allEntries = useMemo(() => guides.flatMap(normalizeEntries), [guides]);
  const games = useMemo(() => Array.from(new Set(guides.map((g) => g.gameName))).sort(), [guides]);

  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ working: true, new: false, expired: false, redeemed: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let rows = allEntries;

    if (selectedGame) {
      rows = rows.filter((e) => e.gameName === selectedGame);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((e) => e.code.toLowerCase().includes(q) || e.guideTitle.toLowerCase().includes(q) || e.gameName.toLowerCase().includes(q));
    }

    const anyFilter = Object.values(filters).some(Boolean);
    if (anyFilter) {
      rows = rows.filter((e) => {
        const expired = isExpiredNow(e.isExpired, e.expiresAt);
        const redeemed = isRedeemedNow(e.isRedeemed);
        const usable = isUsable(e);
        if (filters.working && usable && !e.isNew) return true;
        if (filters.new && e.isNew && usable) return true;
        if (filters.expired && expired) return true;
        if (filters.redeemed && redeemed) return true;
        return false;
      });
    }

    return rows.sort((a, b) => {
      const au = isUsable(a) ? 0 : 1;
      const bu = isUsable(b) ? 0 : 1;
      if (au !== bu) return au - bu;
      const an = a.isNew ? 0 : 1;
      const bn = b.isNew ? 0 : 1;
      if (an !== bn) return an - bn;
      return a.code.localeCompare(b.code);
    });
  }, [allEntries, selectedGame, query, filters]);

  const toggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-900 bg-[#0B0B0F]">
        <div className="absolute inset-0 pointer-events-none bg-grid opacity-60" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl animate-aurora" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-aurora" style={{ animationDelay: '-8s' }} />

        <div className="relative max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-mono uppercase tracking-widest font-bold ring-1 ring-purple-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Redeem Codes Hub
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk text-white tracking-tighter leading-tight mb-6">
              Active Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Codes</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              One place for every working code across your favourite games. Copy in one tap and claim rewards instantly.
            </p>
          </motion.div>

          {/* Search + filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col md:flex-row gap-4 md:items-center"
          >
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a game, code or guide..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#13151d] border border-gray-800 text-white placeholder-gray-600 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(filters) as (keyof FilterState)[]).map((key) => {
                const active = filters[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFilter(key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      active
                        ? 'bg-purple-600/10 text-purple-300 border-purple-500/40'
                        : 'bg-[#13151d] text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {filterLabels[key]}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game pills */}
        {games.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGame(null)}
              className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest font-bold transition-all border ${
                selectedGame === null
                  ? 'bg-[#00FF66] text-[#0B0B0F] border-[#00FF66]'
                  : 'bg-[#13151d] text-gray-400 border-gray-800 hover:border-gray-600'
              }`}
            >
              All Games
            </button>
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest font-bold transition-all border ${
                  selectedGame === game
                    ? 'bg-[#00FF66] text-[#0B0B0F] border-[#00FF66]'
                    : 'bg-[#13151d] text-gray-400 border-gray-800 hover:border-gray-600'
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code list */}
          <div className="lg:col-span-2 space-y-8">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0f1117] p-12 text-center">
                <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">No codes match your filters.</p>
                <button
                  onClick={() => { setSelectedGame(null); setQuery(''); setFilters({ working: true, new: false, expired: false, redeemed: false }); }}
                  className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              Object.entries(
                filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
                  (acc[entry.gameName] ||= []).push(entry);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([game, entries]) => (
                  <div key={game}>
                    <div className="flex items-center gap-3 mb-4">
                      {entries[0].thumbnail && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-800 shrink-0">
                          <Image
                            src={optimizedImageUrl(entries[0].thumbnail, 96, 'https://picsum.photos/100/100')}
                            alt={entries[0].thumbnailAlt || game}
                            fill
                            sizes="40px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <h2 className="text-xl font-bold font-space-grotesk text-white">{game}</h2>
                      <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-gray-500">
                        {entries.length} code{entries.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {entries.map((entry, i) => (
                        <motion.div
                          key={`${entry.guideId}-${entry.code}-${i}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <CodeCopyBox
                            code={entry.code}
                            reward={entry.reward}
                            showReward={entry.showReward ?? true}
                            isNew={entry.isNew}
                            isExpired={entry.isExpired}
                            isRedeemed={entry.isRedeemed}
                            expiresAt={entry.expiresAt}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/guides/${entries[0].guideSlug}`}
                        className="text-xs font-mono uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View {entries[0].guideTitle} guide →
                      </Link>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <GameCodePoll />
            <GameCodeFeedback />
          </aside>
        </div>
      </section>
    </div>
  );
}
