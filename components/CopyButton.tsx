'use client';

import { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  disabled?: boolean;
  timeout?: number;
  onCopy?: () => void;
  className?: string;
}

export default function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied!',
  disabled = false,
  timeout = 2000,
  onCopy,
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (disabled || copied) return;

    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        success = true;
      } else {
        // Fallback for non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, value.length);
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      success = false;
    }

    if (success) {
      setCopied(true);
      onCopy?.();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), timeout);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-md transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
          : disabled
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
      } ${className}`}
      aria-label={disabled ? `Cannot copy ${value}` : `Copy ${value}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? copiedLabel : disabled ? 'Unavailable' : label}
    </button>
  );
}
