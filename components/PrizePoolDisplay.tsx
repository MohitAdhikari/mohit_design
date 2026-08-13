'use client'

import { useState } from 'react'
import { convertCurrency, formatCurrency, CURRENCY_SYMBOLS } from '@/lib/currency'

interface Props {
  amount: number
  currency: string
  displayOverride?: string | null
  showConverter?: boolean
  className?: string
}

const PILLS = ['INR', 'USD', 'EUR', 'GBP'] as const

export default function PrizePoolDisplay({
  amount,
  currency,
  displayOverride,
  showConverter = false,
  className = '',
}: Props) {
  const [selected, setSelected] = useState(currency)

  const isNative   = selected === currency
  const converted  = convertCurrency(amount, currency, selected)
  const primary    = isNative && displayOverride
    ? displayOverride
    : formatCurrency(converted, selected)

  return (
    <span className="inline-flex flex-col gap-1.5">
      <span className={`font-black font-space-grotesk tabular-nums leading-none ${className}`}>
        {primary}
      </span>

      {showConverter && (
        <span className="inline-flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-600 mr-0.5">
              Convert
            </span>
            {PILLS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelected(c)}
                className={[
                  'text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors',
                  selected === c
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/40'
                    : 'text-gray-500 dark:text-gray-500 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600',
                ].join(' ')}
              >
                {(CURRENCY_SYMBOLS[c] ?? c).trim()}
              </button>
            ))}
          </span>

          {!isNative && (
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">
              Approximate · rates may vary
            </span>
          )}
        </span>
      )}
    </span>
  )
}
