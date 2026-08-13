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
