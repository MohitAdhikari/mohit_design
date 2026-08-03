export function getSortTimestamp(dateIso?: string, fallbackIso?: string): number {
  const fallbackDate = fallbackIso ? new Date(fallbackIso) : new Date();
  if (isNaN(fallbackDate.getTime())) {
    return fallbackIso ? 0 : Date.now();
  }
  if (!dateIso) return fallbackDate.getTime();

  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return fallbackDate.getTime();

  // If the chosen date has no meaningful time (midnight UTC), assume the
  // editor only picked a date and use the fallback time so newly created,
  // back-dated posts still land at the top of that date instead of the start.
  if (d.toISOString().endsWith('T00:00:00.000Z')) {
    const combined = new Date(d);
    combined.setUTCHours(
      fallbackDate.getUTCHours(),
      fallbackDate.getUTCMinutes(),
      fallbackDate.getUTCSeconds(),
      fallbackDate.getUTCMilliseconds()
    );
    return combined.getTime();
  }

  return d.getTime();
}

export function sortByTimestamp<T extends { _createdAt?: string; [key: string]: any }>(
  items: T[],
  dateField: keyof T = 'publishDate'
): T[] {
  return [...items].sort((a, b) => {
    const ta = getSortTimestamp((a as any)[dateField] as string | undefined, a._createdAt);
    const tb = getSortTimestamp((b as any)[dateField] as string | undefined, b._createdAt);
    return tb - ta;
  });
}
