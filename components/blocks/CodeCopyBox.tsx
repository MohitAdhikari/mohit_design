'use client';

import CopyButton from '@/components/CopyButton';
import { isExpiredNow, type CodeEntry } from '@/lib/codeEntries';

interface CodeCopyBoxProps extends CodeEntry {}

export default function CodeCopyBox({
  code,
  reward,
  showReward = true,
  isNew,
  isExpired,
  expiresAt,
}: CodeCopyBoxProps) {
  const expired = isExpiredNow(isExpired, expiresAt);

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
        expired
          ? 'border-red-300/60 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/[0.05] opacity-75'
          : 'border-purple-300/60 dark:border-purple-500/30 bg-white dark:bg-[#0a0a0a]'
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-widest">
            {code}
          </span>
          {isNew && !expired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
              New
            </span>
          )}
          {expired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">
              Expired
            </span>
          )}
        </div>
        {showReward && reward && (
          <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
            {reward}
          </span>
        )}
      </div>
      <CopyButton value={code} label="Copy code" />
    </div>
  );
}
