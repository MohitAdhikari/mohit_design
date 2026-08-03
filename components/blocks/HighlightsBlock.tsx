import type React from 'react';

export type HighlightsStyle = 'premium' | 'minimal' | 'plain';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type BulletStyle = 'bullet' | 'number' | 'check' | 'none';

interface HighlightsBlockProps {
  title?: string;
  titleLevel?: HeadingLevel;
  items: string[];
  style?: HighlightsStyle;
  bulletStyle?: BulletStyle;
  desktopOnly?: boolean;
}

const STYLE_CLASSES: Record<HighlightsStyle, { section: string; heading: string; list: string; item: string }> = {
  premium: {
    section:
      'my-8 rounded-2xl border border-blue-200/60 dark:border-blue-500/20 bg-gradient-to-br from-blue-50/80 to-white dark:from-[#00E5FF]/[0.07] dark:to-transparent p-6 shadow-sm dark:shadow-[0_0_30px_rgba(0,229,255,0.05)]',
    heading: 'text-lg font-bold font-space-grotesk text-blue-700 dark:text-[#00E5FF] mb-4',
    list: 'space-y-2.5',
    item: 'flex items-start gap-3 text-gray-800 dark:text-gray-200 leading-relaxed',
  },
  minimal: {
    section: 'my-8 rounded-lg border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-[#0E0E12]',
    heading: 'text-base font-bold text-gray-900 dark:text-white mb-3',
    list: 'space-y-2',
    item: 'flex items-start gap-2.5 text-gray-700 dark:text-gray-300',
  },
  plain: {
    section: 'my-6',
    heading: 'text-base font-bold text-gray-900 dark:text-white mb-2',
    list: 'list-disc pl-5 space-y-1',
    item: 'text-gray-700 dark:text-gray-300',
  },
};

function Bullet({ style, index }: { style: BulletStyle; index: number }) {
  if (style === 'number') return <span className="mt-0.5 font-mono text-sm text-blue-600 dark:text-[#00E5FF] font-bold flex-shrink-0 min-w-[1.5rem]">{index + 1}.</span>;
  if (style === 'check') return <span aria-hidden className="mt-1 text-green-600 dark:text-[#00FF66] flex-shrink-0 text-sm">✓</span>;
  if (style === 'bullet') return <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-[#00E5FF] flex-shrink-0" />;
  return null;
}

export default function HighlightsBlock({
  title,
  titleLevel = 'h2',
  items,
  style = 'premium',
  bulletStyle = 'bullet',
  desktopOnly = false,
}: HighlightsBlockProps) {
  if (!items || items.length === 0) return null;
  const classes = STYLE_CLASSES[style] || STYLE_CLASSES.premium;
  const isPlain = style === 'plain';
  const TitleTag = titleLevel as React.ElementType;

  return (
    <section className={`${classes.section}${desktopOnly ? ' hidden md:block' : ''}`}>
      <TitleTag className={classes.heading}>{title || 'Highlights'}</TitleTag>
      <ul className={classes.list}>
        {items.map((item, i) => (
          <li key={i} className={classes.item}>
            {!isPlain && <Bullet style={bulletStyle} index={i} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
