/**
 * Shared reading-time estimation, used by both the Sanity Studio editorial
 * widget (`sanity/components/ReadingTimeInput.tsx`) and the public
 * news/guide article pages, so the calculation is defined exactly once.
 */
function extractPlainText(content: any): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((block: any) => (block?.children || []).map((c: any) => c?.text || '').join(' '))
    .join(' ')
    .trim();
}

const WORDS_PER_MINUTE = 200;

/**
 * Counts words in Portable Text content (or any string/array shape).
 */
export function calculateWordCount(content: any): number {
  const text = extractPlainText(content);
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time in minutes from Portable Text content or a
 * precomputed word count, using the standard ~200 words-per-minute average
 * reading speed.
 */
export function calculateReadingTime(input: any): number {
  const words = typeof input === 'number' ? input : calculateWordCount(input);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
