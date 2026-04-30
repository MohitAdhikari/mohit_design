import { getInterviews } from '@/lib/api';
import Image from 'next/image';
import { format } from 'date-fns';
import VideoEmbed from '@/components/VideoEmbed';

export default async function InterviewsPage() {
  const interviews = await getInterviews();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8 md:mb-12 border-b border-gray-300 dark:border-gray-800/50 pb-6">
        <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase text-gray-900 dark:text-white">Exclusive Interviews</h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 font-mono tracking-tight">Hear from the top players and CEOs in the scene.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        {interviews.map((interview) => (
          <div key={interview._id} className="group border border-gray-200 dark:border-gray-800/40 bg-white dark:bg-[#0E0E12] rounded-2xl overflow-hidden shadow-sm dark:shadow-lg">
            <div className="relative border-b border-gray-200 dark:border-transparent">
              {(interview.youtubeUrl || interview.instagramUrl) ? (
                <VideoEmbed youtubeUrl={interview.youtubeUrl} instagramUrl={interview.instagramUrl} title={interview.playerOrCeoName} />
              ) : (
                <div className="relative aspect-video">
                  <Image src={interview.thumbnail} alt={interview.playerOrCeoName} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-3 text-[10px] text-blue-600 dark:text-blue-500 font-mono tracking-widest uppercase">
                {interview.eventName} • {format(new Date(interview.publishDate), 'MMM dd, yyyy')}
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-space-grotesk uppercase mb-4 text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer">
                {interview.playerOrCeoName}
              </h2>
              {/* Note: In a real app we'd map over keyHighlights using PortableText, skipping here for simplicity since mock uses raw text in portable text format */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
