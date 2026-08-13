export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  AED: 'AED ',
  SAR: 'SAR ',
}

// Base: 1 USD = N units. Static approximation — no API, no refresh.
export const APPROXIMATE_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  SGD: 1.35,
  AED: 3.67,
  SAR: 3.75,
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
): number {
  if (from === to) return amount
  const inUSD = amount / (APPROXIMATE_RATES[from] ?? 1)
  return inUSD * (APPROXIMATE_RATES[to] ?? 1)
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} ` 

  if (currency === 'INR') {
    if (amount >= 10_000_000)
      return `${symbol}${(amount / 10_000_000).toFixed(2).replace(/\.?0+$/, '')} Cr` 
    if (amount >= 100_000)
      return `${symbol}${(amount / 100_000).toFixed(1).replace(/\.0$/, '')} L` 
    return `${symbol}${amount.toLocaleString('en-IN')}` 
  }

  if (amount >= 1_000_000)
    return `${symbol}${(amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M` 
  if (amount >= 1_000)
    return `${symbol}${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}K` 
  return `${symbol}${amount.toLocaleString()}` 
}
