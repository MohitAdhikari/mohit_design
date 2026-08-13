import { formatInTimeZone } from 'date-fns-tz';

const IST_TZ = 'Asia/Kolkata';

function safeFormat(
  input: string | Date | null | undefined,
  pattern: string
): string {
  if (!input) return '';
  try {
    return formatInTimeZone(input, IST_TZ, pattern);
  } catch {
    return String(input);
  }
}

/**
 * Full IST date: "5 August 2026"
 * Works in the browser and in Node.js SSR.
 */
export function formatDateIST(input?: string | Date | null): string {
  return safeFormat(input, 'd MMMM yyyy');
}

/**
 * Short IST date: "5 Aug 2026"
 */
export function formatDateShortIST(input?: string | Date | null): string {
  return safeFormat(input, 'd MMM yyyy');
}

/**
 * Compact month + day: "Aug 05"
 */
export function formatDateDayMonthIST(input?: string | Date | null): string {
  return safeFormat(input, 'MMM dd');
}

/**
 * Short date with comma: "Aug 05, 2026"
 */
export function formatDateCompactIST(input?: string | Date | null): string {
  return safeFormat(input, 'MMM dd, yyyy');
}

/**
 * Full date + time: "5 August 2026 at 9:30 PM"
 */
export function formatDateTimeIST(input?: string | Date | null): string {
  return safeFormat(input, "d MMMM yyyy 'at' h:mm a");
}

/**
 * Time only: "9:30 PM"
 */
export function formatTimeIST(input?: string | Date | null): string {
  return safeFormat(input, 'h:mm a');
}

/**
 * Alias for full date (server-safe, kept for prompt compatibility).
 */
export function formatDateISTServer(input?: string | Date | null): string {
  return formatDateIST(input);
}

/**
 * IST calendar-day key: "2026-08-12". Useful for grouping/comparing dates
 * by day regardless of the exact time-of-day, in the IST timezone.
 */
export function dayKeyIST(input?: string | Date | null): string {
  return safeFormat(input, 'yyyy-MM-dd');
}
