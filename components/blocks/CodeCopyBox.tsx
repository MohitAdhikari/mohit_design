'use client';

import { useState, useCallback } from 'react';
import CopyButton from '@/components/CopyButton';
import { isExpiredNow, isRedeemedNow, type CodeEntry } from '@/lib/codeEntries';
import { CheckCircle2 } from 'lucide-react';

interface CodeCopyBoxProps extends CodeEntry {
  /** Optional className for the card wrapper. */
  className?: string;
}

export default function CodeCopyBox({
  code,
  reward,
  showReward = true,
  isNew,
  isExpired,
  isRedeemed,
  expiresAt,
  className = '',
}: CodeCopyBoxProps) {
  const expired = isExpiredNow(isExpired, expiresAt);
  const redeemed = isRedeemedNow(isRedeemed);
  const usable = !expired && !redeemed;

  const [showCopied, setShowCopied] = useState(false);
  const [toast, setToast] = useState(false);

  const handleCopy = useCallback(() => {
    setShowCopied(true);
    setToast(true);
    const hideToast = setTimeout(() => setToast(false), 2600);
    const resetLabel = setTimeout(() => setShowCopied(false), 2000);
    return () => {
      clearTimeout(hideToast);
      clearTimeout(resetLabel);
    };
  }, []);

  return (
    <>
      <div
        className={`relative group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
          expired || redeemed
            ? 'border-red-300/40 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/[0.04] opacity-70'
            : 'border-purple-300/40 dark:border-purple-500/20 bg-white dark:bg-[#0f1117] hover:border-purple-400/60 dark:hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(157,0,255,0.08)]'
        } ${className}`}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono text-lg sm:text-xl font-bold tracking-widest truncate transition-all duration-200 ${
                showCopied
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : expired || redeemed
                  ? 'text-gray-500 dark:text-gray-500 line-through decoration-red-500/50'
                  : 'text-gray-900 dark:text-white'
              }`}
              aria-live="polite"
            >
              {showCopied ? 'Copied!' : code}
            </span>
            {isNew && usable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-500/20">
                New
              </span>
            )}
            {expired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-red-500/20">
                Expired
              </span>
            )}
            {redeemed && !expired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/40 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-gray-500/20">
                Redeemed
              </span>
            )}
          </div>
          {showReward && reward && (
            <span className="inline-flex self-start items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-semibold ring-1 ring-purple-500/15">
              {reward}
            </span>
          )}
        </div>
        <CopyButton
          value={code}
          label="Copy code"
          copiedLabel="Copied!"
          disabled={!usable}
          timeout={2000}
          onCopy={handleCopy}
          className="shrink-0"
        />
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f1117] text-white text-sm font-medium shadow-[0_0_30px_rgba(157,0,255,0.18)] border border-purple-500/20 transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
        aria-live="assertive"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        Code copied to clipboard!
      </div>
    </>
  );
}
