import Link from 'next/link';

type Item = { title: string; href: string };

export default function BreakingTicker({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  // Duplicate items for seamless marquee loop
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-gray-200 dark:border-gray-800/60 bg-white/60 dark:bg-[#0E0E12]/60 backdrop-blur-sm">
      <div className="max-w-[1300px] mx-auto flex items-stretch">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-r border-gray-200 dark:border-gray-800/60 flex-shrink-0">
          <span className="relative inline-flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-red-600" />
          </span>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 font-mono">
            Breaking
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap py-2">
            {loop.map((it, i) => (
              <Link
                key={i}
                href={it.href}
                className="inline-flex items-center gap-3 px-6 text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#00E5FF] transition-colors"
              >
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="truncate max-w-[60ch]">{it.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
