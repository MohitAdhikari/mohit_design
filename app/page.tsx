import Image from 'next/image';
import Link from 'next/link';
import { getNewsPosts, getInterviews, getGuides, getSiteSettings, getHomepage } from '@/lib/api';
import { optimizedImageUrl } from '@/lib/sanityImage';
import { formatDateCompactIST, formatDateDayMonthIST } from '@/utils/formatDate';
import Reveal from '@/components/Reveal';
import GamesMarquee from '@/components/GamesMarquee';

export const revalidate = 60;

export default async function Home() {
  const [news, interviews, guides, settings, homepage] = await Promise.all([
    getNewsPosts(),
    getInterviews(),
    getGuides(),
    getSiteSettings(),
    getHomepage(),
  ]);

  const featured = homepage.heroArticle || news[0];
  const showFeaturedBadge = featured?.featured === true;
  const latestNews = homepage.trendingArticles.length
    ? homepage.trendingArticles.slice(0, 3)
    : news.slice(1, 4);
  const feedNews = news.length > 3 ? news.slice(1) : news;

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-x-8 xl:gap-x-12 items-start">

        {/* ═══════════════════════════════════════
            LEFT COLUMN
        ═══════════════════════════════════════ */}
        <div className="min-w-0 flex flex-col gap-8">

          {/* ── HERO ── */}
          {featured && (
            <section className="relative rounded-2xl overflow-hidden group h-[440px] md:h-[540px] border border-gray-200 dark:border-gray-800/80 shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] w-full">
              {/* Glow halo on hover */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-[#00E5FF]/0 via-[#00E5FF]/20 to-[#9D00FF]/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />

              <Link href={`/news/${featured.slug.current}`} className="sheen-parent block relative w-full h-full">
                {/* Background image */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={optimizedImageUrl(featured.thumbnail, 1600)}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover object-top opacity-90 animate-kenburns will-change-transform group-hover:opacity-100 transition-opacity duration-700"
                    priority
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_0%_100%,rgba(0,229,255,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Featured badge */}
                {showFeaturedBadge && (
                  <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest shadow-lg">
                    <span className="relative inline-flex w-1.5 h-1.5">
                      <span className="absolute inset-0 rounded-full bg-[#00E5FF] animate-ping opacity-75" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                    </span>
                    Featured
                  </div>
                )}

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full lg:w-[90%] animate-rise">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block bg-[#00E5FF] text-[#0B0B0F] text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1 rounded-sm shadow-sm">
                      {featured.category}
                    </span>
                    {featured.badge && featured.badge !== 'None' && (
                      <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm border border-white/10">
                        {featured.badge === 'CUSTOM' ? featured.badgeCustom : featured.badge}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-[2.6rem] font-black font-space-grotesk tracking-tighter leading-[1.1] mb-5 text-white">
                    <span className="bg-gradient-to-r from-white to-white group-hover:from-white group-hover:to-[#00E5FF] bg-clip-text text-transparent transition-all duration-500">
                      {featured.title}
                    </span>
                  </h1>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#0055FF] border-2 border-white/20 flex-shrink-0" />
                    <span className="font-semibold text-white text-xs">{featured.authorName || 'PHONEOCEAN'}</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/50 text-xs font-mono">{formatDateCompactIST(featured.publishDate || featured._createdAt)}</span>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-white/60 group-hover:text-[#00E5FF] transition-colors duration-300">
                      Read <span className="text-sm">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* ── GAMES MARQUEE ── */}
          <GamesMarquee />

          {/* ── LATEST FEED ── */}
          <Reveal as="section" className="space-y-5">
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
                  href={`/news/${post.slug.current}`}
                  key={post._id}
                  className="group flex flex-col sm:flex-row gap-4 sm:gap-5 bg-white dark:bg-[#111116] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/50 hover:border-[#00E5FF]/30 dark:hover:border-[#00E5FF]/20 transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video sm:w-48 sm:aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800/60">
                    <Image
                      src={optimizedImageUrl(post.thumbnail, 800)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 200px"
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
                    <h3 className="text-base sm:text-lg font-bold font-space-grotesk leading-snug group-hover:text-[#00E5FF] dark:group-hover:text-white text-gray-900 dark:text-gray-100 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2 mt-auto">
                      <span>{formatDateCompactIST(post.publishDate || post._createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span>By {post.authorName || 'PHONEOCEAN'}</span>
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
              {interviews.slice(0, 4).map((interview) => (
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
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-mono line-clamp-1">
                      {interview.eventName}
                    </span>
                    <h3 className="text-base font-bold font-space-grotesk leading-snug group-hover:text-[#9D00FF] dark:group-hover:text-white text-gray-900 dark:text-gray-100 transition-colors duration-300 line-clamp-2 flex-1">
                      Exclusive with {interview.playerOrCeoName}
                    </h3>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center mt-auto">
                      <span className="text-gray-400 dark:text-gray-500 text-[10px] font-mono tracking-wider uppercase">
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
                  href={`/news/${post.slug.current}`}
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
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider">{post.category}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">{formatDateDayMonthIST(post.publishDate || post._createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto gap-4 p-4 snap-x snap-mandatory hide-scrollbar">
              {latestNews.map((post, index) => (
                <Link
                  href={`/news/${post.slug.current}`}
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
              {guides.map((guide) => (
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
                    <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Community</div>
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
    </div>
  );
}
