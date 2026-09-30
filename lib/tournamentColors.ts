/**
 * Accent colours used to tell tournaments apart at a glance (Studio list
 * previews, homepage "Ongoing Tournaments", tournament cards) — especially
 * useful when several series have similar names ("BGMI Pro Series" vs
 * "BGMI Masters Series").
 *
 * Editors can pick a colour per tournament; otherwise one is derived from the
 * name with a stable hash, so the same tournament always gets the same colour.
 */
export const TOURNAMENT_COLORS = [
  { title: 'Cyan', value: '#00E5FF' },
  { title: 'Purple', value: '#9D00FF' },
  { title: 'Orange', value: '#FF7A00' },
  { title: 'Green', value: '#00C853' },
  { title: 'Red', value: '#FF1744' },
  { title: 'Yellow', value: '#FFC400' },
  { title: 'Pink', value: '#FF4081' },
  { title: 'Blue', value: '#2979FF' },
  { title: 'Teal', value: '#1DE9B6' },
  { title: 'Indigo', value: '#651FFF' },
  { title: 'Lime', value: '#AEEA00' },
  { title: 'Brown', value: '#A1662F' },
] as const

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function tournamentAccent(name?: string | null, override?: string | null): string {
  if (override && /^#[0-9a-f]{3,8}$/i.test(override)) return override
  const key = (name || '').trim().toLowerCase()
  return TOURNAMENT_COLORS[hash(key) % TOURNAMENT_COLORS.length].value
}

export function initials(name?: string | null): string {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
}
