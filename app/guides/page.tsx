import { getGuides } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import GuidesFilter from '@/components/GuidesFilter';

export const metadata = {
  title: 'Guides & Codes | PHONEOCEAN',
  description: 'Tutorials, redeem codes, and meta breakdowns for the most popular esports titles.',
};

export const revalidate = 60;

export default async function GuidesPage() {
  const guides = await getGuides();
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
      <GuidesFilter guides={guides} games={games} />
    </div>
  );
}
