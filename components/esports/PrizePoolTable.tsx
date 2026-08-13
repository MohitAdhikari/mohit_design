/**
 * components/esports/PrizePoolTable.tsx
 *
 * Renders prize placements grouped by stage (Group / Survival / Finals)
 * with a USD ↔ INR toggle button.
 *
 * Usage:
 *   <PrizePoolTable placements={edition.prizePlacements} rate={84} totalUSD={edition.totalPrizePool} />
 */

'use client'

import { useState } from 'react'

interface PrizePlacement {
  _key?: string
  placement: string
  prize?: number | null       // USD
  prizeINR?: number | null    // pre-computed INR (optional, fallback to prize * rate)
  currency?: string | null
  notes?: string | null
}

interface Props {
  placements: PrizePlacement[]
  rate?: number
  totalUSD?: number | null
}

const STAGE_ORDER = ['Group', 'Survival', 'Finals']

const STAGE_LABELS: Record<string, string> = {
  Group:    'Group Stage',
  Survival: 'Survival Stage',
  Finals:   'Grand Finals',
}

const STAGE_COLORS: Record<string, string> = {
  Group:    'text-blue-400',
  Survival: 'text-orange-400',
  Finals:   'text-yellow-400',
}

function fmt(amount: number, currency: 'USD' | 'INR') {
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN')
  }
  return '$' + amount.toLocaleString('en-US')
}

export default function PrizePoolTable({ placements = [], rate = 84, totalUSD }: Props) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD')

  const grouped = STAGE_ORDER.reduce<Record<string, PrizePlacement[]>>((acc, key) => {
    acc[key] = placements.filter((p) => p.placement.startsWith(key))
    return acc
  }, {})

  const convertedTotal = totalUSD
    ? currency === 'INR'
      ? Math.round(totalUSD * rate)
      : totalUSD
    : null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Prize Pool Distribution</h3>
          {convertedTotal && (
            <p className="mt-0.5 text-sm text-gray-400">
              Total: <span className="font-semibold text-white">{fmt(convertedTotal, currency)}</span>
            </p>
          )}
        </div>

        <button
          onClick={() => setCurrency((c) => (c === 'USD' ? 'INR' : 'USD'))}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <span className={currency === 'USD' ? 'text-green-400' : 'text-gray-500'}>$USD</span>
          <span className="text-gray-600">|</span>
          <span className={currency === 'INR' ? 'text-orange-400' : 'text-gray-500'}>₹INR</span>
        </button>
      </div>

      {STAGE_ORDER.map((stageKey) => {
        const rows = grouped[stageKey]
        if (!rows || rows.length === 0) return null
        return (
          <div key={stageKey} className="overflow-hidden rounded-xl border border-white/10">
            <div className="border-b border-white/10 bg-white/5 px-4 py-3">
              <h4 className={`font-semibold ${STAGE_COLORS[stageKey]}`}>
                {STAGE_LABELS[stageKey]}
                {stageKey === 'Group' && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (amounts per group — paid to both Group A &amp; B)
                  </span>
                )}
              </h4>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500">
                  <th className="px-4 py-2 text-left">Placement</th>
                  <th className="px-4 py-2 text-right font-semibold text-white">
                    Prize ({currency})
                  </th>
                  <th className="hidden px-4 py-2 text-left text-gray-600 sm:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const usdAmt  = row.prize ?? 0
                  const inrAmt  = row.prizeINR ?? Math.round(usdAmt * rate)
                  const display = currency === 'INR' ? fmt(inrAmt, 'INR') : fmt(usdAmt, 'USD')
                  const isTop   = i === 0
                  const isChamp = row.notes?.toLowerCase().includes('champion')

                  return (
                    <tr
                      key={row._key ?? `row-${i}`}
                      className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                        isTop || isChamp ? 'bg-yellow-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span className={`font-medium ${isTop ? 'text-yellow-400' : 'text-gray-300'}`}>
                          {row.placement.replace(/^(Group|Survival|Finals)\s/, '')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-white">
                        {display}
                      </td>
                      <td className="hidden px-4 py-2.5 text-xs text-gray-500 sm:table-cell">
                        {row.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              <tfoot>
                <tr className="border-t border-white/10 bg-white/5">
                  <td className="px-4 py-2 text-xs font-semibold text-gray-400">Stage Total</td>
                  <td className="px-4 py-2 text-right text-xs font-bold text-gray-300">
                    {(() => {
                      const total = rows.reduce((s, r) => s + (r.prize ?? 0), 0)
                      return currency === 'INR'
                        ? fmt(Math.round(total * rate), 'INR')
                        : fmt(total, 'USD')
                    })()}
                  </td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        )
      })}
    </div>
  )
}
