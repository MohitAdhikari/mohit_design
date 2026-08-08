export interface CodeEntry {
  code: string;
  reward?: string;
  showReward?: boolean;
  isNew?: boolean;
  isExpired?: boolean;
  isRedeemed?: boolean;
  expiresAt?: string;
}

export function isExpiredNow(isExpired?: boolean, expiresAt?: string): boolean {
  if (isExpired) return true;
  if (expiresAt && new Date(expiresAt) < new Date()) return true;
  return false;
}

export function isRedeemedNow(isRedeemed?: boolean): boolean {
  return Boolean(isRedeemed);
}

export function isUsable(entry: CodeEntry): boolean {
  return !isExpiredNow(entry.isExpired, entry.expiresAt) && !isRedeemedNow(entry.isRedeemed);
}

export function sortCodeEntries(entries: CodeEntry[] = []): CodeEntry[] {
  return [...entries].sort((a, b) => {
    const aUsable = isUsable(a) ? 0 : 1;
    const bUsable = isUsable(b) ? 0 : 1;
    if (aUsable !== bUsable) return aUsable - bUsable;
    const aNew = a.isNew ? 0 : 1;
    const bNew = b.isNew ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    return a.code.localeCompare(b.code);
  });
}
