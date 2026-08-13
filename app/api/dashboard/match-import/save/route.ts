import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import {
  createMatchDocument,
  updateCumulativeStanding,
  getTeamCandidates,
  generateMatchRecap,
  textToPortableText,
  type ResolvedRow,
} from '@/lib/dashboard/matchImport';
import { createArticleForUser } from '@/lib/dashboard/sanityDashboard';
import { logActivity } from '@/lib/dashboard/activityLog';

/**
 * Admin-only: commits a previously-previewed (and possibly manually
 * corrected) set of match rows to Sanity — creates the `match` document
 * and updates the cumulative `standing` table for the edition.
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(['admin']);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const {
    tournamentId,
    editionId,
    scheduledAt,
    stage,
    group,
    matchNumber,
    map,
    afterMatch,
    rows,
    tournamentName,
    editionYear,
    generateArticle,
  } = body ?? {};

  if (!tournamentId || !editionId || !scheduledAt || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: 'tournamentId, editionId, scheduledAt, and at least one row are required.' },
      { status: 400 }
    );
  }

  const unmatched = rows.filter((r: any) => !r.teamId);
  if (unmatched.length > 0) {
    return NextResponse.json(
      {
        error: `${unmatched.length} row(s) have no matched team: ${unmatched
          .map((r: any) => r.teamNameRaw)
          .join(', ')}. Every row needs a resolved team before saving.`,
      },
      { status: 400 }
    );
  }

  const resolvedRows: ResolvedRow[] = rows.map((r: any) => ({
    teamNameRaw: r.teamNameRaw,
    teamId: r.teamId ?? null,
    placement: r.placement ?? null,
    kills: r.kills ?? null,
    placementPoints: r.placementPoints ?? null,
    points: r.points ?? null,
  }));

  try {
    const match = await createMatchDocument({
      tournamentId,
      editionId,
      scheduledAt,
      stage,
      group,
      matchNumber,
      map,
      rows: resolvedRows,
    });

    const teamCandidates = await getTeamCandidates();
    const standing = await updateCumulativeStanding({
      tournamentId,
      editionId,
      stage: 'overall',
      group,
      afterMatch,
      rows: resolvedRows,
      teamCandidates,
    });

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      action: 'match.imported',
      meta: { matchId: match._id, editionId, rowCount: resolvedRows.length },
    });

    let article = null;
    if (generateArticle && tournamentName && editionYear) {
      try {
        const teamById = new Map(teamCandidates.map((t) => [t._id, t.name]));
        const recapRows = resolvedRows.map((r) => ({
          teamName: (r.teamId && teamById.get(r.teamId)) || r.teamNameRaw,
          placement: r.placement,
          kills: r.kills,
          points: r.points,
        }));

        const recapText = await generateMatchRecap(
          { tournamentName, editionYear, stage, map, matchNumber },
          recapRows
        );

        const winnerName = recapRows.find((r) => r.placement === 1)?.teamName;
        const title = winnerName
          ? `${winnerName} take Match ${matchNumber ?? ''} at ${tournamentName} ${editionYear}`.replace(/\s+/g, ' ').trim()
          : `${tournamentName} ${editionYear} — Match ${matchNumber ?? ''} recap`;

        article = await createArticleForUser(user, {
          title,
          excerpt: recapText.split(/\n{2,}/)[0]?.slice(0, 200),
          content: textToPortableText(recapText),
        });

        await logActivity({
          userId: user.id,
          userEmail: user.email,
          action: 'article.created',
          targetId: article._id,
          targetTitle: title,
          meta: { source: 'smart_import', matchId: match._id },
        });
      } catch (recapErr) {
        // Match + standings are already saved — a recap failure should
        // never roll that back or block the response, just surface a note.
        return NextResponse.json(
          {
            match,
            standing,
            article: null,
            warning:
              recapErr instanceof Error
                ? `Match saved, but the recap draft failed: ${recapErr.message}`
                : 'Match saved, but the recap draft failed.',
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ match, standing, article }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save match.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
