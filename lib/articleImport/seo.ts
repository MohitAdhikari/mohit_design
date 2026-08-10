import type { ImportedBlock } from './parser';

/**
 * Rule-based SEO autofill for imported articles. Everything here is a
 * simple heuristic (no external calls) and every field it produces stays
 * fully editable in the resulting draft — this only saves the writer from
 * typing the obvious defaults.
 */

export interface SeoSuggestion {
  slug: string;
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
  wordCount: number;
  readingTimeMinutes: number;
  suggestedTagIds: string[];
  issues: SeoIssue[];
}

export interface SeoIssue {
  field: string;
  message: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
}

function plainTextOf(blocks: ImportedBlock[]): string {
  return blocks
    .filter((b): b is Extract<ImportedBlock, { _type: 'block' }> => b._type === 'block')
    .map((b) => b.children.map((c) => c.text).join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(blocks: ImportedBlock[]): string {
  const block = blocks.find(
    (b): b is Extract<ImportedBlock, { _type: 'block' }> =>
      b._type === 'block' && b.style === 'normal' && !b.listItem
  );
  if (!block) return '';
  return block.children.map((c) => c.text).join('');
}

export function calculateWordCount(blocks: ImportedBlock[]): number {
  const text = plainTextOf(blocks);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function calculateReadingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Suggests existing tags whose title appears (case-insensitively, as a
 * whole word) in the article text. Only ever suggests tags that already
 * exist — it never invents new ones — so the editor just ticks/unticks.
 */
const REGEX_SPECIAL_CHARS = /[.*+?^$()|[\]\\{}]/g;

function escapeRegExp(input: string): string {
  return input.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

export function suggestTags(
  blocks: ImportedBlock[],
  title: string,
  existingTags: { _id: string; title: string }[]
): string[] {
  const haystack = (title + ' ' + plainTextOf(blocks)).toLowerCase();
  return existingTags
    .filter((tag) => {
      const needle = tag.title.toLowerCase();
      if (!needle) return false;
      const pattern = '\\b' + escapeRegExp(needle) + '\\b';
      const re = new RegExp(pattern, 'i');
      return re.test(haystack);
    })
    .map((tag) => tag._id)
    .slice(0, 8);
}

export function buildSeoSuggestion(
  title: string,
  blocks: ImportedBlock[],
  existingTags: { _id: string; title: string }[]
): SeoSuggestion {
  const wordCount = calculateWordCount(blocks);
  const readingTimeMinutes = calculateReadingTimeMinutes(wordCount);
  const lead = firstParagraph(blocks);
  const excerpt = lead.slice(0, 200).trim();
  const seoTitle = title.length <= 60 ? title : `${title.slice(0, 57)}...`;
  const metaDescription = excerpt.length <= 160 ? excerpt : `${excerpt.slice(0, 157)}...`;
  const suggestedTagIds = suggestTags(blocks, title, existingTags);

  const issues: SeoIssue[] = [];
  if (!title.trim()) issues.push({ field: 'title', message: 'No title detected — add one before publishing.' });
  if (title.length > 60) issues.push({ field: 'seoTitle', message: `Title is ${title.length} characters; SEO titles over ~60 characters get truncated in search results.` });
  if (!excerpt) issues.push({ field: 'excerpt', message: 'Could not find a lead paragraph to build an excerpt from — write one manually.' });
  if (wordCount < 150) issues.push({ field: 'content', message: `Only ${wordCount} words detected — this reads as thin content for SEO.` });
  if (suggestedTagIds.length === 0) issues.push({ field: 'tags', message: 'No matching existing tags found — consider adding some manually.' });

  return {
    slug: slugify(title),
    excerpt,
    seoTitle,
    metaDescription,
    wordCount,
    readingTimeMinutes,
    suggestedTagIds,
    issues,
  };
}
