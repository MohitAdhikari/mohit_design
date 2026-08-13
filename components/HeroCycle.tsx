'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDateCompactIST } from '@/utils/formatDate';
import { optimizedImageUrl } from '@/lib/sanityImage';

const CATEGORY_COLORS: Record<string, string> = {
  bgmi:        'bg-cyan-400',
  valorant:    'bg-red-500',
  esports:     'bg-purple-500',
  roblox:      'bg-yellow-400',
  'free fire': 'bg-orange-400',
  guides:      'bg-green-400',
  interview:   'bg-blue-400',
  default:     'bg-[#00E5FF]',
};
function getCategoryColor(tag: string) {
  const k = (tag || '').toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (k.includes(key)) return val;
  }
  return CATEGORY_COLORS.default;
}

export interface HomepageItem {
  _id: string;
  _type?: 'newsPost' | 'guide' | 'interview' | string;
  slug?: { current?: string };
  title: string;
  thumbnail: any;
  category: string;
  tags?: any[];
  publishDate?: string;
  _createdAt: string;
  featured?: boolean;
  content?: any;
  wordCount?: number;
  readMins: number | null;
  href: string;
  authorName?: string;
  excerpt?: string;
  badge?: string;
  badgeCustom?: string;
}

export default function HeroCycle({
  posts,
}: {
  posts: HomepageItem[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive(i => (i + 1) % posts.length);
  }, [posts.length]);

  useEffect(() => {
    if (paused || posts.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, posts.length]);

  const post = posts[active];
  if (!post) return null;

  const tag = post.category || post.tags?.[0]?.title || post.tags?.[0] || '';
  const dotColor = getCategoryColor(tag);

  return (
    <section
      className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800/80 shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full aspect-video overflow-hidden min-h-[200px]">
        {posts.map((p, i) => (
          <div
            key={p._id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={optimizedImageUrl(p.thumbnail, 1200)}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-top animate-kenburns will-change-transform"
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

        <Link
          href={post.href || (post.slug?.current ? `/news/${post.slug.current}` : '/news')}
          className="absolute inset-0 z-20 flex flex-col justify-end p-4 group"
        >
          <div className="flex items-center gap-2 mb-2">
            {tag && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-black/40 text-white font-mono border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                {tag}
              </span>
            )}
            {post.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#9D00FF]/30 text-[#c084fc] border border-[#9D00FF]/40 font-mono">
                ★ Featured
              </span>
            )}
          </div>
          <h1 className="text-lg font-black font-space-grotesk tracking-tight leading-[1.15] text-white line-clamp-3 mb-2 group-hover:text-[#00E5FF] transition-colors duration-300">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-[11px] text-white/90 font-mono uppercase tracking-wider">
            <span>{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
            {post.readMins != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/70" />
                <span>{post.readMins} min read</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-white/70" />
            <span className="text-[#00E5FF]">Read →</span>
          </div>
        </Link>

        {/* Dot indicators */}
        {posts.length > 1 && (
          <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setPaused(true); }}
                aria-label={`Story ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 h-1.5 bg-[#00E5FF]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
