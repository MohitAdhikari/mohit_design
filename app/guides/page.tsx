import { getGuides } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  title: 'Guides & Codes | PHONEOCEAN',
  description: 'Tutorials, redeem codes, and meta breakdowns for the most popular esports titles.',
};

export default async function GuidesPage() {
  const guides = await getGuides();

  // Group by gameName for filter chips
  const games = Array.from(new Set(guides.map((g: any) => g.gameName))) as string[];

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <PageHeader
        eyebrow="Knowledge Base"
        title={<>Guides &amp; <span className="text-green-600 dark:text-[#00FF66]">Codes</span></>}
        description="Stay ahead with the latest tutorials, redeem codes, and meta breakdowns."
        accent="green"
        meta={
          <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {guides.length} {guides.length === 1 ? 'guide' : 'guides'}
          </span>
        }
      />

      {games.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {games.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111116] border border-gray-200 dark:border-gray-800/60 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-700 dark:text-gray-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
              {g}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {guides.map((guide: any) => (
          <Link
            href={`/guides/${guide.slug.current}`}
            key={guide._id}
            className="group relative flex flex-col bg-white dark:bg-[#0E0E12] rounded-2xl border border-gray-200 dark:border-gray-800/60 hover:border-green-500/40 dark:hover:border-[#00FF66]/40 transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_24px_rgba(0,255,102,0.06)] overflow-hidden hover:-translate-y-1"
          >
            <div className="relative aspect-video overflow-hidden border-b border-gray-200 dark:border-gray-800/60">
              <Image
                src={guide.thumbnail}
                alt={guide.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 bg-[#00FF66] text-[#0B0B0F] text-[10px] px-2.5 py-1 uppercase tracking-widest font-black rounded-md shadow-sm">
                {guide.gameName}
              </div>
            </div>
            <div className="flex-1 flex flex-col p-5">
              <h3 className="text-lg md:text-xl font-bold font-space-grotesk leading-snug text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-[#00FF66] transition-colors">
                {guide.title}
              </h3>
              <div className="mt-auto flex items-center justify-between text-[10px] md:text-xs text-gray-600 dark:text-gray-500 font-mono uppercase tracking-wider">
                <span>Updated {format(new Date(guide.lastUpdated), 'MMM dd, yyyy')}</span>
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-[#00FF66] group-hover:gap-2 transition-all">
                  Open <span className="text-base leading-none">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
