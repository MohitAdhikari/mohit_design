/**
 * Turns the raw pipe-table text already extracted by `parseArticleText`
 * (see lib/articleImport/parser.ts) into structured rows matching the
 * `standing.rows[]` schema (sanity/schemaTypes/standing.ts).
 *
 * Deterministic, heuristic header matching only — no AI/model calls. Always
 * review the output before publishing; this is intentionally conservative
 * (skips rows it can't confidently parse) rather than guessing.
 */

export type StandingRowField =
  | 'rank'
  | 'teamName'
  | 'matchesPlayed'
  | 'wins'
  | 'losses'
  | 'wwcd'
  | 'placementPoints'
  | 'kills'
  | 'points';

export interface ParsedStandingRow {
  rank: number;
  teamName: string;
  matchesPlayed?: number;
  wins?: number;
  losses?: number;
  wwcd?: number;
  placementPoints?: number;
  kills?: number;
  points: number;
}

export interface ParsedStandingsTable {
  headers: string[];
  matchedFields: (StandingRowField | null)[];
  rows: ParsedStandingRow[];
  warnings: string[];
}

const HEADER_ALIASES: { key: StandingRowField; patterns: RegExp[] }[] = [
  { key: 'rank', patterns: [/^#$/, /^rank$/i, /^pos(ition)?$/i] },
  { key: 'teamName', patterns: [/^team(\s*name)?$/i, /^squad$/i, /^org(anis|aniz)ation$/i] },
  { key: 'wwcd', patterns: [/^wwcd$/i, /^chicken\s*dinners?$/i, /^wins?\s*\(wwcd\)$/i, /^booyahs?$/i] },
  { key: 'wins', patterns: [/^w$/i, /^wins$/i] },
  { key: 'losses', patterns: [/^l$/i, /^losses$/i] },
  { key: 'matchesPlayed', patterns: [/^mp$/i, /^matches(\s*played)?$/i] },
  { key: 'kills', patterns: [/^kills?$/i, /^elims?$/i, /^eliminations?$/i, /^finishes$/i, /^kill\s*(pts|points)$/i, /^finish\s*(pts|points)$/i] },
  { key: 'placementPoints', patterns: [/^pp$/i, /^place(ment)?\s*(pts|points)?$/i, /^pos(ition)?\s*(pts|points)$/i] },
  { key: 'points', patterns: [/^points?$/i, /^pts$/i, /^total\s*(points|pts)?$/i] },
];

function matchHeader(raw: string): StandingRowField | null {
  const clean = raw.trim();
  for (const { key, patterns } of HEADER_ALIASES) {
    if (patterns.some((re) => re.test(clean))) return key;
  }
  return null;
}

function splitRow(line: string): string[] {
  // Tab-separated (pasted from Sheets/Excel) is also accepted.
  if (line.includes('\t') && !line.includes('|')) return line.split('\t').map((c) => c.trim());
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function parseStandingsRawText(rawText: string): ParsedStandingsTable {
  const warnings: string[] = [];
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    return { headers: [], matchedFields: [], rows: [], warnings: ['Not enough rows to parse — need a header row plus at least one data row.'] };
  }

  const headers = splitRow(lines[0]);
  const matchedFields = headers.map(matchHeader);

  // "Points" alone is ambiguous when both a placement-points and a
  // total-points column exist and both say "points" — prefer the last
  // matching column as the grand total (matches how these tables are
  // conventionally laid out: PP then Total Points last).
  const pointsIdxs = matchedFields.reduce<number[]>((acc, f, i) => (f === 'points' ? [...acc, i] : acc), []);
  if (pointsIdxs.length > 1) {
    pointsIdxs.slice(0, -1).forEach((i) => { matchedFields[i] = 'placementPoints'; });
  }

  if (!matchedFields.includes('teamName')) {
    warnings.push('Could not detect a "Team" column — every row was skipped. Check the pasted table has a Team/Squad header.');
  }

  const rows: ParsedStandingRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitRow(lines[i]);
    if (cells.length < 2) continue;
    // Rows made entirely of dashes (a stray markdown separator row that
    // slipped through) — skip.
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;

    const row: Partial<ParsedStandingRow> = {};
    cells.forEach((cell, idx) => {
      const field = matchedFields[idx];
      if (!field) return;
      if (field === 'teamName') {
        row.teamName = cell.replace(/^\*\*|\*\*$/g, '').trim();
      } else {
        const num = parseFloat(cell.replace(/[^0-9.-]/g, ''));
        if (!Number.isNaN(num)) (row as any)[field] = num;
      }
    });

    if (!row.teamName) {
      warnings.push(`Row ${i + 1} has no detected team name — skipped: "${lines[i].slice(0, 60)}"`);
      continue;
    }
    rows.push({
      rank: row.rank ?? rows.length + 1,
      teamName: row.teamName,
      matchesPlayed: row.matchesPlayed,
      wins: row.wins,
      losses: row.losses,
      wwcd: row.wwcd,
      placementPoints: row.placementPoints,
      kills: row.kills,
      points: row.points ?? row.placementPoints ?? 0,
    });
  }

  if (rows.length === 0) {
    warnings.push('No rows could be parsed — nothing will be imported.');
  }

  return { headers, matchedFields, rows, warnings };
}
