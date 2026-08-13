import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { extractMatchRowsFromText, getTeamCandidates, matchTeam } from '@/lib/dashboard/matchImport';

/**
 * Admin-only: takes raw pasted match standings text, asks Gemini to extract
 * structured rows, then resolves each row against existing `team` documents.
 * This route only returns a preview — nothing is written to Sanity here.
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(['admin']);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const rawText: string | undefined = body?.rawText?.trim();

  if (!rawText) {
    return NextResponse.json({ error: 'rawText is required.' }, { status: 400 });
  }

  let rows;
  try {
    rows = await extractMatchRowsFromText(rawText);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const candidates = await getTeamCandidates();

  const resolved = rows.map((row) => {
    const match = matchTeam(row.teamNameRaw, candidates);
    return {
      teamNameRaw: row.teamNameRaw,
      teamId: match?._id ?? null,
      teamName: match?.name ?? null,
      teamLogoUrl: match?.logoUrl ?? null,
      placement: row.placement,
      kills: row.kills,
      placementPoints: row.placementPoints,
      points: row.points,
    };
  });

  return NextResponse.json({ rows: resolved });
}
