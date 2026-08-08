'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Gamepad2, BookOpen, Ban, Send, ThumbsUp, AlertCircle } from 'lucide-react';

interface CodeItem {
  code: string;
  reward: string;
  isRedeemed?: boolean;
}

interface PollOption {
  label: string;
  percent: number;
}

interface GameCodePageProps {
  title: string;
  lastUpdated: string;
  activeCount?: number;
  codes: CodeItem[];
  howToRedeem: React.ReactNode;
  navLinks?: { label: string; href: string; icon?: React.ReactNode }[];
  pollQuestion: string;
  pollOptions: PollOption[];
  pollTotalVotes: string;
}

function useLocalChecked(key: string, code: string, initial: boolean) {
  const [checked, setChecked] = useState(initial);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (typeof saved[code] === 'boolean') setChecked(saved[code]);
    } catch {}
  }, [key, code]);

  const toggle = (next: boolean) => {
    setChecked(next);
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      saved[code] = next;
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
  };

  return { checked, toggle };
}

function CodeCard({
  item,
  checkedKey,
}: {
  item: CodeItem;
  checkedKey: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const { checked, toggle } = useLocalChecked(checkedKey, item.code, Boolean(item.isRedeemed));

  const handleCopy = async () => {
    if (item.isRedeemed) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = item.code;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, item.code.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) return;
      }
      setCopied(true);
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
        item.isRedeemed
          ? 'bg-[#13151d] border-gray-800 opacity-60'
          : 'bg-[#1a1d27] border-[#2a2d3e] hover:border-[#6c63ff]/40 hover:shadow-[0_6px_24px_rgba(108,99,255,.18)]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={item.isRedeemed}
          onChange={(e) => toggle(e.target.checked)}
          className="w-[18px] h-[18px] shrink-0 rounded-[5px] border-2 border-[#2a2d3e] bg-transparent transition-colors cursor-pointer appearance-none checked:bg-emerald-500 checked:border-emerald-500 disabled:cursor-not-allowed relative checked:after:content-['✓'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-[11px] checked:after:text-white checked:after:font-bold"
        />
        <div className="flex flex-col gap-1.5 min-w-0">
          <span
            className={`font-mono text-sm sm:text-base font-bold tracking-wide truncate transition-all duration-200 ${
              copied
                ? 'text-emerald-400'
                : item.isRedeemed
                ? 'text-gray-500 line-through'
                : 'text-[#e2e8f0]'
            }`}
            aria-live="polite"
          >
            {copied ? 'Copied!' : item.code}
          </span>
          <span
            className={`inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${
              item.isRedeemed
                ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                : 'bg-[#6c63ff]/15 text-[#a78bfa] border-[#6c63ff]/25'
            }`}
          >
            {item.reward}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={item.isRedeemed}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
          copied
            ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(34,197,94,.3)]'
            : item.isRedeemed
            ? 'bg-[#2a2d3e] text-gray-500 cursor-not-allowed opacity-60'
            : 'bg-[#6c63ff] text-white hover:bg-[#7c74ff] hover:shadow-[0_4px_16px_rgba(108,99,255,.4)] hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      {showToast && (
        <div className="fixed bottom-7 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#1e2535] border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-[0_8px_32px_rgba(0,0,0,.4)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Check className="w-4 h-4" />
          Code copied to clipboard!
        </div>
      )}
    </div>
  );
}

function SubmitForm() {
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
    <div className="rounded-2xl border border-[#2a2d3e] bg-[#1a1d27] p-6 mb-9">
      <h3 className="flex items-center gap-2 text-base font-bold text-white mb-1">
        <Gamepad2 className="w-4 h-4 text-[#6c63ff]" />
        Know a code we missed?
      </h3>
      <p className="text-[13px] text-[#94a3b8] mb-4 leading-relaxed">
        Found a new working code? Submit it below and help the community!
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste code here, e.g. SORRYFORWAIT ..."
        className={`w-full min-h-[80px] resize-y rounded-lg border bg-[#0f1117] text-[#f1f5f9] text-[13px] p-3 outline-none transition-colors placeholder:text-[#64748b] ${
          error ? 'border-red-500 placeholder:text-red-400' : 'border-[#2a2d3e] focus:border-[#6c63ff]'
        }`}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6c63ff] text-white text-sm font-semibold transition-all hover:bg-[#7c74ff] hover:shadow-[0_4px_16px_rgba(108,99,255,.4)] hover:-translate-y-0.5 active:translate-y-0"
      >
        {submitted ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        {submitted ? 'Submitted! Thanks!' : 'Submit Code'}
      </button>
    </div>
  );
}

