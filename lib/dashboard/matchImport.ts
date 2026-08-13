import { GoogleGenAI, Type } from '@google/genai';
import { writeClient } from '@/lib/sanityServer';

// ─── AI extraction ──────────────────────────────────────────────────────

export interface ExtractedRow {
  teamNameRaw: string;
  placement: number | null;
  kills: number | null;
  placementPoints: number | null;
  points: number | null;
}

export interface ExtractedMatch {
  rows: ExtractedRow[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    rows: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          teamNameRaw: { type: Type.STRING },
          placement: { type: Type.INTEGER, nullable: true },
          kills: { type: Type.INTEGER, nullable: true },
          placementPoints: { type: Type.INTEGER, nullable: true },
          points: { type: Type.INTEGER, nullable: true },
        },
        required: ['teamNameRaw'],
      },
    },
  },
  required: ['rows'],
};

const EXTRACT_PROMPT = `You are given raw text pasted from a BGMI/PUBG Mobile Battle Royale match standings screen or a table.
Extract every team row into structured data. Field meanings:
- teamNameRaw: the team name or tag exactly as written in the source (do not normalize/translate it).
- placement: the team's final rank/position in this match (1 = chicken dinner). If not present, null.
- kills: total kills by the team in this match. If not present, null.
- placementPoints: points awarded purely for placement (if the source separates placement points from total points). If not shown separately, null.
- points: total points for this match (placement + kill points combined), if shown. If not shown, null.

Rules:
- Every row in the source must produce exactly one row in "rows", in the same order as given.
- Never invent values. If a field is not present in the source, use null.
- Ignore headers, page numbers, or unrelated text.

Raw input:
"""
{{RAW_TEXT}}
"""`;

let cachedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!cachedClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set in the environment.');
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

/** Sends raw pasted text (table/OCR/manual) to Gemini and gets back structured rows. */
export async function extractMatchRowsFromText(rawText: string): Promise<ExtractedRow[]> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: EXTRACT_PROMPT.replace('{{RAW_TEXT}}', rawText),
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  let parsed: ExtractedMatch;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Gemini returned malformed JSON.');
  }

  return parsed.rows ?? [];
}

// ─── Tournament/edition picker (admin-only, unfiltered by publish status) ─

export interface EditionOption {
  _id: string;
  tournamentId: string;
  tournamentName: string;
  year: string;
}

export async function getEditionOptions(): Promise<EditionOption[]> {
  return writeClient.fetch(
    `*[_type == "tournamentEdition"] | order(startDate desc) {
      _id,
      "tournamentId": tournament._ref,
      "tournamentName": tournament->name,
      year
    }`
  );
}

// ─── Team matching ──────────────────────────────────────────────────────

export interface TeamCandidate {
  _id: string;
  name: string;
  shortName: string | null;
  aliases: string[];
  logoUrl: string | null;
}

