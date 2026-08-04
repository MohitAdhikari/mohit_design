import { useFormValue } from 'sanity'
import { calculateReadingTime } from '../../lib/readingTime'

/**
 * Read-only Studio widget that derives estimated reading time live from the
 * sibling `content` field, using the same calculation as the public article
 * pages (see lib/readingTime.ts). Nothing is persisted to the dataset —
 * this is an internal editorial aid; the frontend recalculates it directly
 * from the published content.
 */
export function ReadingTimeInput() {
  const content = useFormValue(['content']) as any
  const minutes = calculateReadingTime(content)

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
