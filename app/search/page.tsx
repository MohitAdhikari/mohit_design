import { Suspense } from 'react';
import { getGuides, getInterviews, getNewsPosts } from '@/lib/api';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search | PHONEOCEAN',
  description: 'Search across PHONEOCEAN news, interviews, and guides.',
};

export const revalidate = 60;

export default async function SearchPage() {
  const [news, interviews, guides] = await Promise.all([
    getNewsPosts(),
    getInterviews(),
    getGuides(),
  ]);

  const documents = [
    ...news.map((n: any) => ({
      _id: n._id,
      _type: 'news' as const,
      title: n.title,
      subtitle: n.category,
      href: `/news/${n.slug.current}`,
      thumbnail: n.thumbnail,
      tag: n.category,
    })),
    ...interviews.map((i: any) => ({
      _id: i._id,
      _type: 'interview' as const,
      title: `Exclusive with ${i.playerOrCeoName}`,
      subtitle: i.eventName,
      href: '/interviews',
      thumbnail: i.thumbnail,
      tag: 'Interview',
    })),
    ...guides.map((g: any) => ({
      _id: g._id,
      _type: 'guide' as const,
      title: g.title,
      subtitle: g.gameName,
      href: `/guides/${g.slug.current}`,
      thumbnail: g.thumbnail,
      tag: g.gameName,
    })),
  ];

  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh]">
          <div className="h-12 bg-gray-100 dark:bg-[#13131A] rounded-2xl animate-pulse" />
        </div>
      }
    >
      <SearchClient documents={documents} />
    </Suspense>
  );
}
