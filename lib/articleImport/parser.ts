/**
 * Deterministic, pure markdown-lite → Portable Text parser for the Sanity
 * Studio "Paste AI Article" tool. No API calls, no LLM — just parsing and
 * normalization rules, so the output is 100% reproducible for the same
 * input text.
 *
 * Supports: heading levels 1-6, bold, italic, inline code, [text](url)
 * links, bullet and numbered lists, blockquotes, fenced code blocks,
 * horizontal rule dividers (dropped — no divider block in the schema), and
 * pipe tables (converted into a `standingsTable` block for TournamentTable
 * rendering).
 *
 * Also strips common AI chat-assistant artifacts ("Certainly!", "Here's
 * your article:", "In conclusion,", stray double spaces, smart-quote
 * normalization) and enforces the site's single-H1 rule by demoting any
 * H1 found in the body to H2 (the real H1 is the document's `title` field).
 */

let keyCounter = 0;
function genKey(): string {
  keyCounter += 1;
  return `k${Date.now().toString(36)}${keyCounter.toString(36)}`;
}

export type MarkDef = { _key: string; _type: string; href?: string };
export type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
export type PTBlock = {
  _type: 'block';
  _key: string;
  style: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Span[];
  markDefs: MarkDef[];
};
export type StandingsTableBlock = {
  _type: 'standingsTable';
  _key: string;
  title?: string;
  hideTitle?: boolean;
  rawText: string;
};

export type ImportedBlock = PTBlock | StandingsTableBlock;

export interface ImportWarning {
  type: 'missing-alt' | 'demoted-h1' | 'dropped-empty' | 'ai-artifact-stripped' | 'unsupported-syntax';
  message: string;
}

export interface ParseResult {
  blocks: ImportedBlock[];
  warnings: ImportWarning[];
  detectedTitle: string | null; // first H1 found, if any — candidate for the title field
}

// Phrases AI chat tools commonly prepend/append that don't belong in the
// published article body.
const AI_ARTIFACT_LINES = [
  /^(certainly|sure|of course|absolutely)[!.,]?\s*(here('?s| is).*)?$/i,
  /^here'?s (your|the) (article|draft|content|blog post)[:.]?$/i,
  /^i('ve| have) (written|drafted|created) .*(article|draft)[:.]?$/i,
  /^let me know if you('d| would) like.*$/i,
  /^hope (this|that) helps!?$/i,
  /^\*?\*?in conclusion,?\*?\*?$/i,
];

function stripAiArtifacts(lines: string[], warnings: ImportWarning[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && AI_ARTIFACT_LINES.some((re) => re.test(trimmed))) {
      warnings.push({ type: 'ai-artifact-stripped', message: `Removed likely AI preamble/closer: "${trimmed.slice(0, 60)}"` });
      continue;
    }
    out.push(line);
  }
  return out;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    // Smart quotes/dashes → plain ASCII equivalents for consistent typography
    // handling downstream (the site's CSS already renders proper typographic
    // quotes via `font-feature-settings`/quotes, no need to keep curly ones).
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '—')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/ {2,}/g, ' ');
}

function parseInline(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  const regex = /\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`|([^[*_`]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined && match[2] !== undefined) {
      const key = genKey();
      markDefs.push({ _key: key, _type: 'link', href: match[2] });
      children.push({ _type: 'span', _key: genKey(), text: match[1], marks: [key] });
    } else if (match[3] !== undefined) {
      children.push({ _type: 'span', _key: genKey(), text: match[3], marks: ['strong'] });
    } else if (match[4] !== undefined) {
      children.push({ _type: 'span', _key: genKey(), text: match[4], marks: ['em'] });
    } else if (match[5] !== undefined) {
      children.push({ _type: 'span', _key: genKey(), text: match[5], marks: ['em'] });
    } else if (match[6] !== undefined) {
      children.push({ _type: 'span', _key: genKey(), text: match[6], marks: ['code'] });
    } else if (match[7] !== undefined) {
      children.push({ _type: 'span', _key: genKey(), text: match[7], marks: [] });
    }
  }
  return {
    children: children.length ? children : [{ _type: 'span', _key: genKey(), text, marks: [] }],
    markDefs,
  };
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith('|') || (line.includes('|') && line.split('|').length >= 3);
}

