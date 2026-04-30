import Image from 'next/image';
import Link from 'next/link';
import { getNewsPosts, getInterviews, getGuides } from '@/lib/api';
import { format } from 'date-fns';

export default async function Home() {
  const [news, interviews, guides] = await Promise.all([
    getNewsPosts(),
    getInterviews(),
    getGuides()
  ]);

  const featured = news[0];
  const latestNews = news.slice(1, 4);

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-y-10 lg:gap-y-12 gap-x-8 xl:gap-x-12">
        
        {/* TOP LEFT: HERO */}
        <div className="lg:col-start-1 lg:row-start-1">
          {featured && (
            <section className="relative rounded-2xl overflow-hidden group cursor-pointer h-[400px] md:h-[500px] border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] w-full">
              <Link href={`/news/${featured.slug.current}`}>
                <Image 
                  src={featured.thumbnail} 
                  alt={featured.title} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover opacity-90"
                  priority
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/70 to-[#0B0B0F]/20"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full lg:w-[85%]">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-block bg-[#00E5FF] text-[#0B0B0F] text-[10px] md:text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-sm">
                      {featured.category}
                    </span>
                    <span className="inline-block bg-[#2A2A32] text-white text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
                      EXCLUSIVE
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter leading-tight mb-5 group-hover:text-[#00E5FF] transition-colors text-white">
                    {featured.title}
                  </h1>
                  <div className="flex items-center text-gray-300 text-xs md:text-sm font-sans gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 border-2 border-[#0B0B0F] shadow-sm flex-shrink-0"></div>
                    <span className="font-semibold">{featured.authorName || 'PHONEOCEAN'}</span>
                    <span className="text-gray-500 text-[10px] md:text-xs">•</span>
                    <span className="text-gray-400 text-[10px] md:text-xs">{format(new Date(featured.publishDate), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </Link>
            </section>
          )}
        </div>

        {/* TOP RIGHT (Desktop) / BELOW HERO (Mobile): TRENDING */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <section className="bg-transparent lg:bg-white dark:lg:bg-[#111116] lg:border lg:border-gray-200 dark:lg:border-gray-800/60 lg:rounded-2xl lg:shadow-sm dark:lg:shadow-md lg:overflow-hidden lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800/50 pb-3 lg:p-6 lg:pb-5">
              <h2 className="text-xl lg:text-sm font-bold font-mono uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2 lg:gap-0">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)] lg:hidden mr-2"></span>
                Trending Now
              </h2>
              <div className="hidden lg:flex gap-1">
                <span className="w-1 h-1 rounded-full bg-[#00E5FF]"></span>
                <span className="w-1 h-1 rounded-full bg-[#00E5FF]"></span>
              </div>
            </div>

            <div className="flex overflow-x-auto lg:flex-col gap-4 lg:gap-0 pt-4 lg:pt-0 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
              {latestNews.map((post, index) => (
                <Link href={`/news/${post.slug.current}`} key={post._id} className="snap-start group flex flex-col lg:flex-row lg:items-start min-w-[280px] sm:min-w-[320px] w-full lg:min-w-0 lg:p-6 lg:border-b lg:border-gray-200 dark:lg:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-[#111116] lg:hover:bg-gray-50 dark:lg:hover:bg-[#15151A] transition-colors rounded-xl lg:rounded-none bg-white dark:bg-[#0E0E12] lg:bg-transparent dark:lg:bg-transparent border border-gray-200 dark:border-gray-800/40 lg:border-transparent p-4 shadow-sm lg:shadow-none">
                  {/* Number indicator (Desktop only) */}
                  <div className="hidden lg:block text-[#00E5FF] text-[10px] font-black font-mono mr-4 tracking-widest mt-1">0{index + 1}</div>
                  
                  {/* Thumbnail (Mobile only) */}
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800/60 shadow-sm dark:shadow-md mb-4 lg:hidden">
                    <Image 
                      src={post.thumbnail} 
                      alt={post.title} 
                      fill 
                      sizes="(max-width: 1024px) 100vw, 30vw"
                      loading="lazy"
                      className="object-cover opacity-90" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-[#0B0B0F]/90 backdrop-blur-sm text-[10px] px-2 py-1 uppercase tracking-widest font-mono text-[#00E5FF] rounded-md shadow-sm">
                      0{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-base font-bold font-sans text-gray-900 dark:text-gray-100 leading-snug mb-3 group-hover:text-[#00E5FF] transition-colors line-clamp-3">
                      {post.title}
                    </h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-gray-600 dark:text-gray-500 text-[10px] font-mono uppercase tracking-wider">{post.category}</span>
                      <span className="text-gray-600 dark:text-gray-500 text-[10px] font-mono">{format(new Date(post.publishDate), 'MMM dd')}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Community Promo inside trending (Desktop only) */}
              <div className="hidden lg:block p-6 bg-gray-50 dark:bg-[#15151C]">
                <div className="bg-white dark:bg-[#1A1A22] rounded-xl p-5 border border-gray-200 dark:border-gray-800/60 shadow-sm">
                  <div className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-3">Community</div>
                  <p className="text-sm text-gray-800 dark:text-gray-300 font-medium mb-4 leading-relaxed">
                    Join 50k+ gamers on our Discord for instant alerts and discussions.
                  </p>
                  <button className="w-full py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold uppercase tracking-widest rounded-md transition-colors shadow-sm cursor-pointer min-h-[44px]">
                    Join Discord
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* BOTTOM LEFT (Desktop) / BELOW TRENDING (Mobile): MAIN CONTENT */}
        <div className="lg:col-start-1 lg:row-start-2 flex flex-col gap-10 lg:gap-12">
          
          {/* LATEST NEWS */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800/50 pb-3">
              <h2 className="text-xl md:text-2xl font-bold font-space-grotesk uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>
                Latest Feed
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {news.slice(1).map((post) => (
                <Link href={`/news/${post.slug.current}`} key={post._id} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-[#111116] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-[#00E5FF]/40 transition-all duration-300 shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,229,255,0.05)] hover:-translate-y-1">
                  <div className="relative aspect-video sm:w-56 sm:aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                    <Image 
                      src={post.thumbnail} 
                      alt={post.title} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover opacity-90" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-[#00E5FF] text-[#0B0B0F] text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-md sm:hidden shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <span className="hidden sm:inline-block text-[10px] text-[#00E5FF] font-black tracking-widest uppercase mb-3">{post.category}</span>
                    <h3 className="text-lg sm:text-[1.35rem] font-bold font-space-grotesk leading-snug group-hover:text-[#00E5FF] dark:group-hover:text-white text-gray-900 dark:text-gray-200 transition-colors line-clamp-3 mb-3">
                      {post.title}
                    </h3>
                    <div className="mt-auto text-[10px] md:text-xs text-gray-600 dark:text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                      <span>{format(new Date(post.publishDate), 'MMM dd, yyyy')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span>By {post.authorName || 'PHONEOCEAN'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <Link href="/news" className="flex items-center justify-center w-full sm:w-auto px-6 py-3 md:py-4 bg-white dark:bg-[#1A1A22] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#252530] rounded-xl font-bold font-mono tracking-widest uppercase text-xs transition-colors min-h-[48px] border border-gray-200 dark:border-gray-800 cursor-pointer text-center shadow-sm dark:shadow-none">
                Load More News
              </Link>
            </div>
          </section>

          {/* INTERVIEWS */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800/60 to-transparent my-2" />
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800/50 pb-3">
              <h2 className="text-xl md:text-2xl font-bold font-space-grotesk uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9D00FF] shadow-[0_0_8px_rgba(157,0,255,0.8)]"></span>
                Interviews
              </h2>
              <Link href="/interviews" className="text-[10px] md:text-xs uppercase font-mono tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white min-h-[44px] flex items-center">View All</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              {interviews.slice(0, 4).map((interview) => (
                <Link href="/interviews" key={interview._id} className="group flex flex-col bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-[0_4px_20px_rgba(157,0,255,0.05)] hover:border-[#9D00FF]/40 dark:hover:border-[#9D00FF]/40 transition-all hover:-translate-y-1 h-full">
                  <div className="relative aspect-video w-full overflow-hidden border-b border-gray-200 dark:border-gray-800/60">
                    <Image 
                      src={interview.thumbnail} 
                      alt={`Interview with ${interview.playerOrCeoName}`} 
                      fill 
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className="bg-[#9D00FF] text-white text-[10px] font-black font-sans px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-sm">INTERVIEW</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 dark:text-gray-500 text-[10px] uppercase tracking-widest font-mono line-clamp-1">{interview.eventName}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold font-space-grotesk leading-snug group-hover:text-[#9D00FF] dark:group-hover:text-white text-gray-900 dark:text-gray-200 mb-4 line-clamp-2">
                      Exclusive with {interview.playerOrCeoName}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800/40 flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-500 text-[10px] font-mono tracking-widest uppercase">{format(new Date(interview.publishDate), 'MMM dd')}</span>
                      <span className="text-[#9D00FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Watch <span className="text-base leading-none">→</span></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* BOTTOM RIGHT (Desktop) / BOTTOM (Mobile): GUIDES */}
        <div className="lg:col-start-2 lg:row-start-3 space-y-6 pt-4 lg:pt-0">
          <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-800/50 pb-3">
             <h2 className="text-xl md:text-sm font-bold font-mono uppercase tracking-[0.2em] text-gray-900 dark:text-[#00FF66] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.8)] lg:hidden"></span>
                Guides & Codes
             </h2>
             <Link href="/guides" className="text-[10px] uppercase font-mono tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-[#00FF66] min-h-[44px] flex items-center">More</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {guides.map((guide) => (
              <Link href={`/guides/${guide.slug.current}`} key={guide._id} className="flex flex-col sm:flex-row lg:flex-row gap-4 group items-center bg-white dark:bg-[#111116] p-4 lg:p-5 rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-[#00FF66]/30 dark:hover:border-[#00FF66]/30 transition-colors shadow-sm dark:shadow-none">
                <div className="relative w-full sm:w-24 lg:w-20 aspect-video sm:aspect-square lg:aspect-square flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <Image src={guide.thumbnail} alt={guide.title} fill sizes="(max-width: 640px) 100vw, 150px" loading="lazy" className="object-cover opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-[10px] text-[#00FF66] font-black font-sans tracking-widest uppercase mb-1.5">{guide.gameName}</span>
                  <h4 className="text-sm md:text-base lg:text-sm font-bold font-space-grotesk text-gray-900 dark:text-gray-200 group-hover:text-[#00FF66] dark:group-hover:text-white line-clamp-2 md:line-clamp-3 leading-snug">{guide.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
