'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { optimizedImageUrl } from '@/lib/sanityImage';
import { formatDateCompactIST } from '@/utils/formatDate';

interface RelatedTag {
  _id: string;
  title: string;
  slug: string;
}

interface RelatedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishDate?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  tags?: RelatedTag[];
}

export default function EsportsRelatedNews({ articles }: { articles: RelatedArticle[] }) {
  const filters = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
      (a.tags || []).forEach((t) => set.add(t.title));
    });
    return Array.from(set).sort();
  }, [articles]);

  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selected) return articles;
    return articles.filter(
      (a) => a.category === selected || (a.tags || []).some((t) => t.title === selected)
    );
  }, [articles, selected]);

  if (articles.length === 0) return null;

  return (
    <section className="mt-16 md:mt-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-gray-500 dark:text-gray-500">
            Related Coverage
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mt-1">
            Esports News
          </h2>
        </div>

        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelected(null)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold transition-all border ${
                selected === null
                  ? 'bg-blue-600 dark:bg-[#00E5FF] text-white dark:text-[#0B0B0F] border-blue-600 dark:border-[#00E5FF]'
                  : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              All
            </button>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setSelected(f)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold transition-all border ${
                  selected === f
                    ? 'bg-blue-600 dark:bg-[#00E5FF] text-white dark:text-[#0B0B0F] border-blue-600 dark:border-[#00E5FF]'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest text-xs">
          No articles for this filter yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.slice(0, 8).map((article) => (
            <Link
              key={article._id}
              href={`/news/${article.slug.current}`}
              className="group flex flex-col bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/50 rounded-xl overflow-hidden hover:border-blue-400/40 dark:hover:border-[#00E5FF]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={optimizedImageUrl(article.thumbnail, 500)}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {article.category && (
                  <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 text-white">
                    {article.category}
                  </span>
                )}
              </div>
              <div className="p-3.5 flex-1 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.publishDate && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-500 font-mono mt-auto">
                    {formatDateCompactIST(article.publishDate)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
