import React from 'react';

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  accent?: 'cyan' | 'purple' | 'green' | 'red';
  meta?: React.ReactNode;
};

const accents: Record<NonNullable<Props['accent']>, { dot: string; glow: string; bar: string }> = {
  cyan: { dot: 'bg-[#00E5FF]', glow: 'shadow-[0_0_10px_rgba(0,229,255,0.8)]', bar: 'bg-[#00E5FF]' },
  purple: { dot: 'bg-[#9D00FF]', glow: 'shadow-[0_0_10px_rgba(157,0,255,0.8)]', bar: 'bg-[#9D00FF]' },
  green: { dot: 'bg-[#00FF66]', glow: 'shadow-[0_0_10px_rgba(0,255,102,0.8)]', bar: 'bg-[#00FF66]' },
  red: { dot: 'bg-red-500', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.8)]', bar: 'bg-red-500' },
};

export default function PageHeader({ eyebrow, title, description, accent = 'cyan', meta }: Props) {
  const a = accents[accent];
  return (
    <header className="mb-10 md:mb-12 border-b border-gray-200 dark:border-gray-800/50 pb-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${a.dot} ${a.glow}`} />
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-gray-600 dark:text-gray-400">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-space-grotesk tracking-tighter uppercase text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 font-sans max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {meta && <div className="md:text-right">{meta}</div>}
      </div>
      <div className={`mt-6 h-px w-24 ${a.bar} opacity-60`} />
    </header>
  );
}
