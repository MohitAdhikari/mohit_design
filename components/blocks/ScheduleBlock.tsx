import { format } from 'date-fns';
import type React from 'react';

export type ScheduleStyle = 'premium' | 'minimal' | 'plain';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface Match {
  time?: string;
  teamA?: string;
  teamB?: string;
  stage?: string;
  description?: string;
}

interface Day {
  label?: string;
  date?: string;
  matches?: Match[];
}

interface ScheduleBlockProps {
  title?: string;
  titleLevel?: HeadingLevel;
  style?: ScheduleStyle;
  desktopOnly?: boolean;
  days?: Day[];
}

const STYLE_CLASSES: Record<ScheduleStyle, { section: string; heading: string; day: string; match: string; time: string; vs: string }> = {
  premium: {
    section:
      'my-8 rounded-2xl border border-purple-200/60 dark:border-purple-500/20 bg-gradient-to-br from-purple-50/80 to-white dark:from-[#9D00FF]/[0.07] dark:to-transparent p-6 shadow-sm dark:shadow-[0_0_30px_rgba(157,0,255,0.05)]',
    heading: 'text-lg font-bold font-space-grotesk text-purple-700 dark:text-[#9D00FF] mb-4',
    day: 'mb-6 last:mb-0',
    match: 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-200 dark:border-gray-800/60 last:border-0',
    time: 'text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 w-24 flex-shrink-0',
    vs: 'text-sm text-gray-500 dark:text-gray-400',
  },
  minimal: {
    section: 'my-8 rounded-lg border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-[#0E0E12]',
    heading: 'text-base font-bold text-gray-900 dark:text-white mb-3',
    day: 'mb-6 last:mb-0',
    match: 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-100 dark:border-gray-800/40 last:border-0',
    time: 'text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24 flex-shrink-0',
    vs: 'text-sm text-gray-500 dark:text-gray-400',
  },
  plain: {
    section: 'my-6',
    heading: 'text-base font-bold text-gray-900 dark:text-white mb-2',
    day: 'mb-5 last:mb-0',
    match: 'py-2 border-b border-gray-100 dark:border-gray-800/40 last:border-0',
    time: 'text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400',
    vs: 'text-sm text-gray-500 dark:text-gray-400',
  },
};

function formatTime(iso?: string) {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'h:mm a');
  } catch {
    return iso;
  }
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return format(new Date(iso), 'MMM dd, yyyy');
  } catch {
    return iso;
  }
}

export default function ScheduleBlock({
  title,
  titleLevel = 'h2',
  style = 'premium',
  desktopOnly = false,
  days = [],
}: ScheduleBlockProps) {
  if (!days || days.length === 0) return null;
  const classes = STYLE_CLASSES[style] || STYLE_CLASSES.premium;
  const TitleTag = titleLevel as React.ElementType;

  return (
    <section className={`${classes.section}${desktopOnly ? ' hidden md:block' : ''}`}>
      <TitleTag className={classes.heading}>{title || 'Tournament Schedule'}</TitleTag>
      {days.map((day, i) => {
        const dateLabel = day.label || `Day ${i + 1}`;
        const dateText = formatDate(day.date);
        const sortedMatches = [...(day.matches || [])].sort((a, b) => {
          const ta = a.time ? new Date(a.time).getTime() : 0;
          const tb = b.time ? new Date(b.time).getTime() : 0;
          return ta - tb;
        });
        return (
          <div key={i} className={classes.day}>
            <h3 className="text-sm font-bold font-space-grotesk text-gray-900 dark:text-white mb-2">
              {dateLabel}
              {dateText && <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">{dateText}</span>}
            </h3>
            {sortedMatches.length > 0 ? (
              <ul className="space-y-0">
                {sortedMatches.map((match, mi) => (
                  <li key={mi} className={classes.match}>
                    <span className={classes.time}>{formatTime(match.time)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-gray-900 dark:text-white font-medium">
                        <span>{match.teamA || 'TBD'}</span>
                        <span className={classes.vs}>vs</span>
                        <span>{match.teamB || 'TBD'}</span>
                      </div>
                      {(match.stage || match.description) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {[match.stage, match.description].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No matches listed.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
