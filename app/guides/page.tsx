import { getGuides } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8 md:mb-12 border-b border-gray-300 dark:border-gray-800/50 pb-6">
        <h1 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter uppercase text-purple-600 dark:text-purple-400">Guides & Codes</h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 font-mono tracking-tight">Stay ahead with the latest tutorials and freebies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {guides.map((guide) => (
          <Link href={`/guides/${guide.slug.current}`} key={guide._id} className="group border border-gray-200 dark:border-gray-800/40 bg-white dark:bg-[#0E0E12] hover:border-purple-500/50 transition-colors p-4 md:p-5 rounded-2xl shadow-sm dark:shadow-none">
            <div className="relative aspect-video mb-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md">
              <Image src={guide.thumbnail} alt={guide.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 md:group-hover:scale-105" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-500 font-mono tracking-widest uppercase mb-2 block">{guide.gameName}</span>
            <h3 className="text-lg md:text-xl font-bold font-space-grotesk leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-gray-900 dark:text-white mb-4 line-clamp-2">
              {guide.title}
            </h3>
            <div className="text-[10px] text-gray-600 dark:text-gray-500 font-mono uppercase tracking-wider mt-auto inline-block">
              Updated: {format(new Date(guide.lastUpdated), 'MMM dd, yyyy')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
