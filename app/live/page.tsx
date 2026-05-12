export const metadata = {
  title: 'Live Hub | PHONEOCEAN',
  description: '24/7 Esports coverage, daily shows, and tournament streams on PHONEOCEAN TV.',
};

const schedule = [
  { label: 'Daily Scrims', time: '14:00 EST', accent: 'text-blue-600 dark:text-[#00E5FF]' },
  { label: 'Podcast', time: 'Wed 18:00 EST', accent: 'text-blue-600 dark:text-[#00E5FF]' },
  { label: 'Tournament', time: 'TBA', accent: 'text-gray-400 dark:text-gray-600' },
];

export default function LivePage() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div className="mb-10 md:mb-12 border-b border-gray-300 dark:border-gray-800/50 pb-6 flex items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase text-gray-900 dark:text-white">Live Hub</h1>
        <span className="relative inline-flex w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          <span className="relative rounded-full w-3 h-3 bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] p-4 md:p-5 h-fit shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0B0B0F] dark:to-[#15151C] flex items-center justify-center">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_60%)]" />
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-mono uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Offline
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-mono tracking-widest uppercase text-sm">Stream is offline</p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Check back during the next scheduled slot.</p>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-bold font-space-grotesk text-gray-900 dark:text-white">PHONEOCEAN TV</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm">24/7 Esports coverage and daily shows.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] p-6 h-fit shadow-sm">
          <h3 className="text-sm font-bold font-mono uppercase tracking-[0.2em] border-b border-gray-200 dark:border-gray-800/60 pb-4 mb-4 text-gray-900 dark:text-white">
            Stream Schedule
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            {schedule.map((s) => (
              <li
                key={s.label}
                className="flex justify-between items-center bg-gray-50 dark:bg-[#15151C] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800/50"
              >
                <span className="text-gray-700 dark:text-gray-300">{s.label}</span>
                <span className={s.accent}>{s.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
