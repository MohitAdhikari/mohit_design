/**
 * Built-in game list shared by the Studio (game dropdowns) and the site
 * (homepage games marquee). Editors can add more games at any time from
 * Studio → 🎮 Games (`game` documents); those are merged on top of this list,
 * so a new title never needs a code change.
 *
 * `aliases` are extra spellings used when counting articles per game for the
 * marquee ordering (e.g. an article titled "Free Fire OB45 update" counts
 * towards Free Fire MAX).
 */
export interface GameDef {
  name: string
  aliases?: string[]
  showInMarquee?: boolean
}

export const DEFAULT_GAMES: GameDef[] = [
  { name: 'BGMI', aliases: ['Battlegrounds Mobile India'] },
  { name: 'Free Fire MAX', aliases: ['Free Fire', 'FF MAX'] },
  { name: 'PUBG Mobile', aliases: ['PUBGM'] },
  { name: 'GTA 6', aliases: ['GTA VI', 'GTA', 'Grand Theft Auto'] },
  { name: 'Valorant' },
  { name: 'Roblox' },
  { name: 'Call of Duty Mobile', aliases: ['CODM', 'COD Mobile'] },
  { name: 'Mobile Legends', aliases: ['MLBB'] },
  { name: 'Clash of Clans' },
  { name: 'Clash Royale' },
  { name: 'Minecraft' },
  { name: 'Fortnite' },
  { name: 'Apex Legends' },
  { name: 'CS2', aliases: ['Counter-Strike 2'] },
  { name: 'Dota 2' },
  { name: 'League of Legends' },
  { name: 'PUBG', aliases: ['PUBG PC', 'PUBG Battlegrounds'], showInMarquee: false },
  { name: 'New State Mobile', showInMarquee: false },
  { name: 'Multi-title', showInMarquee: false },
  { name: 'Other', showInMarquee: false },
]

/** Merge CMS game docs over the built-in list (CMS wins on name collision). */
export function mergeGames(cmsGames: GameDef[] = []): GameDef[] {
  const byName = new Map<string, GameDef>()
  for (const g of DEFAULT_GAMES) byName.set(g.name.toLowerCase(), g)
  for (const g of cmsGames) {
    if (!g?.name) continue
    const key = g.name.trim().toLowerCase()
    const prev = byName.get(key)
    byName.set(key, {
      ...prev,
      ...g,
      name: g.name.trim(),
      aliases: Array.from(new Set([...(prev?.aliases ?? []), ...(g.aliases ?? [])])),
    })
  }
  return Array.from(byName.values())
}
