import { formatInTimeZone } from 'date-fns-tz';

const IST_TZ = 'Asia/Kolkata';

export function formatMD(input?: string | Date): string {
  if (!input) return '';
  try {
    return formatInTimeZone(new Date(input), IST_TZ, 'MMM d');
  } catch {
    return String(input);
  }
}

export function formatMDY(input?: string | Date): string {
  if (!input) return '';
  try {
    return formatInTimeZone(new Date(input), IST_TZ, 'MMM d, yyyy');
  } catch {
    return String(input);
  }
}
