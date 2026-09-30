import Image from 'next/image';
import Link from 'next/link';
import { getPublicNewsPosts, getInterviews, getGuides, getSiteSettings, getHomepage } from '@/lib/api';
import { getTournaments, getTournamentStatus } from '@/lib/tournamentApi';
import { optimizedImageUrl } from '@/lib/sanityImage';
import { formatDateCompactIST, formatDateDayMonthIST } from '@/utils/formatDate';
import { calculateReadingTime, calculateWordCount } from '@/lib/readingTime';
import Reveal from '@/components/Reveal';
import GamesMarquee from '@/components/GamesMarquee';
import HeroCycle, { HomepageItem } from '@/components/HeroCycle';
import {
  applyTournamentSpotlight,
  suppressMatchRecaps,
} from '@/lib/tournamentSpotlight';
import { homepageSort } from '@/lib/homepageSort';
import { getMarqueeGames } from '@/lib/gamesApi';
import { tournamentAccent } from '@/lib/tournamentColors';

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

/* ── route helper for mixed content types in homepage feeds ── */
function getItemHref(item: { _type?: string; slug?: { current?: string } }) {
  if (!item?.slug?.current) return '#';
  if (item._type === 'guide') return `/guides/${item.slug.current}`;
  if (item._type === 'interview') return '/interviews';
  return `/news/${item.slug.current}`;
}

/* ── category dot color map (mobile trending/feed) ── */
const CAT_DOT: Record<string, string> = {
  bgmi:        'bg-cyan-400',
  valorant:    'bg-red-500',
  esports:     'bg-purple-500',
  roblox:      'bg-yellow-400',
  'free fire': 'bg-orange-400',
  guides:      'bg-green-400',
  interview:   'bg-blue-400',
};
function catDot(tag: string) {
  const k = (tag || '').toLowerCase();
  for (const [key, val] of Object.entries(CAT_DOT)) {
    if (k.includes(key)) return val;
  }
  return 'bg-[#00E5FF]';
}

