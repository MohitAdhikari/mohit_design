import { unstable_cache } from 'next/cache'
import { projectId } from '../sanity/env'
import { client } from './sanityClient'
import { mergeGames, DEFAULT_GAMES, type GameDef } from './games'

export interface MarqueeGame {
  name: string
  count: number
}

const PUBLISHED = `(status == "published" || !defined(status)) && (!defined(publishDate) || dateTime(publishDate) <= dateTime(now()))`

/**
 * Games for the homepage marquee, ordered by how many published articles /
 * guides mention them (title match on the name or any alias, or an exact
 * category / tag / guide-game match). Built-in games are merged with
 * `game` docs from the Studio. Ties keep the built-in order.
 */
async function fetchMarqueeGames(): Promise<MarqueeGame[]> {
  const fallback = DEFAULT_GAMES.filter((g) => g.showInMarquee !== false).map((g) => ({ name: g.name, count: 0 }))
  if (!projectId) return fallback

  try {
    const cms = await client.fetch<GameDef[]>(`*[_type == "game" && defined(name)]{ name, aliases, showInMarquee }`)
    const games = mergeGames(cms).filter((g) => g.showInMarquee !== false)

    const params: Record<string, unknown> = {}
    const parts = games.map((g, i) => {
      const terms = [g.name, ...(g.aliases ?? [])]
      params[`l${i}`] = terms.map((t) => t.toLowerCase())
      const titleMatch = terms.map((_, j) => {
        params[`t${i}_${j}`] = terms[j]
        return `title match $t${i}_${j}`
      }).join(' || ')
      return `"g${i}": count(*[_type in ["newsPost", "guide"] && ${PUBLISHED} && (
        ${titleMatch} ||
        lower(category) in $l${i} ||
        lower(gameName) in $l${i} ||
        count((tags[]->title)[lower(@) in $l${i}]) > 0
      )])`
    })

    const counts = await client.fetch<Record<string, number>>(`{ ${parts.join(',\n')} }`, params)
    return games
      .map((g, i) => ({ name: g.name, count: counts?.[`g${i}`] ?? 0, order: i }))
      .sort((a, b) => b.count - a.count || a.order - b.order)
      .map(({ name, count }) => ({ name, count }))
  } catch {
    return fallback
  }
}

export const getMarqueeGames = unstable_cache(fetchMarqueeGames, ['marquee-games'], {
  revalidate: 3600,
  tags: ['homepage-feed'],
})
