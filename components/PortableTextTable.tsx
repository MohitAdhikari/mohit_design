type TableValue = {
  title?: string
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
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-zinc-700">
      {value.title && (
        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-700">
          {value.title}
        </p>
      )}
      <table className="w-full min-w-[500px] text-sm border-collapse">
        <thead>
          <tr className="bg-zinc-900">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left font-semibold text-white border-b border-zinc-700 whitespace-nowrap"
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
              className={ri % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-800/50'}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-2 text-zinc-200 border-b border-zinc-700/50 whitespace-nowrap"
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
