'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = { label: string; value: number; suffix?: string; accent: string };

const STATS: Stat[] = [
  { label: 'Monthly Readers', value: 1, suffix: 'K+', accent: 'text-blue-600 dark:text-[#00E5FF]' },
  { label: 'Stories Published', value: 100, suffix: '+', accent: 'text-purple-600 dark:text-[#9D00FF]' },
  { label: 'Exclusive Interviews', value: 50, suffix: '+', accent: 'text-green-600 dark:text-[#00FF66]' },
  { label: 'Events Covered', value: 20, suffix: '+', accent: 'text-red-500 dark:text-red-400' },
];

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return n;
}

function StatCard({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div className="relative text-center px-4 py-6">
      <div className={`text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter ${stat.accent}`}>
        {n.toLocaleString()}
        <span>{stat.suffix}</span>
      </div>
      <div className="mt-2 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
        {stat.label}
      </div>
    </div>
  );
}

export default function StatsBand() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white/70 dark:bg-[#0E0E12]/70 backdrop-blur-sm overflow-hidden shadow-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,229,255,0.05),transparent_35%,transparent_65%,rgba(157,0,255,0.05))]" />
      <div className="relative grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 dark:divide-gray-800/60">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} run={run} />
        ))}
      </div>
    </div>
  );
}