export async function getTeamCandidates(): Promise<TeamCandidate[]> {
  return writeClient.fetch(
    `*[_type == "team"]{ _id, name, shortName, aliases, "logoUrl": logo.asset->url }`
  );
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Matches a raw team name string against known teams by name/shortName/alias, exact then substring. */
export function matchTeam(raw: string, candidates: TeamCandidate[]): TeamCandidate | null {
  const target = normalize(raw);
  if (!target) return null;

  const namesOf = (c: TeamCandidate) =>
    [c.name, c.shortName ?? '', ...(c.aliases ?? [])].filter(Boolean).map(normalize);

  // Exact match first.
  for (const c of candidates) {
    if (namesOf(c).includes(target)) return c;
  }
  // Substring match (either direction) as a fallback.
  for (const c of candidates) {
    if (namesOf(c).some((n) => n.length >= 3 && (target.includes(n) || n.includes(target)))) {
      return c;
    }
  }
  return null;
}

// ─── Match recap article writer ────────────────────────────────────────

const BANNED_PHRASES = [
  'in the ever-evolving landscape',
  "in today's fast-paced world",
  'in conclusion',
  'overall,',
  'it is important to note',
  'delve into',
  'as an ai',
  'game-changer',
  'unleash',
  'unlock the potential',
  'testament to',
];

const RECAP_PROMPT = `You are a senior esports desk writer for an Indian gaming news site, on deadline right after a BGMI/PUBG Mobile match ended. Write a short match recap the way a real human beat writer would — someone who has watched hundreds of these matches and writes fast, punchy copy for readers who already follow the scene.

Hard rules:
- Do NOT sound like AI. Never use: ${BANNED_PHRASES.join('; ')}, or any similar generic filler.
- No headline, no title — just the body copy. The CMS adds the headline separately.
- Open with the actual result in the first sentence (who won, how it happened) — never a scene-setting throat-clear sentence.
- Use short-to-medium sentences. Vary rhythm. Write like a person typing fast, not a report generator.
- Reference specific numbers given (kills, points, placement) naturally in sentences, not as a re-listing of the table.
- 3-4 paragraphs total. No bullet points, no markdown, no headers — plain paragraphs separated by a blank line.
- If placement/kill data implies a storyline (e.g. a comeback, a dominant chicken dinner, a squad barely surviving), call it out like a writer would, but never invent facts not present in the data.
- End on the standings/tournament implication, not a generic closing line.

Match context:
{{CONTEXT}}

Final standings for this match (rank, team, kills, points):
{{ROWS}}

Write the recap now.`;

export interface RecapContext {
  tournamentName: string;
  editionYear: string;
  stage?: string;
  map?: string;
  matchNumber?: number;
}

/** Generates a human-sounding match recap in plain paragraphs (not Portable Text yet). */
export async function generateMatchRecap(
  context: RecapContext,
  rows: { teamName: string; placement: number | null; kills: number | null; points: number | null }[]
): Promise<string> {
  const ai = getClient();

  const contextLines = [
    `Tournament: ${context.tournamentName} — ${context.editionYear}`,
    context.stage ? `Stage: ${context.stage}` : null,
    context.map ? `Map: ${context.map}` : null,
    context.matchNumber ? `Match number: ${context.matchNumber}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const rowLines = [...rows]
    .sort((a, b) => (a.placement ?? 999) - (b.placement ?? 999))
    .map((r) => `#${r.placement ?? '?'} ${r.teamName} — ${r.kills ?? 0} kills, ${r.points ?? 0} pts`)
    .join('\n');

  const prompt = RECAP_PROMPT.replace('{{CONTEXT}}', contextLines).replace('{{ROWS}}', rowLines);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned an empty recap.');
  return text;
}

/** Converts plain-text paragraphs (blank-line separated) into Sanity Portable Text blocks. */
export function textToPortableText(text: string): any[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      _key: Math.random().toString(36).slice(2, 10),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: Math.random().toString(36).slice(2, 10),
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

// ─── Save to Sanity ─────────────────────────────────────────────────────

export interface ResolvedRow {
  teamNameRaw: string;
  teamId: string | null;
  placement: number | null;
  kills: number | null;
  placementPoints: number | null;
  points: number | null;
}

export interface SaveMatchInput {
  tournamentId: string;
  editionId: string;
  scheduledAt: string;
  stage?: string;
  group?: string;
  matchNumber?: number;
  map?: string;
  rows: ResolvedRow[];
}

/** Creates a battle_royale match document from resolved (team-matched) rows. */
export async function createMatchDocument(input: SaveMatchInput) {
  const sortedRows = [...input.rows].sort(
    (a, b) => (a.placement ?? 999) - (b.placement ?? 999)
  );

  const participants = sortedRows.map((row) => ({
    _type: 'matchParticipant',
    _key: `${row.teamId ?? row.teamNameRaw}-${Math.random().toString(36).slice(2, 8)}`,
    team: row.teamId ? { _type: 'reference', _ref: row.teamId } : undefined,
    placement: row.placement ?? undefined,
    kills: row.kills ?? undefined,
    placementPoints: row.placementPoints ?? undefined,
    points: row.points ?? undefined,
  }));

  const winnerRow = sortedRows.find((r) => r.placement === 1 && r.teamId);

  const doc = await writeClient.create({
    _type: 'match',
    tournament: { _type: 'reference', _ref: input.tournamentId },
    edition: { _type: 'reference', _ref: input.editionId },
    matchFormat: 'battle_royale',
    participants,
    scheduledAt: input.scheduledAt,
    status: 'completed',
    stage: input.stage || undefined,
    group: input.group || undefined,
    matchNumber: input.matchNumber || undefined,
    map: input.map || undefined,
    winner: winnerRow?.teamId ? { _type: 'reference', _ref: winnerRow.teamId } : undefined,
  });

  return doc;
}

/**
 * Updates (or creates) the cumulative "Overall" standing table for an edition
 * by adding this match's points/kills on top of whatever is already there.
 */
export async function updateCumulativeStanding(input: {
  tournamentId: string;
  editionId: string;
  stage?: string;
  group?: string;
  afterMatch?: number;
  rows: ResolvedRow[];
  teamCandidates: TeamCandidate[];
}) {
  const existing = await writeClient.fetch(
    `*[_type == "standing" && edition._ref == $editionId && stage == $stage && group == $group && status == "published"][0]{
      _id, rows[]{ _key, rank, team, teamName, matchesPlayed, wins, losses, wwcd, placementPoints, kills, points, qualified, eliminated, notes }
    }`,
    { editionId: input.editionId, stage: input.stage ?? 'overall', group: input.group ?? null }
  );

  type AggRow = {
    teamId: string | null;
    teamName: string;
    matchesPlayed: number;
    wins: number;
    wwcd: number;
    placementPoints: number;
    kills: number;
    points: number;
  };

  const byKey = new Map<string, AggRow>();

  // Seed with existing cumulative rows.
  for (const r of existing?.rows ?? []) {
    const key = r.team?._ref ?? r.teamName ?? '';
    if (!key) continue;
    byKey.set(key, {
      teamId: r.team?._ref ?? null,
      teamName: r.teamName ?? '',
      matchesPlayed: r.matchesPlayed ?? 0,
      wins: r.wins ?? 0,
      wwcd: r.wwcd ?? 0,
      placementPoints: r.placementPoints ?? 0,
      kills: r.kills ?? 0,
      points: r.points ?? 0,
    });
  }

  // Add this match's contribution.
  for (const row of input.rows) {
    const key = row.teamId ?? row.teamNameRaw;
    const candidate = input.teamCandidates.find((c) => c._id === row.teamId);
    const existingAgg = byKey.get(key);
    const base: AggRow = existingAgg ?? {
      teamId: row.teamId,
      teamName: candidate?.name ?? row.teamNameRaw,
      matchesPlayed: 0,
      wins: 0,
      wwcd: 0,
      placementPoints: 0,
      kills: 0,
      points: 0,
    };
    base.matchesPlayed += 1;
    if (row.placement === 1) {
      base.wins += 1;
      base.wwcd += 1;
    }
    base.placementPoints += row.placementPoints ?? 0;
    base.kills += row.kills ?? 0;
    base.points += row.points ?? ((row.placementPoints ?? 0) + (row.kills ?? 0));
    byKey.set(key, base);
  }

  const sorted = Array.from(byKey.values()).sort((a, b) => b.points - a.points);

  const rows = sorted.map((r, i) => ({
    _type: 'standingRow',
    _key: `${r.teamId ?? r.teamName}-row`,
    rank: i + 1,
    team: r.teamId ? { _type: 'reference', _ref: r.teamId } : undefined,
    teamName: r.teamId ? undefined : r.teamName,
    matchesPlayed: r.matchesPlayed,
    wins: r.wins,
    wwcd: r.wwcd,
    placementPoints: r.placementPoints,
    kills: r.kills,
    points: r.points,
  }));

  const title = `Overall Standings — After Match ${input.afterMatch ?? '?'}`;

  if (existing?._id) {
    return writeClient
      .patch(existing._id)
      .set({ rows, lastUpdated: new Date().toISOString(), afterMatch: input.afterMatch, title })
      .commit();
  }

  return writeClient.create({
    _type: 'standing',
    title,
    tournament: { _type: 'reference', _ref: input.tournamentId },
    edition: { _type: 'reference', _ref: input.editionId },
    stage: input.stage ?? 'overall',
    group: input.group || undefined,
    afterMatch: input.afterMatch,
    status: 'published',
    lastUpdated: new Date().toISOString(),
    rows,
  });
}
