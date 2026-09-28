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
  isRedeemCodes?: boolean;
  homepagePlacement?: 'auto' | 'hero' | 'trending' | 'feed' | string;
}

/**
 * Auto-cycling hero slider. Used both on mobile (compact, aspect-video) and
 * desktop (large, fixed-height with richer overlay content) so the same 3
 * curated/auto-selected slides are always in sync across breakpoints.
 */
export default function HeroCycle({
  posts,
  variant = 'compact',
}: {
  posts: HomepageItem[];
  variant?: 'compact' | 'large';
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
  const isLarge = variant === 'large';

  return (
    <section
      className={`relative rounded-2xl overflow-hidden group border border-gray-200 dark:border-gray-800/80 shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full ${
        isLarge ? 'h-[440px] md:h-[540px]' : ''
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow halo on hover (desktop hero only) */}
      {isLarge && (
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/20 to-[#9D00FF]/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
      )}

      <div className={`relative w-full overflow-hidden ${isLarge ? 'h-full' : 'aspect-video min-h-[200px]'}`}>
        {posts.map((p, i) => (
          <div
            key={p._id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={optimizedImageUrl(p.thumbnail, isLarge ? 1600 : 1200)}
              alt={p.title}
              fill
              sizes={isLarge ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 1200px'}
              className={`object-cover ${isLarge ? 'object-top' : 'object-top'} animate-kenburns will-change-transform`}
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {isLarge ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_0%_100%,rgba(0,229,255,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

            <Link href={post.href || (post.slug?.current ? `/news/${post.slug.current}` : '/news')} className="sheen-parent absolute inset-0 z-20 block">
              {post.featured && (
                <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest shadow-lg">
                  <span className="relative inline-flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-[#00E5FF] animate-ping opacity-75" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  </span>
                  Featured
                </div>
              )}

              <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 w-full animate-rise">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {tag && (
                    <span className="inline-block bg-[#00E5FF] text-[#0B0B0F] text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1 rounded-sm shadow-sm">
                      {tag}
                    </span>
                  )}
                  {post.badge && post.badge !== 'None' && (
                    <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm border border-white/10">
                      {post.badge === 'CUSTOM' ? post.badgeCustom : post.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl md:text-[2.6rem] font-black font-space-grotesk tracking-tighter leading-[1.1] mb-3 sm:mb-5 text-white">
                  <span className="bg-gradient-to-r from-white to-white group-hover:from-white group-hover:to-[#00E5FF] bg-clip-text text-transparent transition-all duration-500">
                    {post.title}
                  </span>
                </h1>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#0055FF] border-2 border-white/20 flex-shrink-0" />
                  <span className="font-semibold text-white text-xs">{post.authorName || 'PHONEOCEAN'}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/50 text-xs font-mono">{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-white/60 group-hover:text-[#00E5FF] transition-colors duration-300">
                    Read <span className="text-sm">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}

        {/* Dot indicators */}
        {posts.length > 1 && (
          <div className={`absolute z-30 flex items-center gap-1.5 ${isLarge ? 'bottom-5 right-5 md:right-8' : 'bottom-3 right-3'}`}>
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