function Poll({ question, options, totalVotes }: { question: string; options: PollOption[]; totalVotes: string }) {
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleVote = () => {
    if (!selected) return;
    setVoted(true);
  };

  return (
    <div ref={ref} className="rounded-2xl border border-[#2a2d3e] bg-[#1a1d27] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <h3 className="text-base font-bold text-white">{question}</h3>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6c63ff]/12 text-[#6c63ff] border border-[#6c63ff]/25 text-[11px] font-semibold whitespace-nowrap">
          {totalVotes} votes
        </span>
      </div>

      <div className="space-y-4">
        {options.map((opt) => (
          <div key={opt.label} className="flex flex-col gap-1.5">
            <label className="flex items-center gap-3 text-sm font-medium text-[#f1f5f9] cursor-pointer select-none">
              <input
                type="radio"
                name="game-poll"
                value={opt.label}
                disabled={voted}
                checked={selected === opt.label}
                onChange={() => setSelected(opt.label)}
                className="w-[18px] h-[18px] shrink-0 rounded-full border-2 border-[#2a2d3e] bg-transparent appearance-none checked:border-[#6c63ff] checked:bg-[#6c63ff]/15 relative transition-colors disabled:cursor-not-allowed checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:rounded-full checked:after:bg-[#6c63ff] checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
              />
              {opt.label}
              <span className="ml-auto text-[11px] text-[#94a3b8] font-semibold">{opt.percent}%</span>
            </label>
            <div className="h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden ml-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] transition-[width] duration-1000 ease-out"
                style={{ width: inView ? `${opt.percent}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleVote}
        disabled={voted}
        className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
          voted
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default'
            : 'bg-transparent text-[#6c63ff] border-[#6c63ff] hover:bg-[#6c63ff] hover:text-white hover:shadow-[0_4px_16px_rgba(108,99,255,.4)]'
        }`}
      >
        {voted ? <Check className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
        {voted ? 'Vote Recorded!' : 'Vote'}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-title flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-[#94a3b8] mb-3.5 mt-9">
      {children}
      <span className="flex-1 h-px bg-[#2a2d3e]" />
    </h2>
  );
}

export default function GameCodePage({
  title,
  lastUpdated,
  activeCount,
  codes,
  howToRedeem,
  navLinks = [],
  pollQuestion,
  pollOptions,
  pollTotalVotes,
}: GameCodePageProps) {
  const activeCodes = useMemo(() => codes.filter((c) => !c.isRedeemed), [codes]);
  const checkedKey = `game-code-checked-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f1f5f9] font-sans pb-20">
      <style>{`
        .game-page-header {
          background: linear-gradient(135deg, #13152080 0%, #1a1d2790 100%);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #2a2d3e;
        }
      `}</style>

      <header className="game-page-header sticky top-0 z-50 px-5">
        <div className="max-w-[780px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 sm:h-16">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-[20px] font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#a78bfa] to-[#6c63ff]">
              {title} Codes
            </h1>
            <span className="text-[11px] text-[#94a3b8] font-medium mt-0.5">
              Last updated: {lastUpdated} &bull; {activeCount ?? activeCodes.length} active code{activeCodes.length === 1 ? '' : 's'}
            </span>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#2a2d3e] text-[#94a3b8] hover:bg-[#2a2d3e] hover:text-[#f1f5f9] hover:border-[#6c63ff] transition-colors"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[780px] mx-auto px-5 pt-8">
        <div id="how-to" className="sr-only" />

        <SectionTitle>Active Codes</SectionTitle>
        <div className="flex flex-col gap-2.5 mb-9">
          {codes.map((item, idx) => (
            <CodeCard key={`${item.code}-${idx}`} item={item} checkedKey={checkedKey} />
          ))}
        </div>

        <div id="expired" className="sr-only" />

        <SectionTitle>How to Redeem</SectionTitle>
        <div className="rounded-2xl border border-[#2a2d3e] bg-[#1a1d27] p-6 mb-9">
          <h3 className="flex items-center gap-2 text-base font-bold text-white mb-2">
            <BookOpen className="w-4 h-4 text-[#6c63ff]" />
            Redeeming Your Code
          </h3>
          <div className="text-[13px] text-[#94a3b8] leading-relaxed">{howToRedeem}</div>
        </div>

        <SectionTitle>Submit a Code</SectionTitle>
        <SubmitForm />

        <SectionTitle>Community Poll</SectionTitle>
        <Poll question={pollQuestion} options={pollOptions} totalVotes={pollTotalVotes} />
      </main>
    </div>
  );
}
