'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

const STORAGE_KEY = 'phoneocean-game-code-poll';
const DEFAULT_OPTIONS: PollOption[] = [
  { id: 'bgmi', label: 'BGMI', votes: 142 },
  { id: 'freefire', label: 'Free Fire', votes: 98 },
  { id: 'roblox', label: 'Roblox', votes: 76 },
  { id: 'valorant', label: 'Valorant', votes: 54 },
  { id: 'other', label: 'Other', votes: 32 },
];

export default function GameCodePoll() {
  const [options, setOptions] = useState<PollOption[]>(DEFAULT_OPTIONS);
  const [hasVoted, setHasVoted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PollOption[];
        setOptions(parsed);
        setHasVoted(true);
      }
    } catch {}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const total = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (id: string) => {
    if (hasVoted || selected) return;
    const next = options.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o));
    setOptions(next);
    setSelected(id);
    setHasVoted(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div ref={ref} className="rounded-2xl border border-purple-500/10 bg-[#0f1117] p-6 sm:p-8">
      <h3 className="text-lg sm:text-xl font-bold font-space-grotesk mb-2 text-white">
        Which game needs new codes next?
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        {hasVoted ? 'Thanks for voting — here is what the community picked.' : 'Vote below and help us prioritise updates.'}
      </p>

      <div className="space-y-4">
        {options.map((option) => {
          const percent = total ? Math.round((option.votes / total) * 100) : 0;
          const active = selected === option.id;
          const showResult = hasVoted;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`group w-full text-left relative rounded-xl border transition-all duration-300 overflow-hidden ${
                active
                  ? 'border-purple-500/40 bg-purple-500/10'
                  : 'border-gray-800 bg-[#13151d] hover:border-purple-500/30 hover:bg-[#161923]'
              } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="relative z-10 flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium text-gray-200">{option.label}</span>
                {showResult && (
                  <span className="text-xs font-mono font-bold text-purple-300">{percent}%</span>
                )}
                {active && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
                )}
              </div>

              {showResult && (
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600/20 to-purple-500/10 transition-[width] duration-1000 ease-out"
                  style={{ width: inView ? `${percent}%` : '0%' }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {total.toLocaleString()} votes
      </div>
    </div>
  );
}
