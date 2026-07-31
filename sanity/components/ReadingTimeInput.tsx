import { useFormValue } from 'sanity'

function extractPlainText(content: any): string {
  if (!Array.isArray(content)) return ''
  return content
    .map((block: any) =>
      (block?.children || []).map((c: any) => c?.text || '').join(' ')
    )
    .join(' ')
    .trim()
}

function calcReadingTime(content: any): number {
  const text = extractPlainText(content)
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Read-only Studio widget that derives estimated reading time live from the
 * sibling `content` field. Nothing is persisted to the dataset — this is a
 * purely internal editorial aid and must never be surfaced on the frontend.
 */
export function ReadingTimeInput() {
  const content = useFormValue(['content']) as any
  const minutes = calcReadingTime(content)

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 8,
        background: 'var(--card-bg-color, #f4f4f5)',
        border: '1px solid var(--card-border-color, #e4e4e7)',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--card-fg-color, #18181b)',
      }}
    >
      <span aria-hidden>⏱</span>
      <span>{minutes} min read</span>
      <span style={{ opacity: 0.6, fontWeight: 400 }}>
        (auto-calculated · editors only)
      </span>
    </div>
  )
}
