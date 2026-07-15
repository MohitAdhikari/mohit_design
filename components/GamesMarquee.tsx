import Link from 'next/link';

/**
 * Infinite marquee of covered games / titles.
 * Each game links to a search filtered for that title.
 */
const GAMES = [
  'BGMI',
  'Valorant',
  'Free Fire',
  'Roblox',
  'Clash of Clans',
  'CS2',
  'Dota 2',
  'League of Legends',
  'Call of Duty',
  'PUBG',
  'Apex Legends',
  'Fortnite',
];

export default function GamesMarquee() {
  const loop = [...GAMES, ...GAMES];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white/60 dark:bg-[#0E0E12]/60 backdrop-blur-sm py-5">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white dark:from-[#0B0B0F] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-[#0B0B0F] to-transparent z-10" />
      <div className="animate-marquee-slow flex whitespace-nowrap items-center">
        {loop.map((g, i) => (
          <Link
            key={i}
            href={`/search?q=${encodeURIComponent(g)}`}
            className="mx-6 inline-flex items-center gap-3 text-lg md:text-2xl font-black font-space-grotesk uppercase tracking-tight text-gray-300 dark:text-gray-700 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors"
          >
            {g}
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/60" />
          </Link>
        ))}
      </div>
    </div>
  );
}
