type TableRow = {
  _key?: string
  cells: string[]
}

type TableValue = {
  title?: string
  rawText?: string
  headers?: string[]
  rows?: TableRow[]
}

function splitLine(line: string): string[] {
  const delimiter = line.includes('|') ? '|' : '\t'
  const cells = line.split(delimiter).map((cell) => cell.trim())
  if (cells[0] === '') cells.shift()
  if (cells[cells.length - 1] === '') cells.pop()
  return cells
}

function parseTable(raw?: string): { headers: string[]; rows: TableRow[] } {
  if (!raw) return { headers: [], rows: [] }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Drop Markdown separator lines like |---|---|---|
  const filtered = lines.filter((line) => !/^\|?[-:\s|]+\|?$/.test(line))
  if (filtered.length === 0) return { headers: [], rows: [] }

  const headers = splitLine(filtered[0])
  const rows = filtered.slice(1).map((line, i) => ({
    _key: `row-${i}`,
    cells: splitLine(line),
  }))

  return { headers, rows }
}

export default function PortableTextTable({ value }: { value: TableValue }) {
  if (!value) return null

  // Support plugin-style rows (first row = header) or our rawText field
  const pluginStyleRows = value.rows || []
  const pluginHeaders = value.headers || pluginStyleRows[0]?.cells || []
  const pluginBodyRows = value.headers ? pluginStyleRows : pluginStyleRows.slice(1)

  const parsed = parseTable(value.rawText)
  const headers = parsed.headers.length ? parsed.headers : pluginHeaders
  const rows = parsed.rows.length ? parsed.rows : pluginBodyRows

  if (!headers.length && !rows.length) return null

  return (
    <div className="overflow-x-auto my-6">
      {value.title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {value.title}
        </h3>
      )}
      <table className="w-full text-sm border-collapse border border-gray-700 dark:border-gray-700 rounded-md overflow-hidden">
        {headers.length > 0 && (
          <thead className="bg-gray-900 text-white">
            <tr>
              {headers.map((cell, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left font-semibold border border-gray-700"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-800">
          {rows.map((row, rowIndex) => (
            <tr
              key={row._key || `row-${rowIndex}`}
              className={rowIndex % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}
            >
              {row.cells.map((cell, i) => (
                <td
                  key={i}
                  className="px-4 py-2 border border-gray-800 text-gray-300"
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
