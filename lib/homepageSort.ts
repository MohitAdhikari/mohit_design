export type SortableHomepagePost = {
  _id: string;
  publishDate?: string | null;
  _createdAt?: string | null;
  isLive?: boolean;
  isFeatured?: boolean;
  matchMeta?: {
    articleType?: string;
    tournamentEdition?: { _ref?: string };
    matchDay?: number;
  };
};

const BOOST = {
  LIVE: 10_000,
  DAY1: 5_000,
  FEATURED: 3_000,
  STANDINGS: 1_000,
  DEFAULT: 0,
};

function score(p: SortableHomepagePost): number {
  const base = new Date(p.publishDate || p._createdAt || 0).getTime() / 1_000;

  let boost = BOOST.DEFAULT;

  if (p.isLive) {
    boost = BOOST.LIVE;
  } else if (p.matchMeta?.matchDay === 1) {
    const age = Date.now() - new Date(p.publishDate || p._createdAt || 0).getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1_000;
    if (age < threeDays) boost = BOOST.DAY1;
  } else if (p.isFeatured) {
    boost = BOOST.FEATURED;
  } else if (p.matchMeta?.articleType === 'day_standings') {
    boost = BOOST.STANDINGS;
  }

  return base + boost;
}

export function homepageSort<T extends SortableHomepagePost>(posts: T[]): T[] {
  return [...posts].sort((a, b) => score(b) - score(a));
}
