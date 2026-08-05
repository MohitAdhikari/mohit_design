import { nanoid } from 'nanoid';

export type MarkDef = { _key: string; _type: string };
export type Span = { _type: 'span'; _key: string; text: string; marks: string[] };
export type PTBlock = {
  _type: 'block';
  _key: string;
  style: string;
  children: Span[];
  markDefs: MarkDef[];
};

/** Parses plain editor text (with markdown-lite syntax) into Portable Text blocks. */
export function textToBlocks(raw: string): PTBlock[] {
  const paragraphs = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return paragraphs.map((para): PTBlock => {
    // Heading detection: ## h2, ### h3, # h1
    const headingMatch = para.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const styleMap: Record<number, string> = { 1: 'h1', 2: 'h2', 3: 'h3' };
      return {
        _type: 'block', _key: nanoid(),
        style: styleMap[level] || 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: nanoid(), text: headingMatch[2], marks: [] }],
      };
    }

    // Inline marks: **bold**, _italic_, `code`
    const children = parseInlineMarks(para);
    return {
      _type: 'block', _key: nanoid(),
      style: 'normal',
      markDefs: [],
      children,
    };
  });
}

function parseInlineMarks(text: string): Span[] {
  // Simple regex-based inline parser for **bold**, _italic_, `code`
  const parts: Span[] = [];
  const regex = /\*\*(.+?)\*\*|_(.+?)_|`(.+?)`|([^*_`]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) parts.push({ _type: 'span', _key: nanoid(), text: match[1], marks: ['strong'] });
    else if (match[2]) parts.push({ _type: 'span', _key: nanoid(), text: match[2], marks: ['em'] });
    else if (match[3]) parts.push({ _type: 'span', _key: nanoid(), text: match[3], marks: ['code'] });
    else if (match[4]) parts.push({ _type: 'span', _key: nanoid(), text: match[4], marks: [] });
  }
  return parts.length ? parts : [{ _type: 'span', _key: nanoid(), text, marks: [] }];
}

/** Converts Portable Text blocks back to the plain editor format. */
export function blocksToEditorText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => {
      const text = (b.children || [])
        .map((c: any) => {
          let t = c.text || '';
          if (c.marks?.includes('strong')) t = `**${t}**`;
          if (c.marks?.includes('em')) t = `_${t}_`;
          if (c.marks?.includes('code')) t = `\`${t}\``;
          return t;
        })
        .join('');
      const headingMap: Record<string, string> = { h1: '# ', h2: '## ', h3: '### ' };
      return (headingMap[b.style] || '') + text;
    })
    .join('\n\n');
}
