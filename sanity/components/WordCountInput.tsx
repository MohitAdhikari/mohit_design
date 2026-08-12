import { useEffect } from 'react'
import { useFormValue, set, PatchEvent, type NumberInputProps } from 'sanity'
import { calculateWordCount } from '../../lib/readingTime'

/**
 * Auto-computes and persists the `wordCount` number field from the article's
 * `content` Portable Text. The stored number is used by the frontend for fast
 * reading-time estimates without fetching full article bodies on list pages.
 */
export function WordCountInput(props: NumberInputProps) {
  const { value, onChange, readOnly } = props
  const content = useFormValue(['content']) as any

  const words = calculateWordCount(content)
  const minutes = Math.max(1, Math.round(words / 200))

  useEffect(() => {
    if (!readOnly && words !== value) {
      onChange(PatchEvent.from(set(words)))
    }
  }, [words, value, readOnly, onChange])

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
      <span>{words.toLocaleString()} words · {minutes} min read</span>
      <span style={{ opacity: 0.6, fontWeight: 400 }}>(auto-calculated · editors only)</span>
    </div>
  )
}
