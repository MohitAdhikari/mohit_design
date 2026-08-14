'use client'

import { useMemo } from 'react'

type TableValue = {
  title?: string
  hideTitle?: boolean
  rawText?: string
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

export default function PortableTextTable({ value }: { value: TableValue }) {
  const { lines, headerLine, bodyLines, headers, rows } = useMemo(() => {
    if (!value?.rawText) {
      return { lines: [], headerLine: null, bodyLines: [], headers: [], rows: [] }
    }

    const allLines = value.rawText
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '')

    const cleanLines = allLines.filter((line) => !isSeparatorLine(line))

    if (cleanLines.length < 2) {
      return { lines: allLines, headerLine: null, bodyLines: [], headers: [], rows: [] }
    }

    const [h, ...b] = cleanLines
    const headerCells = parseRow(h)
    const bodyRows = b.map(parseRow)

    return {
      lines: allLines,
      headerLine: h,
      bodyLines: b,
      headers: headerCells,
      rows: bodyRows,
    }
  }, [value?.rawText])

  if (!value?.rawText) return null
  if (lines.length < 2) return null

  return (
    <div className="my-8 w-full rounded-xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] not-prose">
      {!value.hideTitle && value.title && (
        <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800/60">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {value.title}
          </p>
        </div>
      )}
      {/* Mobile: polished stacked cards — first column shown as the card's
          title, remaining columns as compact labelled chips (no horizontal
          scroll needed). */}
      <div className="flex flex-col gap-2.5 p-3 sm:hidden">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="rounded-xl border border-gray-100 dark:border-gray-800/40 bg-white dark:bg-[#13131A]/60 p-3.5 shadow-sm transition-colors"
          >
            {headers[0] !== undefined && row[0] !== undefined && (
              <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800/40">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
                  {headers[0]}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white text-right break-words">
                  {row[0]}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {row.slice(1).map((cell, ci) => (
                <span
                  key={ci}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0E0E12] text-gray-500 dark:text-gray-400"
                >
                  <span className="uppercase tracking-wider opacity-70">{headers[ci + 1]}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{cell}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: real table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#13131A]">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2.5 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800/60 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri % 2 === 0 ? 'bg-white dark:bg-[#0E0E12]' : 'bg-gray-50/60 dark:bg-[#13131A]/50'}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800/40 whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
