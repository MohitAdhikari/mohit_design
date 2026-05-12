import { getInterviews } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import VideoEmbed from '@/components/VideoEmbed';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  title: 'Exclusive Interviews | PHONEOCEAN',
  description: 'Exclusive conversations with esports players, team owners, and industry insiders.',
};

export default async function InterviewsPage() {
  const interviews = await getInterviews();

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="Conversations"
        title={<>Exclusive <span className="text-purple-600 dark:text-[#9D00FF]">Interviews</span></>}
        description="Unfiltered insights from the top players, CEOs and creators shaping the competitive gaming ecosystem."
        accent="purple"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {interviews.map((interview: any) => (
          <article
            key={interview._id}
            className="group flex flex-col border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_30px_rgba(157,0,255,0.08)] hover:border-purple-500/40 dark:hover:border-[#9D00FF]/40 transition-all"
          >
            <div className="relative border-b border-gray-200 dark:border-gray-800/60">
              {interview.youtubeUrl || interview.instagramUrl ? (
                <VideoEmbed
                  youtubeUrl={interview.youtubeUrl}
                  instagramUrl={interview.instagramUrl}
                  title={interview.playerOrCeoName}
                />
              ) : (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={interview.thumbnail}
                    alt={interview.playerOrCeoName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[#9D00FF] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
                <span className="w-1 h-1 rounded-full bg-white" />
                Interview
              </div>
            </div>

            <div className="p-6 md:p-7 flex-1 flex flex-col">
              <div className="mb-3 inline-flex items-center gap-2 text-[10px] text-purple-600 dark:text-[#9D00FF] font-mono tracking-widest uppercase">
                <span>{interview.eventName}</span>
                <span className="w-1 h-1 rounded-full bg-purple-300 dark:bg-purple-500/40" />
                <span>{format(new Date(interview.publishDate), 'MMM dd, yyyy')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-space-grotesk uppercase mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#9D00FF] transition-colors">
                {interview.playerOrCeoName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-sans leading-relaxed">
                A deep-dive conversation covering career, strategy, and the road ahead.
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
