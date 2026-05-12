'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon } from 'lucide-react';

type Doc = {
  _id: string;
  _type: 'news' | 'interview' | 'guide';
  title: string;
  subtitle?: string;
  href: string;
  thumbnail: string;
  tag?: string;
};

export default function SearchClient({ documents }: { documents: Doc[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Doc[];
    return documents.filter((d) => {
      return (
        d.title.toLowerCase().includes(q) ||
        (d.subtitle || '').toLowerCase().includes(q) ||
        (d.tag || '').toLowerCase().includes(q)
      );
    });
  }, [query, documents]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const next = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
    router.replace(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 min-h-[60vh]">
      <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase mb-3 text-center text-gray-900 dark:text-white">
        Search
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-mono uppercase tracking-widest mb-10">
        Find news, interviews & guides
      </p>

      <form onSubmit={onSubmit} className="relative mb-10">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search news, interviews, guides..."
          className="w-full bg-white dark:bg-[#0E0E12] border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white px-6 pl-14 py-5 text-lg font-mono rounded-2xl focus:outline-none focus:border-blue-500 dark:focus:border-[#00E5FF]/60 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-colors shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 dark:bg-[#00E5FF] dark:hover:bg-[#00C4DD] text-white dark:text-[#0B0B0F] px-5 py-2.5 uppercase font-mono tracking-wider font-bold rounded-xl transition-colors text-sm"
        >
          Go
        </button>
      </form>

      {query.trim() === '' ? (
        <p className="text-center text-gray-500 font-mono tracking-widest uppercase text-sm">
          Enter a keyword to start searching.
        </p>
      ) : results.length === 0 ? (
        <p className="text-center text-gray-500 font-mono tracking-widest uppercase text-sm">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest mb-2">
            {results.length} result{results.length === 1 ? '' : 's'}
          </p>
          {results.map((r) => (
            <Link
              key={`${r._type}-${r._id}`}
              href={r.href}
              className="group flex gap-4 bg-white dark:bg-[#111116] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-blue-500/40 dark:hover:border-[#00E5FF]/40 transition-colors shadow-sm"
            >
              <div className="relative w-28 sm:w-40 aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                <Image src={r.thumbnail} alt={r.title} fill sizes="160px" className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-[#00E5FF] mb-2">
                  {r.tag || r._type}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-space-grotesk text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                  {r.title}
                </h3>
                {r.subtitle && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-wider line-clamp-1">
                    {r.subtitle}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
