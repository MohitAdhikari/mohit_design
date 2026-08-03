export interface CodeEntry {
  code: string;
  reward?: string;
  showReward?: boolean;
  isNew?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
}

export function isExpiredNow(isExpired?: boolean, expiresAt?: string): boolean {
  if (isExpired) return true;
  if (expiresAt && new Date(expiresAt) < new Date()) return true;
  return false;
}

export function sortCodeEntries(entries: CodeEntry[] = []): CodeEntry[] {
  return [...entries].sort((a, b) => {
    const aExpired = isExpiredNow(a.isExpired, a.expiresAt) ? 1 : 0;
    const bExpired = isExpiredNow(b.isExpired, b.expiresAt) ? 1 : 0;
    if (aExpired !== bExpired) return aExpired - bExpired;
    const aNew = a.isNew ? 0 : 1;
    const bNew = b.isNew ? 0 : 1;
    return aNew - bNew;
  });
}
