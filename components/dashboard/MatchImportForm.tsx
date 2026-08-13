'use client';

import { useState } from 'react';
import type { EditionOption } from '@/lib/dashboard/matchImport';

type PreviewRow = {
  teamNameRaw: string;
  teamId: string | null;
  teamName: string | null;
  teamLogoUrl: string | null;
  placement: number | null;
  kills: number | null;
  placementPoints: number | null;
  points: number | null;
};

export default function MatchImportForm({ editions }: { editions: EditionOption[] }) {
  const [editionId, setEditionId] = useState(editions[0]?._id ?? '');
  const [scheduledAt, setScheduledAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [stage, setStage] = useState('');
  const [group, setGroup] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [afterMatch, setAfterMatch] = useState('');
  const [map, setMap] = useState('');
  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generateArticle, setGenerateArticle] = useState(true);
  const [articleId, setArticleId] = useState<string | null>(null);

  const selectedEdition = editions.find((e) => e._id === editionId);

  async function handleExtract() {
    setError(null);
    setSuccess(null);
    if (!rawText.trim()) {
      setError('Paste the match standings text first.');
      return;
    }
    setExtracting(true);
    const res = await fetch('/api/dashboard/match-import/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    const data = await res.json();
    setExtracting(false);
    if (!res.ok) {
      setError(data.error || 'Extraction failed.');
      return;
    }
    setRows(data.rows);
  }

  function updateRow(index: number, patch: Partial<PreviewRow>) {
    setRows((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function handleSave() {
    if (!rows || !selectedEdition) return;
    setError(null);
    setSuccess(null);
    setWarning(null);
    setArticleId(null);

    const unresolved = rows.filter((r) => !r.teamId);
    if (unresolved.length > 0) {
      setError(
        `${unresolved.length} row(s) couldn't be matched to a team: ${unresolved
          .map((r) => r.teamNameRaw)
          .join(', ')}. Fix the team names or create those teams in Sanity first.`
      );
      return;
    }

    setSaving(true);
    const res = await fetch('/api/dashboard/match-import/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournamentId: selectedEdition.tournamentId,
        editionId: selectedEdition._id,
        tournamentName: selectedEdition.tournamentName,
        editionYear: selectedEdition.year,
        scheduledAt: new Date(scheduledAt).toISOString(),
        stage: stage || undefined,
        group: group || undefined,
        matchNumber: matchNumber ? Number(matchNumber) : undefined,
        map: map || undefined,
        afterMatch: afterMatch ? Number(afterMatch) : undefined,
        rows,
        generateArticle,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Failed to save match.');
      return;
    }

    if (data.warning) setWarning(data.warning);
    else setSuccess(
      data.article
        ? 'Match saved, standings updated, and a draft recap article is ready for review.'
        : 'Match saved and standings updated.'
    );
    if (data.article?._id) setArticleId(data.article._id);
    setRows(null);
    setRawText('');
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2 flex items-center justify-between gap-3">
          <span>{success}</span>
          {articleId && (
            <a
              href={`/dashboard/articles/${articleId}`}
              className="shrink-0 text-xs font-semibold underline hover:text-green-300"
            >
              Review draft →
            </a>
          )}
        </div>
      )}
      {warning && (
        <div className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-md px-3 py-2">
          {warning}
        </div>
      )}

      {/* Match metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={editionId}
          onChange={(e) => setEditionId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500 sm:col-span-1"
        >
          {editions.map((e) => (
            <option key={e._id} value={e._id}>
              {e.tournamentName} — {e.year}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="Map (e.g. erangel)"
          value={map}
          onChange={(e) => setMap(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="Stage (e.g. group_stage)"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="Group (optional)"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          type="number"
          placeholder="Match # (within day/stage)"
          value={matchNumber}
          onChange={(e) => setMatchNumber(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          type="number"
          placeholder="Cumulative standings label: after match #"
          value={afterMatch}
          onChange={(e) => setAfterMatch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500 sm:col-span-2"
        />
      </div>

      {/* Raw text input */}
      <div>
        <label className="block text-xs text-white/60 mb-1">
          Paste raw standings text (team, placement, kills, points — any table/text format)
        </label>
        <textarea
          rows={8}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={'#1  GodLike Esports  8 kills  15 pts\n#2  Team Soul       6 kills  12 pts\n...'}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500 font-mono"
        />
        <button
          onClick={handleExtract}
          disabled={extracting}
          className="mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
        >
          {extracting ? 'Reading data…' : 'Smart Import'}
        </button>
      </div>

      {/* Preview / edit table */}
      {rows && (
        <div>
          <p className="text-xs text-white/60 mb-2">
            Review before saving. Rows in red couldn&apos;t be matched to a team — fix the name or pick manually.
          </p>
          <div className="overflow-x-auto border border-white/10 rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/50 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Raw Name</th>
                  <th className="px-3 py-2 text-left">Matched Team</th>
                  <th className="px-3 py-2 text-center">Placement</th>
                  <th className="px-3 py-2 text-center">Kills</th>
                  <th className="px-3 py-2 text-center">Placement Pts</th>
                  <th className="px-3 py-2 text-center">Total Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={!row.teamId ? 'bg-red-500/10' : ''}>
                    <td className="px-3 py-2">{row.teamNameRaw}</td>
                    <td className="px-3 py-2">
                      {row.teamId ? (
                        row.teamName
                      ) : (
                        <span className="text-red-400 text-xs">No match — create this team in Sanity</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        value={row.placement ?? ''}
                        onChange={(e) => updateRow(i, { placement: e.target.value ? Number(e.target.value) : null })}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        value={row.kills ?? ''}
                        onChange={(e) => updateRow(i, { kills: e.target.value ? Number(e.target.value) : null })}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        value={row.placementPoints ?? ''}
                        onChange={(e) => updateRow(i, { placementPoints: e.target.value ? Number(e.target.value) : null })}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        value={row.points ?? ''}
                        onChange={(e) => updateRow(i, { points: e.target.value ? Number(e.target.value) : null })}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={generateArticle}
              onChange={(e) => setGenerateArticle(e.target.checked)}
              className="accent-purple-500"
            />
            Also write a draft recap article for this match
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
          >
            {saving ? 'Saving…' : 'Save Match & Update Standings'}
          </button>
        </div>
      )}
    </div>
  );
}