// "Trending Now" should never keep spotlighting a post forever — an editor's
// `trending` flag only earns priority placement for a few weeks after
// publish. Once a post ages out, fresher content automatically takes its
// spot (the flag itself is left alone in the CMS; this is purely a display
// window so editors don't have to remember to untoggle it).
const TRENDING_WINDOW_DAYS = 21;
function isWithinDays(item: { publishDate?: string; _createdAt?: string }, days: number) {
  const raw = item.publishDate || item._createdAt;
  const t = raw ? new Date(raw).getTime() : NaN;
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

// Redeem-code guides already have their own dedicated "Guides & Codes"
// sidebar rail (desktop) — so at most `max` of them are allowed inside the
// first `n` items of a feed; any extra ones are pushed later in the same
// pool (e.g. into mobile "More Stories") instead of being dropped.
function limitRedeemInFirstN<T extends { isRedeemCodes?: boolean }>(pool: T[], n: number, max: number): T[] {
  const head: T[] = [];
  const deferred: T[] = [];
  let codeCount = 0;
  for (const item of pool) {
    if (head.length >= n) {
      deferred.push(item);
      continue;
    }
    if (item.isRedeemCodes && codeCount >= max) {
      deferred.push(item);
    } else {
      head.push(item);
      if (item.isRedeemCodes) codeCount++;
    }
  }
  return [...head, ...deferred];
}

export default async function Home() {
  const [news, interviews, guides, settings, homepage, tournaments, marqueeGames] = await Promise.all([
    getPublicNewsPosts(),
    getInterviews(),
    getGuides(),
    getSiteSettings(),
    getHomepage(),
    getTournaments(),
    getMarqueeGames(),
  ]);
  const marqueeNames = marqueeGames.map((g) => g.name);

  const ongoingTournaments = tournaments
    .map((t) => ({
      ...t,
      status: getTournamentStatus(
        t.latestEdition?.startDate ?? null,
        t.latestEdition?.endDate ?? null,
        t.latestEdition?.tournamentStatus ?? null,
      ),
    }))
    .filter((t) => t.status === 'ONGOING')
    .slice(0, 3);

  const withReadTime = <T extends { wordCount?: number; content?: any }>(p: T) => {
    const wordCount = typeof p?.wordCount === 'number' ? p.wordCount : calculateWordCount(p?.content);
    return { ...p, readMins: calculateReadingTime(wordCount) };
  };

  const normalizeForHome = (item: any): HomepageItem | null => {
    if (!item) return null;
    const isGuide = item._type === 'guide';
    const isInterview = item._type === 'interview';
    const base = withReadTime(item);
    return {
      ...base,
      _id: item._id,
      _type: item._type,
      slug: item.slug,
      href: getItemHref(item),
      title: isInterview ? item.playerOrCeoName || item.title : item.title,
      category: item.category || item.gameName || item.eventName || (isGuide ? 'Guide' : isInterview ? 'Interview' : 'News'),
      authorName: item.authorName || item.author?.name || 'PHONEOCEAN',
      featured: item.featured === true,
      badge: item.badge || 'None',
      badgeCustom: item.badgeCustom || '',
      excerpt: item.excerpt || '',
      publishDate: item.publishDate || item._createdAt,
      readMins: isInterview ? null : base.readMins,
      isRedeemCodes: Boolean(item.isRedeemCodes),
      homepagePlacement: item.homepagePlacement || 'auto',
    };
  };

  // Combined homepage content pool: news already respects showOnHomepage.
  // Tournament match/standings updates get rotated so only the freshest one
  // per tournament is ever eligible for the feed (see applyTournamentSpotlight).
  const spotlightedNews = applyTournamentSpotlight(news);
  const suppressedNews = suppressMatchRecaps(spotlightedNews);
  const homepageContentRaw = [
    ...suppressedNews.map(normalizeForHome),
    ...guides
      .filter((g: any) => g.showOnHomepage !== false)
      .map(normalizeForHome),
    ...interviews
      .filter((i: any) => i.showOnHomepage !== false)
      .map(normalizeForHome),
  ]
    .filter((p): p is HomepageItem => Boolean(p));

  const homepageContent: HomepageItem[] = homepageSort(homepageContentRaw as any[]) as HomepageItem[];

  const useAutoLayout = homepage.useAutoLayout !== false;

  // Editors can flag any article, guide/code or interview as "Featured" /
  // "Trending" to bump it ahead of pure recency in the automatic hero /
  // trending pools, without needing to touch the Homepage Manager.
  const prioritize = (pool: HomepageItem[], flag: 'featured' | 'trending'): HomepageItem[] => {
    // "trending" boosts expire after TRENDING_WINDOW_DAYS so an old post
    // doesn't camp the Trending Now slot indefinitely; "featured" (hero) has
    // no such window since editors actively swap it out per-story.
    const isBoosted = (p: HomepageItem) =>
      (p as any)[flag] === true && (flag !== 'trending' || isWithinDays(p, TRENDING_WINDOW_DAYS));
    return [
      ...pool.filter(isBoosted),
      ...pool.filter((p) => !isBoosted(p)),
    ];
  };

  /* ── HERO: manual array or legacy single ref, otherwise auto fallback ── */
  const rawManualHero = !useAutoLayout
    ? (homepage.heroArticles?.length
        ? homepage.heroArticles
        : homepage.heroArticle
          ? [homepage.heroArticle]
          : [])
    : [];

  const heroManual: HomepageItem[] = rawManualHero
    .map(normalizeForHome)
    .filter((p): p is HomepageItem => Boolean(p));

  // Per-post "Homepage Placement" override: articles explicitly pinned to
  // Hero jump the queue; anything set to "Feed only" is never eligible here.
  const heroCandidates = homepageContent.filter((p) => p.homepagePlacement !== 'feed');
  const heroAuto: HomepageItem[] = homepage.heroArticle
    ? [
        normalizeForHome(homepage.heroArticle),
        ...homepageContent.filter((p) => p._id !== homepage.heroArticle._id).slice(0, 2),
      ].filter((p): p is HomepageItem => Boolean(p))
    : [
        ...heroCandidates.filter((p) => p.homepagePlacement === 'hero'),
        ...prioritize(heroCandidates.filter((p) => p.homepagePlacement !== 'hero'), 'featured'),
      ].slice(0, 3);

  const heroPool: HomepageItem[] = (heroManual.length ? heroManual : heroAuto).slice(0, 3);

  const featured = heroPool[0] || null;

  // De-dupe: track every article ID already placed in a section so a single
  // post never repeats across hero / trending / feed sections.
  const usedIds = new Set<string>();
  if (featured?._id) usedIds.add(featured._id);

  /* ── TRENDING: manual list when auto is OFF, otherwise auto fallback after hero ── */
  const rawTrendingManual = !useAutoLayout ? (homepage.trendingArticles || []) : [];
  const trendingManual: HomepageItem[] = rawTrendingManual
    .map(normalizeForHome)
    .filter((p): p is HomepageItem => Boolean(p))
    .filter((p) => !usedIds.has(p._id));

  const trendingCandidates = homepageContent.filter((p) => !usedIds.has(p._id) && p.homepagePlacement !== 'feed');
  const trendingAuto: HomepageItem[] = [
    ...trendingCandidates.filter((p) => p.homepagePlacement === 'trending'),
    ...prioritize(trendingCandidates.filter((p) => p.homepagePlacement !== 'trending'), 'trending'),
  ];

  const trendingPool: HomepageItem[] = (trendingManual.length ? trendingManual : trendingAuto).slice(0, 3);
  const latestNews: HomepageItem[] = trendingPool.slice(0, 3);
  latestNews.forEach((p) => usedIds.add(p._id));

  /* ── FEED: manual list when auto is OFF, otherwise auto fallback after hero+trending ── */
  const rawFeedManual = !useAutoLayout ? (homepage.feedArticles || []) : [];
  const feedManual: HomepageItem[] = rawFeedManual
    .map(normalizeForHome)
    .filter((p): p is HomepageItem => Boolean(p))
    .filter((p) => !usedIds.has(p._id));

  const feedAuto: HomepageItem[] = homepageContent.filter((p) => !usedIds.has(p._id));
  // Redeem-code guides already live in the "Guides & Codes" sidebar rail —
  // never duplicate them into the desktop Latest Feed.
  const feedNews: HomepageItem[] = (feedManual.length ? feedManual : feedAuto).filter((p) => !p.isRedeemCodes);
  // Desktop "More Stories": the next batch after the 3-story Latest Feed, so
  // the homepage never looks sparse between Latest Feed and Interviews and
  // nothing already shown above gets repeated.
  const moreStories: HomepageItem[] = feedNews.slice(3, 9);

  /* ── mobile-only pools: distinct from desktop trending/feed ── */
  const heroIds = new Set(heroPool.map((p) => p._id));
  const mobileUsedIds = new Set([...usedIds, ...heroIds]);
  const mobileTrending: HomepageItem[] = homepageContent
    .filter((p) => !mobileUsedIds.has(p._id))
    .slice(0, 6);
  mobileTrending.forEach((p) => mobileUsedIds.add(p._id));
  // At most one redeem-code article in the mobile feed proper — extras are
  // pushed down into "More Stories" instead of stacking the feed with codes.
  const mobileFeed: HomepageItem[] = limitRedeemInFirstN(
    homepageContent.filter((p) => !mobileUsedIds.has(p._id)),
    8,
    1,
  );

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

      {/* ╔═══════════════════════════════════════╗
          ║  MOBILE LAYOUT — hidden on lg+        ║
          ╚═══════════════════════════════════════╝ */}
      <div className="flex flex-col gap-5 lg:hidden">

        {heroPool.length > 0 && (
          <Reveal initial>
            <HeroCycle posts={heroPool} />
          </Reveal>
        )}

        {mobileTrending.length > 0 && (
          <Reveal initial>
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-xs font-black font-space-grotesk uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#00E5FF] inline-block" />
                  Trending
                </h2>
                <Link href="/news" className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] hover:underline">
                  See all →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1 -mx-3 px-3">
                {mobileTrending.map((post, i: number) => {
                  const tag = post.category || post.tags?.[0]?.title || post.tags?.[0] || '';
                  return (
                    <Link
                      key={post._id || i}
                      href={post.href}
                      className="group flex-none w-[136px] snap-start"
                    >
                      <div className="relative w-full h-[86px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800/60">
                        <Image
                          src={optimizedImageUrl(post.thumbnail, 400)}
                          alt={post.title}
                          fill
                          sizes="140px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          loading={i < 3 ? 'eager' : 'lazy'}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {tag && (
                          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/50 text-white font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${catDot(tag)}`} />
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[11px] font-bold font-space-grotesk text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-[#00E5FF] transition-colors">
                        {post.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </Reveal>
        )}

        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-black font-space-grotesk uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#9D00FF] inline-block" />
              Latest News
            </h2>
            <Link href="/news" className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] hover:underline">
              All news →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-800/60 overflow-hidden bg-white dark:bg-[#111116]">
            {mobileFeed.slice(0, 8).map((post, i: number) => {
              const tag = post.category || post.tags?.[0]?.title || post.tags?.[0] || '';
              const dot = catDot(tag);
              return (
                <Reveal key={post._id || i} delay={i * 40} initial={i < 2}>
                  <Link
                    href={post.href}
                    className="group flex flex-row items-start gap-2.5 p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="flex-none w-5 text-[10px] font-black font-mono text-[#00E5FF] mt-1 select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative flex-none w-[88px] h-[66px] rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800/60">
                      <Image
                        src={optimizedImageUrl(post.thumbnail, 400)}
                        alt={post.title}
                        fill
                        sizes="88px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-1 left-1 w-2 h-2 rounded-full ${dot} shadow-sm`} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {tag && (
                        <span className="inline-flex items-center gap-1 w-fit text-[9px] font-bold uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                          {tag}
                        </span>
                      )}
                      <h3 className="text-sm font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 group-hover:text-[#00E5FF] transition-colors line-clamp-3">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 font-mono uppercase tracking-wider mt-auto">
                        <span>{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
                        {post.readMins != null && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span>{post.readMins} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        <Reveal initial><GamesMarquee games={marqueeNames} /></Reveal>

        {mobileFeed.length > 8 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-black font-space-grotesk uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gray-400 dark:bg-gray-600 inline-block" />
                More Stories
              </h2>
            </div>
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-800/60 overflow-hidden bg-white dark:bg-[#111116]">
              {mobileFeed.slice(8, 16).map((post, i: number) => {
                const tag = post.category || post.tags?.[0]?.title || post.tags?.[0] || '';
                const dot = catDot(tag);
                return (
                  <Reveal key={post._id || i} delay={i * 40}>
                    <Link
                      href={post.href}
                      className="group flex flex-row items-start gap-2.5 p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="flex-none w-5 text-[10px] font-black font-mono text-gray-300 dark:text-gray-600 mt-1 select-none">
                        {String(i + 9).padStart(2, '0')}
                      </span>
                      <div className="relative flex-none w-[88px] h-[66px] rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800/60">
                        <Image
                          src={optimizedImageUrl(post.thumbnail, 400)}
                          alt={post.title}
                          fill
                          sizes="88px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-1 left-1 w-2 h-2 rounded-full ${dot} shadow-sm`} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        {tag && (
                          <span className="inline-flex items-center gap-1 w-fit text-[9px] font-bold uppercase tracking-wider font-mono text-gray-500 dark:text-gray-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                            {tag}
                          </span>
                        )}
                        <h3 className="text-sm font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 group-hover:text-[#00E5FF] transition-colors line-clamp-3">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 font-mono uppercase tracking-wider mt-auto">
                          <span>{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
                          {post.readMins != null && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                              <span>{post.readMins} min read</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold font-space-grotesk text-gray-700 dark:text-gray-300 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all"
              >
                Load more →
              </Link>
            </div>
          </section>
        )}

      </div>
      {/* ── END MOBILE LAYOUT ── */}

      {/* ╔═══════════════════════════════════════╗
          ║  DESKTOP LAYOUT — hidden on mobile    ║
          ╚═══════════════════════════════════════╝ */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_350px] gap-x-8 xl:gap-x-12 items-start">

        {/* ═══════════════════════════════════════
            LEFT COLUMN
        ═══════════════════════════════════════ */}
        <div className="min-w-0 flex flex-col gap-8">

          {/* ── HERO (3-slide auto-cycling, same pool as mobile) ── */}
          {heroPool.length > 0 && (
            <HeroCycle posts={heroPool} variant="large" />
          )}

          {/* ── GAMES MARQUEE ── */}
          <GamesMarquee games={marqueeNames} />

          {/* ── LATEST FEED ── */}
          <Reveal as="section" className="space-y-5" initial>
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                  Latest Feed
                </h2>
              </div>
              <Link href="/news" className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#00E5FF] transition-colors min-h-[44px] flex items-center">
                View All →
              </Link>
            </div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800/60" />

            <div className="flex flex-col gap-4">
              {feedNews.slice(0, 3).map((post) => (
                <Link
                  href={post.href}
                  key={post._id}
                  className="group flex flex-row gap-3 sm:gap-5 bg-white dark:bg-[#111116] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800/50 hover:border-[#00E5FF]/30 dark:hover:border-[#00E5FF]/20 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                >
                  <div className="relative w-[88px] h-[66px] sm:w-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/60">
                    <Image
                      src={optimizedImageUrl(post.thumbnail, 800)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 88px, 200px"
                      loading="lazy"
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-[#00E5FF] text-[#0B0B0F] text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded sm:hidden">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2 py-0.5 flex-1 min-w-0">
                    <span className="hidden sm:inline-block text-[10px] text-[#00E5FF] font-black tracking-[0.2em] uppercase">
                      {post.category}
                    </span>
                    <h3 className="text-sm sm:text-lg font-bold font-space-grotesk leading-snug group-hover:text-[#00E5FF] dark:group-hover:text-white text-gray-900 dark:text-gray-100 transition-colors duration-300 line-clamp-3 sm:line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2 mt-auto">
                      <span>{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span>By {post.authorName || 'PHONEOCEAN'}</span>
                      {post.readMins != null && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span>{post.readMins} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/news"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-transparent hover:bg-gray-50 dark:hover:bg-[#1A1A22] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl font-mono tracking-widest uppercase text-[10px] transition-all duration-300 border border-gray-200 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 min-h-[48px]"
            >
              Load More News <span className="text-sm">↓</span>
            </Link>
          </Reveal>

          {/* ── MORE STORIES ── */}
          {moreStories.length > 0 && (
            <Reveal as="section" className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-gray-400 dark:bg-gray-600" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                    More Stories
                  </h2>
                </div>
                <Link href="/news" className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#00E5FF] transition-colors min-h-[44px] flex items-center">
                  View All →
                </Link>
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-gray-800/60" />

              <div className="grid grid-cols-2 gap-4">
                {moreStories.map((post) => (
                  <Link
                    href={post.href}
                    key={post._id}
                    className="group flex flex-col bg-white dark:bg-[#111116] rounded-xl border border-gray-200 dark:border-gray-800/50 overflow-hidden hover:border-[#00E5FF]/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={optimizedImageUrl(post.thumbnail, 500)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 p-3">
                      <span className="text-[9px] text-[#00E5FF] font-black tracking-[0.2em] uppercase">
                        {post.category}
                      </span>
                      <h3 className="text-[13px] font-bold font-space-grotesk leading-snug text-gray-900 dark:text-gray-100 group-hover:text-[#00E5FF] transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      <span className="text-[10px] text-gray-500 dark:text-gray-500 font-mono uppercase tracking-wider">
                        {formatDateCompactIST(post.publishDate || post._createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {/* ── INTERVIEWS ── */}
          <Reveal as="section" className="space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-[#9D00FF] shadow-[0_0_10px_rgba(157,0,255,0.6)]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                  Interviews
                </h2>
              </div>
              <Link href="/interviews" className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#9D00FF] transition-colors min-h-[44px] flex items-center">
                View All →
              </Link>
            </div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800/60" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {interviews.filter((i: any) => i.showOnHomepage !== false).slice(0, 4).map((interview) => (
                <Link
                  href="/interviews"
                  key={interview._id}
                  className="group flex flex-col bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-[#9D00FF]/30 dark:hover:border-[#9D00FF]/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={optimizedImageUrl(interview.thumbnail, 700)}
                      alt={interview.thumbnailAlt || `Interview with ${interview.playerOrCeoName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#9D00FF] text-white text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-[0.15em] shadow-md">
                        INTERVIEW
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <span className="text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-widest font-mono line-clamp-1">
                      {interview.eventName}
                    </span>
                    <h3 className="text-base font-bold font-space-grotesk leading-snug group-hover:text-[#9D00FF] dark:group-hover:text-white text-gray-900 dark:text-gray-100 transition-colors duration-300 line-clamp-2 flex-1">
                      Exclusive with {interview.playerOrCeoName}
                    </h3>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center mt-auto">
                      <span className="text-gray-600 dark:text-gray-400 text-[10px] font-mono tracking-wider uppercase">
                        {formatDateDayMonthIST(interview.publishDate || interview._createdAt)}
                      </span>
                      <span className="text-[#9D00FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                        Watch <span className="text-sm">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>

        </div>

        {/* ═══════════════════════════════════════
            RIGHT COLUMN
        ═══════════════════════════════════════ */}
        <div className="min-w-0 flex flex-col gap-6 self-start lg:sticky lg:top-24">

          {/* ── ONGOING TOURNAMENTS ── */}
          {ongoingTournaments.length > 0 && (
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                    Ongoing Tournaments
                  </h2>
                </div>
                <Link href="/esports" className="text-[9px] font-mono uppercase tracking-widest text-gray-400 hover:text-green-400 transition-colors min-h-[44px] flex items-center">
                  All →
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/40">
                {ongoingTournaments.map((t) => (
                  <Link
                    key={t._id}
                    href={t.slug?.current ? `/esports/${t.slug.current}` : '/esports'}
                    className="group relative flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#13131A] transition-colors duration-200"
                  >
                    <span className="absolute inset-y-0 left-0 w-1" style={{ background: tournamentAccent(t.name, t.accentColor) }} />
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/50 bg-gray-100 dark:bg-[#13131A] flex items-center justify-center">
                      {t.logoUrl ? (
                        <Image src={t.logoUrl} alt={t.name} fill sizes="48px" className="object-contain p-1" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-sm font-black text-gray-300 dark:text-gray-700">{t.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-green-500 font-black tracking-[0.2em] uppercase block mb-0.5">Live now</span>
                      <h4 className="text-[13px] font-bold font-space-grotesk text-gray-800 dark:text-gray-200 group-hover:text-green-500 dark:group-hover:text-white transition-colors duration-200 line-clamp-1">
                        {t.name}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── TRENDING NOW ── */}
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-white">
                  Trending Now
                </h2>
              </div>
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-[#00E5FF]/60" />
                <span className="w-1 h-1 rounded-full bg-[#00E5FF]/30" />
              </div>
            </div>

            {/* Desktop list */}
            <div className="hidden lg:flex lg:flex-col divide-y divide-gray-100 dark:divide-gray-800/40">
              {latestNews.map((post, index) => (
                <Link
                  href={post.href}
                  key={post._id}
                  className="group flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-[#13131A] transition-colors duration-200"
                >
                  <span className="text-[#00E5FF] text-[10px] font-black font-mono tracking-widest mt-0.5 flex-shrink-0 w-4">
                    0{index + 1}
                  </span>
                  <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/50">
                    <Image
                      src={optimizedImageUrl(post.thumbnail, 320)}
                      alt={post.title}
                      fill
                      sizes="80px"
                      loading="eager"
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <h3 className="text-[13px] font-bold font-sans text-gray-800 dark:text-gray-100 leading-snug group-hover:text-[#00E5FF] transition-colors duration-200 line-clamp-3">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-600 dark:text-gray-400 font-mono uppercase tracking-wider">{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className="text-[9px] text-gray-600 dark:text-gray-400 font-mono">{formatDateDayMonthIST(post.publishDate || post._createdAt)}</span>
                      {post.readMins != null && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span className="text-[9px] text-gray-600 dark:text-gray-400 font-mono">{post.readMins} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto gap-4 p-4 snap-x snap-mandatory hide-scrollbar">
              {latestNews.map((post, index) => (
                <Link
                  href={post.href}
                  key={post._id}
                  className="snap-start group flex flex-col min-w-[260px] bg-gray-50 dark:bg-[#13131A] rounded-xl border border-gray-200 dark:border-gray-800/40 p-3 flex-shrink-0"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-gray-200 dark:border-gray-800/40">
                    <Image src={optimizedImageUrl(post.thumbnail, 640)} alt={post.title} fill sizes="260px" loading="lazy" className="object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[9px] px-2 py-0.5 font-mono text-[#00E5FF] rounded uppercase tracking-widest">0{index + 1}</div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-[#00E5FF] transition-colors">{post.title}</h3>
                  <div className="mt-2 text-[9px] text-gray-400 font-mono uppercase tracking-wider">{post.category}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── GUIDES & CODES ── */}
          <Reveal as="section" className="rounded-2xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] overflow-hidden shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_6px_rgba(0,255,102,0.8)]" />
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-gray-900 dark:text-[#00FF66]">
                  Guides & Codes
                </h2>
              </div>
              <Link
                href="/guides"
                className="text-[9px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#00FF66] transition-colors min-h-[44px] flex items-center"
              >
                More →
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/40">
              {guides.filter((guide: any) => guide.showOnHomepage !== false).map((guide) => (
                <Link
                  href={`/guides/${guide.slug.current}`}
                  key={guide._id}
                  className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#13131A] transition-colors duration-200"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/50">
                    <Image
                      src={optimizedImageUrl(guide.thumbnail, 300)}
                      alt={guide.thumbnailAlt || guide.title}
                      fill
                      sizes="64px"
                      loading="lazy"
                      className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-[#00FF66] font-black tracking-[0.2em] uppercase block mb-1">
                      {guide.gameName}
                    </span>
                    <h4 className="text-[13px] font-bold font-space-grotesk text-gray-800 dark:text-gray-200 group-hover:text-[#00FF66] dark:group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
                      {guide.title}
                    </h4>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600 group-hover:text-[#00FF66] transition-colors text-sm flex-shrink-0">→</span>
                </Link>
              ))}
            </div>
          </Reveal>

          {/* ── DISCORD / COMMUNITY ── */}
          {settings.discordUrl && (
            <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-[#5865F2]/30 dark:border-[#5865F2]/20 bg-gradient-to-br from-[#5865F2]/10 via-[#5865F2]/5 to-transparent dark:from-[#5865F2]/10 dark:via-transparent dark:to-transparent shadow-sm">
              {/* Subtle bg glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#5865F2]/20 blur-3xl pointer-events-none" />

              <div className="relative p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {/* Discord icon */}
                  <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400">Community</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Join our Discord</div>
                  </div>
                </div>

                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Connect with thousands of gamers. Get instant alerts, live scores and exclusive drops.
                </p>

                <a
                  href={settings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                  Join Discord
                </a>
              </div>
            </div>
          )}

        </div>
        {/* ── END RIGHT COLUMN ── */}

      </div>
      {/* ── END DESKTOP LAYOUT ── */}

    </div>
  );
}
