export type HighlightsStyle = 'premium' | 'minimal' | 'plain';

interface HighlightsBlockProps {
  title?: string;
  items: string[];
  style?: HighlightsStyle;
}

const STYLE_CLASSES: Record<HighlightsStyle, { section: string; heading: string; list: string; item: string }> = {
  premium: {
    section:
      'my-8 rounded-2xl border-l-4 border-blue-500 dark:border-[#00E5FF] bg-blue-50/60 dark:bg-[#00E5FF]/[0.06] p-6 shadow-sm',
    heading: 'text-lg font-bold font-space-grotesk text-blue-700 dark:text-[#00E5FF] mb-4',
    list: 'space-y-2.5',
    item: 'flex items-start gap-3 text-gray-800 dark:text-gray-200 leading-relaxed',
  },
  minimal: {
    section: 'my-8 rounded-lg border border-gray-200 dark:border-gray-800 p-5',
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

/**
 * PhoneOcean signature Highlights block. Renders semantic HTML
 * (<section>/<h2>/<ul>/<li>) regardless of style — only presentation
 * classes change. No JS dependency.
 */
export default function HighlightsBlock({ title, items, style = 'premium' }: HighlightsBlockProps) {
  if (!items || items.length === 0) return null;
  const classes = STYLE_CLASSES[style] || STYLE_CLASSES.premium;
  const isPlain = style === 'plain';

  return (
    <section className={classes.section}>
      <h2 className={classes.heading}>{title || 'Highlights'}</h2>
      <ul className={classes.list}>
        {items.map((item, i) => (
          <li key={i} className={classes.item}>
            {!isPlain && (
              <span
                aria-hidden
                className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-[#00E5FF] flex-shrink-0"
              />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