function isTableSeparator(line: string): boolean {
  const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

export function parseArticleText(rawInput: string): ParseResult {
  const warnings: ImportWarning[] = [];
  const text = normalizeText(rawInput);
  let lines = text.split('\n');
  lines = stripAiArtifacts(lines, warnings);

  const blocks: ImportedBlock[] = [];
  let paraBuffer: string[] = [];
  let detectedTitle: string | null = null;
  let seenH1 = false;
  let i = 0;

  function flushParagraph() {
    if (paraBuffer.length === 0) return;
    const t = paraBuffer.join(' ').trim();
    paraBuffer = [];
    if (!t) return;
    const { children, markDefs } = parseInline(t);
    blocks.push({ _type: 'block', _key: genKey(), style: 'normal', markDefs, children });
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    // Fenced code block: ```lang ... ```. There's no dedicated "raw code
    // snippet" block in the schema (`codeCopyBlock` is a game redeem-code
    // widget, not a syntax-highlighted code block) — so each line is kept
    // as its own monospaced paragraph instead of being dropped.
    const fenceMatch = line.match(/^```\s*([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      flushParagraph();
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        const codeLine = lines[i];
        blocks.push({
          _type: 'block',
          _key: genKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: genKey(), text: codeLine || ' ', marks: ['code'] }],
        });
        i += 1;
      }
      i += 1; // skip closing fence
      warnings.push({ type: 'unsupported-syntax', message: 'Rendered a fenced code block as plain monospaced paragraphs (no dedicated code-block schema type exists).' });
      continue;
    }

    // Pipe table → standingsTable block (rendered by TournamentTable)
    if (isTableRow(line)) {
      flushParagraph();
      const tableLines: string[] = [];
      while (i < lines.length && (isTableRow(lines[i]) || isTableSeparator(lines[i]))) {
        if (!isTableSeparator(lines[i])) tableLines.push(lines[i].trim());
        i += 1;
      }
      if (tableLines.length >= 2) {
        blocks.push({
          _type: 'standingsTable',
          _key: genKey(),
          rawText: tableLines.join('\n'),
        });
      } else {
        // Not actually a table (e.g. a single line with a stray pipe) —
        // treat as plain text instead of dropping it.
        paraBuffer.push(...tableLines);
      }
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      let style: string;
      if (level === 1) {
        if (!seenH1) {
          detectedTitle = headingMatch[2].trim();
          seenH1 = true;
        }
        // Site rule: only one H1 per page, and it's the document title field
        // — demote every H1 found in the body to H2.
        warnings.push({ type: 'demoted-h1', message: `Demoted "# ${headingMatch[2]}" to H2 (only the title field should be an H1).` });
        style = 'h2';
      } else if (level === 2) {
        style = 'h2';
      } else {
        // H4+ isn't part of the site's type scale — collapse to H3.
        style = 'h3';
      }
      const { children, markDefs } = parseInline(headingMatch[2]);
      blocks.push({ _type: 'block', _key: genKey(), style, markDefs, children });
      i += 1;
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s?(.*)/);
    if (quoteMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(quoteMatch[1]);
      blocks.push({ _type: 'block', _key: genKey(), style: 'blockquote', markDefs, children });
      i += 1;
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*+]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(bulletMatch[1]);
      blocks.push({ _type: 'block', _key: genKey(), style: 'normal', listItem: 'bullet', level: 1, markDefs, children });
      i += 1;
      continue;
    }

    // Numbered list
    const numberMatch = line.match(/^\d+[.)]\s+(.*)/);
    if (numberMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(numberMatch[1]);
      blocks.push({ _type: 'block', _key: genKey(), style: 'normal', listItem: 'number', level: 1, markDefs, children });
      i += 1;
      continue;
    }

    // Horizontal rule — dropped (no divider block type in the schema)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph();
      i += 1;
      continue;
    }

    paraBuffer.push(line);
    i += 1;
  }
  flushParagraph();

  // Drop any accidental empty blocks (e.g. a heading with no text).
  const nonEmptyBlocks = blocks.filter((b) => {
    if (b._type === 'block') {
      const hasText = b.children.some((c) => c.text.trim() !== '');
      if (!hasText) warnings.push({ type: 'dropped-empty', message: 'Removed an empty block.' });
      return hasText;
    }
    return true;
  });

  // Dedupe consecutive identical headings (a common AI-output glitch where
  // the same section title is repeated back-to-back).
  const deduped: ImportedBlock[] = [];
  for (const b of nonEmptyBlocks) {
    const prev = deduped[deduped.length - 1];
    if (
      b._type === 'block' && prev?._type === 'block' &&
      (b.style === 'h2' || b.style === 'h3') && b.style === prev.style &&
      b.children.map((c) => c.text).join('') === prev.children.map((c) => c.text).join('')
    ) {
      continue;
    }
    deduped.push(b);
  }

  return { blocks: deduped, warnings, detectedTitle };
}
