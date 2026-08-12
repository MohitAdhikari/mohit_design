import { nanoid } from 'nanoid';

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

/**
 * Parses plain editor text (markdown-lite) into Portable Text blocks.
 * Supports the subset of markdown that AI writing tools (ChatGPT, Claude,
 * Gemini, etc.) actually produce: headings, bold/italic/code, bullet and
 * numbered lists, blockquotes, and [text](url) links. Unsupported syntax
 * (tables, images, nested lists) is left as plain text rather than crashing.
 */
export function textToBlocks(raw: string): PTBlock[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: PTBlock[] = [];
  let paraBuffer: string[] = [];

  function flushParagraph() {
    if (paraBuffer.length === 0) return;
    const text = paraBuffer.join(' ').trim();
    paraBuffer = [];
    if (!text) return;
    const { children, markDefs } = parseInline(text);
    blocks.push({ _type: 'block', _key: nanoid(), style: 'normal', markDefs, children });
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      flushParagraph();
      continue;
    }

    // Headings: # / ## / ###
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const styleMap: Record<number, string> = { 1: 'h1', 2: 'h2', 3: 'h3' };
      const { children, markDefs } = parseInline(headingMatch[2]);
      blocks.push({ _type: 'block', _key: nanoid(), style: styleMap[level] || 'h2', markDefs, children });
      continue;
    }

    // Blockquote: > text
    const quoteMatch = line.match(/^>\s?(.*)/);
    if (quoteMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(quoteMatch[1]);
      blocks.push({ _type: 'block', _key: nanoid(), style: 'blockquote', markDefs, children });
      continue;
    }

    // Bullet list: -, *, or + followed by a space
    const bulletMatch = line.match(/^[-*+]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(bulletMatch[1]);
      blocks.push({ _type: 'block', _key: nanoid(), style: 'normal', listItem: 'bullet', level: 1, markDefs, children });
      continue;
    }

    // Numbered list: 1. text / 1) text
    const numberMatch = line.match(/^\d+[.)]\s+(.*)/);
    if (numberMatch) {
      flushParagraph();
      const { children, markDefs } = parseInline(numberMatch[1]);
      blocks.push({ _type: 'block', _key: nanoid(), style: 'normal', listItem: 'number', level: 1, markDefs, children });
      continue;
    }

    // Horizontal rule — skip (no divider block in the schema)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph();
      continue;
    }

    // Plain text line — accumulate into the current paragraph
    paraBuffer.push(line);
  }
  flushParagraph();

  return blocks;
}

/**
 * Parses a line of inline markdown into spans + markDefs.
 * Supports **bold**, _italic_/*italic*, `code`, and [text](url) links.
 */
function parseInline(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  // Order matters: links first (they may contain other chars), then bold,
  // then italic (single * or _), then code, then plain text.
  const regex = /\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`|([^[*_`]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined && match[2] !== undefined) {
      const key = nanoid();
      markDefs.push({ _key: key, _type: 'link', href: match[2] });
      children.push({ _type: 'span', _key: nanoid(), text: match[1], marks: [key] });
    } else if (match[3] !== undefined) {
      children.push({ _type: 'span', _key: nanoid(), text: match[3], marks: ['strong'] });
    } else if (match[4] !== undefined) {
      children.push({ _type: 'span', _key: nanoid(), text: match[4], marks: ['em'] });
    } else if (match[5] !== undefined) {
      children.push({ _type: 'span', _key: nanoid(), text: match[5], marks: ['em'] });
    } else if (match[6] !== undefined) {
      children.push({ _type: 'span', _key: nanoid(), text: match[6], marks: ['code'] });
    } else if (match[7] !== undefined) {
      children.push({ _type: 'span', _key: nanoid(), text: match[7], marks: [] });
    }
  }
  return {
    children: children.length ? children : [{ _type: 'span', _key: nanoid(), text, marks: [] }],
    markDefs,
  };
}

/** Converts Portable Text blocks back to the plain editor format. */
export function blocksToEditorText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';
  const lines: string[] = [];
  let prevWasListItem = false;

  for (const b of blocks) {
    if (b._type !== 'block') continue;
    const text = spansToText(b.children, b.markDefs);
    const isListItem = Boolean(b.listItem);

    if (isListItem) {
      const prefix = b.listItem === 'number' ? '1. ' : '- ';
      lines.push(prefix + text);
    } else if (b.style === 'blockquote') {
      if (prevWasListItem) lines.push('');
      lines.push(`> ${text}`);
      lines.push('');
    } else {
      if (prevWasListItem) lines.push('');
      const headingMap: Record<string, string> = { h1: '# ', h2: '## ', h3: '### ' };
      lines.push((headingMap[b.style] || '') + text);
      lines.push('');
    }
    prevWasListItem = isListItem;
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function spansToText(children: any[], markDefs: any[] = []): string {
  return (children || [])
    .map((c: any) => {
      let t = c.text || '';
      const linkDef = (markDefs || []).find((d: any) => c.marks?.includes(d._key) && d._type === 'link');
      if (c.marks?.includes('strong')) t = `**${t}**`;
      if (c.marks?.includes('em')) t = `_${t}_`;
      if (c.marks?.includes('code')) t = `\`${t}\``;
      if (linkDef) t = `[${t}](${linkDef.href})`;
      return t;
    })
    .join('');
}
