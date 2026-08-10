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

  return (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] not-prose">
      {!value.hideTitle && value.title && (
        <p className="px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800/60">
          {value.title}
        </p>
      )}
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
  )
}
