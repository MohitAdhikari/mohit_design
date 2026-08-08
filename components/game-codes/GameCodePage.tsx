'use client';

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { CodeCard } from './CodeCard';
import { STATUS_CONFIG } from './constants';
import { formatMDY } from './utils';
import type { CodeItem, PollOption, Status } from './types';

export type { CodeItem, PollOption } from './types';

export type SectionKey = 'codes' | 'howToRedeem' | 'submit' | 'poll' | 'updateInstructions';

export interface GameCodePageProps {
  title: string;
  lastUpdated: string;
  codes: CodeItem[];
  howToRedeem: React.ReactNode;
  pollQuestion: string;
  pollOptions: PollOption[];
  pollTotalVotes: string;
  footerNote: string;
  updateInstructions?: React.ReactNode;
  sectionOrder?: SectionKey[];
}

function Poll({ question, options, totalVotes }: { question: string; options: PollOption[]; totalVotes: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleVote = () => {
    if (!selected) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setVoted(true);
  };

  return (
    <div ref={ref} className="rounded-[14px] border border-[#1e2130] bg-[#12151f] p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <h3 className="text-base font-bold text-[#e2e8f0]">{question}</h3>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/25 text-[#6c63ff] text-[11px] font-semibold">
          {totalVotes} votes
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <label key={opt.label} className="flex flex-col gap-1 cursor-pointer select-none group">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="game-poll"
                value={opt.label}
                disabled={voted}
                checked={selected === opt.label}
                onChange={() => setSelected(opt.label)}
                className="w-4 h-4 shrink-0 accent-[#6c63ff] cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-[#cbd5e1] group-hover:text-white transition-colors">{opt.label}</span>
              <span className="ml-auto text-[11px] text-[#a78bfa] font-bold">{opt.percent}%</span>
            </div>
            <div className="h-[7px] bg-[#1e2130] rounded-full overflow-hidden ml-6">
              <div
                className={`h-full rounded-full ${opt.barClass} transition-[width] duration-1000 ease-out`}
                style={{ width: inView ? `${opt.percent}%` : '0%' }}
              />
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleVote}
        disabled={voted}
        className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          voted
            ? 'bg-emerald-600 text-white cursor-default'
            : error
            ? 'bg-red-500/10 text-red-400 border border-red-500/40'
            : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {voted ? <Check className="w-4 h-4" /> : <span className="text-base leading-none">🔥</span>}
        {voted ? 'Vote Recorded!' : 'Cast Vote'}
      </button>
    </div>
  );
}

function SectionHeader({ status, count, warning }: { status: Status; count: number; warning?: string }) {
  const config = STATUS_CONFIG[status];
  const titles: Record<Status, string> = {
    active: '✅ Active Codes',
    notsure: '⚠️ Not Sure',
    expired: '❌ Expired Codes',
  };

  return (
    <div className="flex items-center gap-3 pb-3.5 mb-1 border-b border-[#1e2130]">
      <div className={`w-1 h-7 rounded-sm ${config.leftBorder.replace('border-l-', 'bg-')}`} />
      <h2 className={`text-base font-bold ${config.text}`}>{titles[status]}</h2>
      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.pillBorder}`}>
        {count} {status === 'active' ? 'Active' : status === 'notsure' ? 'Not Sure' : 'Expired'}
      </span>
      {warning && (
        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-600/20 text-amber-400 text-[10px] font-semibold">
          {warning}
        </span>
      )}
    </div>
  );
}

function SubmitCode() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setSubmitted(true);
    setValue('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="rounded-[14px] border border-[#1e2130] bg-[#12151f] p-6 mb-8">
      <h3 className="text-base font-bold text-[#e2e8f0] mb-1">📬 Submit a Code</h3>
      <p className="text-[13px] text-[#64748b] mb-4">Found an expired or missing code? Let us know.</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste code or describe the issue…"
        className={`w-full min-h-[80px] resize-y rounded-lg border bg-[#0b0d14] text-[#f1f5f9] text-[13px] p-3 outline-none transition-colors placeholder:text-[#475569] ${
          error ? 'border-red-500' : 'border-[#1e2130] focus:border-[#7c3aed]'
        }`}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7c3aed] text-white text-sm font-semibold transition-all hover:bg-[#6d28d9] hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0"
      >
        {submitted ? <Check className="w-4 h-4" /> : 'Submit'}
      </button>
      {submitted && (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-emerald-400">
          <Check className="w-4 h-4" /> Thanks! We&apos;ll review it soon.
        </div>
      )}
    </div>
  );
}

function InstructionsToggle({ children, title }: { children: React.ReactNode; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-[#1e2130] bg-[#0f1120] px-4 py-3 text-sm font-semibold text-[#94a3b8] hover:border-[#2d3148] hover:text-[#e2e8f0] transition-colors"
      >
        <span className="flex items-center gap-2">🛠️ {title}</span>
        <span className={`text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div
        className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="rounded-b-xl border border-t-0 border-[#1e2130] bg-[#0f1120] px-5 py-5 text-[13px] text-[#64748b] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameCodePage({
  title,
  lastUpdated,
  codes,
  howToRedeem,
  pollQuestion,
  pollOptions,
  pollTotalVotes,
  footerNote,
  updateInstructions,
  sectionOrder,
}: GameCodePageProps) {
  const [expiredOpen, setExpiredOpen] = useState(false);

  const grouped = useMemo(() => {
    const priority: Record<Status, number> = { active: 0, notsure: 1, expired: 2 };
    const sorted = [...codes].sort((a, b) => {
      const pd = priority[a.status] - priority[b.status];
      if (pd !== 0) return pd;
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    });
    return {
      active: sorted.filter((c) => c.status === 'active'),
      notsure: sorted.filter((c) => c.status === 'notsure'),
      expired: sorted.filter((c) => c.status === 'expired'),
    };
  }, [codes]);

  const counts = useMemo(
    () => ({
      active: grouped.active.length,
      notsure: grouped.notsure.length,
      expired: grouped.expired.length,
    }),
    [grouped]
  );

  const order = sectionOrder ?? ['codes', 'howToRedeem', 'submit', 'poll', 'updateInstructions'];

  const sections: Record<SectionKey, ReactNode> = {
    codes: (
      <>
        {counts.active > 0 && (
          <section className="mb-9">
            <SectionHeader status="active" count={counts.active} />
            <div className="flex flex-col gap-2 pt-2.5">
              {grouped.active.map((item, idx) => (
                <CodeCard key={`active-${idx}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {counts.notsure > 0 && (
          <section className="mb-9">
            <SectionHeader
              status="notsure"
              count={counts.notsure}
              warning="These codes may have expired — try at your own risk"
            />
            <div className="flex flex-col gap-2 pt-2.5">
              {grouped.notsure.map((item, idx) => (
                <CodeCard key={`notsure-${idx}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {counts.expired > 0 && (
          <section id="expired" className="mb-9 scroll-mt-44">
            <SectionHeader status="expired" count={counts.expired} />
            <button
              type="button"
              onClick={() => setExpiredOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-xl border border-[#1e2130] bg-[#12151f] px-4 py-3 text-[0.85rem] font-semibold text-red-400 hover:bg-[#1a0e0e] hover:border-red-500/30 transition-colors"
            >
              <span>{expiredOpen ? '▲ Hide' : '▼ Show'} {counts.expired} Expired Codes</span>
              <span className={`transition-transform duration-300 ${expiredOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
              className={`grid transition-all duration-500 ${
                expiredOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2">
                  {grouped.expired.map((item, idx) => (
                    <CodeCard key={`expired-${idx}`} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </>
    ),
    howToRedeem: (
      <div id="how-to-redeem" className="scroll-mt-44">
        <div className="rounded-[14px] border border-[#1e2130] bg-[#12151f] p-6 mb-9">
          <h3 className="text-base font-bold text-[#e2e8f0] mb-3">📖 How to Redeem Codes</h3>
          <div className="text-[13px] text-[#94a3b8] leading-relaxed">{howToRedeem}</div>
        </div>
      </div>
    ),
    submit: <SubmitCode />,
    poll: (
      <section className="mb-9">
        <Poll question={pollQuestion} options={pollOptions} totalVotes={pollTotalVotes} />
      </section>
    ),
    updateInstructions: updateInstructions ? (
      <InstructionsToggle title="How to Update Codes">
        <div className="text-[#94a3b8]">{updateInstructions}</div>
      </InstructionsToggle>
    ) : null,
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#e2e8f0] font-sans pb-12">
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#0f1120] to-[#0b0d14] border-b border-[#1e2130] backdrop-blur-xl px-5">
        <div className="max-w-[860px] mx-auto flex flex-col gap-3.5 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
              {title} Codes
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1e2130] border border-[#2d3148] text-[0.72rem] font-medium text-[#94a3b8] whitespace-nowrap">
              Last Updated: {formatMDY(lastUpdated)}
            </span>
          </div>

          <nav className="flex flex-wrap gap-2">
            <a
              href="#how-to-redeem"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e2130] border border-[#2d3148] text-[#a78bfa] text-xs font-medium hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] transition-all"
            >
              📖 How to Redeem
            </a>
            <a
              href="#expired"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e2130] border border-[#2d3148] text-[#a78bfa] text-xs font-medium hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] transition-all"
            >
              ❌ Expired Codes
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[0.72rem] text-[#64748b] font-medium uppercase tracking-wider">Status</span>
            {(['active', 'notsure', 'expired'] as Status[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="flex items-center gap-2 text-[0.78rem] font-medium text-[#94a3b8]">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#1e2130] text-[0.68rem] text-[#94a3b8]">
                    {counts[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-[860px] mx-auto px-4 sm:px-5 pt-8">
        {order.map((key) => (
          <Fragment key={key}>{sections[key]}</Fragment>
        ))}
      </main>

      <footer className="border-t border-[#1e2130] py-5 mt-8">
        <div className="max-w-[860px] mx-auto px-5 text-center">
          <p className="text-[0.72rem] text-[#334155]">{footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
