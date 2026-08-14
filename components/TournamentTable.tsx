type TableValue = {
  title?: string
  hideTitle?: boolean
  rawText?: string
  displayStyle?: 'auto' | 'standings' | 'generic'
}

function parseRow(line: string): string[] {
  return line.includes('|')
    ? line.split('|').map((c) => c.trim()).filter((_, i, arr) => !(i === 0 && arr[0] === '') && !(i === arr.length - 1 && arr[arr.length - 1] === ''))
    : line.split('\t').map((c) => c.trim())
}

function isSeparatorLine(line: string): boolean {
  const cells = parseRow(line)
  return cells.length > 0 && cells.every((c) => c === '' || /^:?-+:?$/.test(c))
}

// Known PUBG/BGMI-style column header aliases, used to decide which
// columns are most important to show first on a phone-sized card, and
// which columns should be right-aligned (numeric) on desktop.
const RANK_ALIASES = ['#', 'rank', 'pos', 'position'];
const TEAM_ALIASES = ['team', 'squad', 'player', 'name'];
const PRIMARY_ALIASES = ['wwcd', 'pts', 'points', 'total', 'total pts'];
const NUMERIC_HINT = /^(#|rank|pos|position|wwcd|pp|fp|kills?|pts|points|total|placement|finish)/i;

function classifyColumn(header: string): 'rank' | 'team' | 'primary' | 'numeric' | 'text' {
  const h = header.trim().toLowerCase();
  if (RANK_ALIASES.includes(h)) return 'rank';
  if (TEAM_ALIASES.includes(h)) return 'team';
  if (PRIMARY_ALIASES.includes(h)) return 'primary';
  if (NUMERIC_HINT.test(h)) return 'numeric';
  return 'text';
}

const RANK_MEDALS: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' };

export default function TournamentTable({ value }: { value: TableValue }) {
  if (!value?.rawText) return null

  const lines = value.rawText
    .trim()
    .split('\n')
    .filter((line) => line.trim() !== '')
    .filter((line) => !isSeparatorLine(line))

  if (lines.length < 2) return null

  const [headerLine, ...bodyLines] = lines
  const headers = parseRow(headerLine)
  const rows = bodyLines.map(parseRow)
  const columnTypes = headers.map(classifyColumn)

  const rankColIndex = columnTypes.indexOf('rank');
  const teamColIndex = columnTypes.indexOf('team');
  // Only genuine standings-style tables (with a detected rank and/or team
  // column) get the medal-badge + team-name mobile header treatment.
  // Generic tables (e.g. a Match/Map/Time schedule) have neither, so they
  // fall back to a plain "first column as title" card instead of
  // misapplying medals to arbitrary row numbers. Editors can override the
  // auto-detected guess per-table via `displayStyle` in Studio.
  const hasRankOrTeam =
    value.displayStyle === 'standings'
      ? true
      : value.displayStyle === 'generic'
      ? false
      : rankColIndex >= 0 || teamColIndex >= 0;

  // Everything that isn't the rank/team column becomes a labelled "chip" on
  // the mobile card, primary stats (WWCD/Points/Total) surfaced first.
  // For generic tables (no rank/team), the first column becomes the card
  // title instead, so it's excluded from the chip row too.
  const chipOrder = headers
    .map((_, i) => i)
    .filter((i) => i !== rankColIndex && i !== teamColIndex && (hasRankOrTeam || i !== 0))
    .sort((a, b) => {
      const aPrimary = columnTypes[a] === 'primary' ? 0 : 1;
      const bPrimary = columnTypes[b] === 'primary' ? 0 : 1;
      return aPrimary - bPrimary;
    });

  return (
    <div className="my-8 w-full not-prose">
      {!value.hideTitle && value.title && (
        <p className="px-1 pb-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-500">
          {value.title}
        </p>
      )}

      {/* Mobile: card list (no horizontal scroll) */}
      <div className="flex flex-col gap-2 sm:hidden">
        {rows.map((row, ri) => {
          const rank = rankColIndex >= 0 ? row[rankColIndex] : String(ri + 1);
          const team = teamColIndex >= 0 ? row[teamColIndex] : null;
          return (
            <div
              key={ri}
              className="rounded-xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] p-3.5"
            >
              {hasRankOrTeam ? (
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-600 font-mono w-6 flex-shrink-0">
                      {RANK_MEDALS[rank] || `#${rank}`}
                    </span>
                    {team && (
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {team}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                headers[0] !== undefined && row[0] !== undefined && (
                  <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800/40">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
                      {headers[0]}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white text-right break-words">
                      {row[0]}
                    </span>
                  </div>
                )
              )}
              <div className="flex flex-wrap gap-1.5">
                {chipOrder.map((ci) => (
                  <span
                    key={ci}
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md border ${
                      columnTypes[ci] === 'primary'
                        ? 'border-blue-200 dark:border-[#00E5FF]/30 bg-blue-50 dark:bg-[#00E5FF]/10 text-blue-700 dark:text-[#00E5FF] font-bold'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13131A] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="uppercase tracking-wider opacity-70">{headers[ci]}</span>
                    <span>{row[ci]}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: real table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12]">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">{value.title || 'Tournament standings table'}</caption>
          <thead>
            <tr className="bg-gray-50 dark:bg-[#13131A] sticky top-0">
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-2.5 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800/60 whitespace-nowrap ${
                    columnTypes[i] === 'numeric' || columnTypes[i] === 'primary' ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const rank = rankColIndex >= 0 ? row[rankColIndex] : String(ri + 1);
              return (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? 'bg-white dark:bg-[#0E0E12]' : 'bg-gray-50/60 dark:bg-[#13131A]/50'}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/40 whitespace-nowrap ${
                        columnTypes[ci] === 'primary'
                          ? 'text-right font-bold text-blue-700 dark:text-[#00E5FF]'
                          : columnTypes[ci] === 'numeric'
                          ? 'text-right font-mono text-gray-700 dark:text-gray-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {ci === rankColIndex && RANK_MEDALS[rank] ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span>{RANK_MEDALS[rank]}</span>
                          <span className="text-gray-400 dark:text-gray-600">{cell}</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
