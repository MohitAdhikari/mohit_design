'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CodeItem } from './types';
import { STATUS_CONFIG } from './constants';
import { formatMD } from './utils';

export interface CodeCardProps {
  item: CodeItem;
}

export function CodeCard({ item }: CodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const config = STATUS_CONFIG[item.status];
  const isExpired = item.status === 'expired';

  const handleCopy = async () => {
    if (isExpired) return;
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.code);
        success = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = item.code;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, item.code.length);
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      success = false;
    }

    if (success) {
      setCopied(true);
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    }
  };

  return (
    <>
      <div
        className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#1e2130] bg-[#12151f] p-4 sm:p-4 transition-all duration-300 ${
          isExpired ? 'opacity-60' : `${config.shadow}`
        } border-l-[3px] ${config.leftBorder}`}
      >
        <div className="flex-1 min-w-0">
          <div
            className={`font-mono text-sm sm:text-[0.95rem] font-bold tracking-wide break-all transition-colors duration-200 ${
              copied ? 'text-emerald-400' : isExpired ? 'text-gray-500 line-through' : 'text-[#e2e8f0]'
            }`}
            aria-live="polite"
          >
            {copied ? 'Copied!' : item.code}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1e1a2e] border border-[#3730a3] text-[#a78bfa] text-[10px] font-semibold tracking-wide">
              {item.reward}
            </span>
            <span className="text-[11px] text-slate-500">Last checked: {formatMD(item.lastChecked)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.pillBorder}`}
          >
            {item.status === 'active' && '✅ '}
            {item.status === 'notsure' && '⚠️ '}
            {item.status === 'expired' && '❌ '}
            {config.label}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={isExpired}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : isExpired
                ? 'bg-[#1e2130] text-gray-500 border border-[#2d3148] cursor-not-allowed opacity-60'
                : 'bg-[#1e2130] text-[#a78bfa] border border-[#2d3148] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#052e16] border border-emerald-600/40 text-emerald-400 text-sm font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4" />
          Code copied!
        </div>
      )}
    </>
  );
}

export default CodeCard;
