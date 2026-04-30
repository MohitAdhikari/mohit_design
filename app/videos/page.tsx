import { getAllVideos } from '@/lib/api';
import { format } from 'date-fns';
import VideoEmbed from '@/components/VideoEmbed';

export const revalidate = 3600;

export default async function VideosPage() {
  const videos = await getAllVideos();

  if (!videos || videos.length === 0) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter text-white mb-6">VIDEOS</h1>
        <p className="text-gray-400 font-mono uppercase tracking-widest text-sm">No videos found. Check back soon.</p>
      </div>
    );
  }

  const featured = videos[0];
  const restVideos = videos.slice(1);

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* HEADER */}
      <header className="mb-10 md:mb-16 border-b border-gray-800/50 pb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-5xl font-black font-space-grotesk tracking-tighter text-white flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse"></span>
          VIDEOS
        </h1>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest hidden sm:block">Latest Media Feeds</span>
      </header>

      {/* FEATURED VIDEO */}
      {featured && (
        <section className="mb-16 md:mb-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="w-full lg:w-2/3">
              <div className="p-1 rounded-2xl bg-gradient-to-b from-red-500/20 to-transparent">
                <VideoEmbed 
                  youtubeUrl={featured.youtubeUrl} 
                  instagramUrl={featured.instagramUrl} 
                  title={featured.title} 
                />
              </div>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col pt-2 lg:pt-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block bg-red-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-sm">
                  FEATURED
                </span>
                <span className="inline-block bg-[#1A1A22] border border-gray-800 text-gray-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
                  {featured.category || featured._type}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black font-space-grotesk leading-tight text-white mb-4">
                {featured.title}
              </h2>
              <div className="text-gray-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2 mb-6">
                <span>{format(new Date(featured.date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LATEST VIDEOS GRID */}
      {restVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between border-b border-gray-800/30 pb-4 mb-8">
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk uppercase tracking-tight text-white">
              Latest Uploads
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restVideos.map((video: any) => (
              <div key={video._id} className="group bg-[#0B0B0F] rounded-2xl border border-gray-800/40 hover:border-gray-700/80 transition-colors overflow-hidden flex flex-col">
                <VideoEmbed 
                  youtubeUrl={video.youtubeUrl} 
                  instagramUrl={video.instagramUrl} 
                  title={video.title} 
                />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase bg-[#13131A] px-2 py-1 rounded">
                      {video.category || video._type}
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-space-grotesk leading-snug group-hover:text-red-400 text-gray-200 transition-colors line-clamp-3 mb-4">
                    {video.title}
                  </h3>
                  <div className="mt-auto text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center">
                    {format(new Date(video.date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
