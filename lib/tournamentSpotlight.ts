/**
 * Tournament "live spotlight" rotation.
 *
 * Match-result / standings posts (category === 'results', tagged with a
 * `tournament` ref) are transient: only the single most recent post per
 * tournament should ever surface in a "latest updates" feed (homepage,
 * breaking ticker, etc.) at a time — it represents "the latest update" and
 * is replaced the moment the next match/standings post for that tournament
 * goes live. Once that latest post itself is older than
 * SPOTLIGHT_MAX_AGE_HOURS, it drops off entirely (the article is still
 * reachable directly, just no longer promoted).
 */
export const SPOTLIGHT_MAX_AGE_HOURS = 24;

export interface SpotlightCandidate {
  _id: string;
  category?: string;
  tournament?: { _id: string } | null;
  publishDate?: string | null;
  _createdAt?: string;
}

export function applyTournamentSpotlight<T extends SpotlightCandidate>(posts: T[]): T[] {
  const byTournament = new Map<string, T[]>();
  const untouched: T[] = [];

  for (const post of posts) {
    const tournamentId = post.category === 'results' ? post.tournament?._id : null;
    if (!tournamentId) {
      untouched.push(post);
      continue;
    }
    const group = byTournament.get(tournamentId) || [];
    group.push(post);
    byTournament.set(tournamentId, group);
  }

  const spotlighted: T[] = [];
  for (const group of byTournament.values()) {
    const sorted = group.slice().sort(
      (a, b) => new Date(b.publishDate || b._createdAt || 0).getTime() - new Date(a.publishDate || a._createdAt || 0).getTime(),
    );
    const latest = sorted[0];
    const ageHours = (Date.now() - new Date(latest.publishDate || latest._createdAt || 0).getTime()) / 3_600_000;
    if (ageHours <= SPOTLIGHT_MAX_AGE_HOURS) spotlighted.push(latest);
    // older posts in the group are intentionally dropped from the feed pool.
  }

  return [...untouched, ...spotlighted];
}

export type HomepagePost = {
  _id: string;
  _type: string;
  publishDate?: string;
  _createdAt?: string;
  matchMeta?: {
    articleType?: string;
    tournamentEdition?: { _ref: string };
    matchDay?: number;
  };
  [key: string]: any;
};

/**
 * suppressMatchRecaps
 *
 * Given a list of homepage posts, removes individual match recap
 * articles for any day where a "day standings" article exists
 * for the same tournament edition + same day number.
 *
 * Match recaps are NOT deleted — they stay on the site,
 * just hidden from the homepage feed.
 */
export function suppressMatchRecaps(posts: HomepagePost[]): HomepagePost[] {
  // Build a Set of "editionRef__dayNumber" combos that have standings posted
  const standingKeys = new Set<string>();

  for (const post of posts) {
    const meta = post.matchMeta;
    if (
      meta?.articleType === 'day_standings' &&
      meta?.tournamentEdition?._ref &&
      meta?.matchDay != null
    ) {
      standingKeys.add(`${meta.tournamentEdition._ref}__${meta.matchDay}`);
    }
  }

  // If no standings exist yet → return everything unchanged
  if (standingKeys.size === 0) return posts;

  // Filter out match recaps that are covered by a standings post
  return posts.filter((post) => {
    const meta = post.matchMeta;
    if (meta?.articleType !== 'match_recap') return true; // not a recap → keep

    const key = `${meta?.tournamentEdition?._ref}__${meta?.matchDay}`;
    if (standingKeys.has(key)) return false; // standings exists → suppress

    return true; // no standings yet → keep
  });
}
