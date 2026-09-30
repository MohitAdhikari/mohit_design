'use client'

import { useEffect, useMemo, useState } from 'react'
import { Select, Stack, Text } from '@sanity/ui'
import { set, unset, useClient, type StringInputProps } from 'sanity'
import { mergeGames, type GameDef } from '../../lib/games'

/**
 * Dropdown for any string "Game" field. Options = built-in games
 * (lib/games.ts) + every `game` document, so adding a game in
 * Studio → 🎮 Games makes it selectable everywhere without a code change.
 * An existing value that isn't in either list is kept as an option so old
 * documents never lose their data.
 */
export function GameSelectInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props
  const client = useClient({ apiVersion: '2024-04-28' })
  const [cmsGames, setCmsGames] = useState<GameDef[]>([])

  useEffect(() => {
    client
      .fetch<GameDef[]>(`*[_type == "game" && defined(name)]{ name, aliases, showInMarquee }`)
      .then(setCmsGames)
      .catch(() => {})
  }, [client])

  const names = useMemo(() => {
    const list = mergeGames(cmsGames).map((g) => g.name)
    if (value && !list.some((n) => n.toLowerCase() === value.toLowerCase())) list.push(value)
    return list
  }, [cmsGames, value])

  return (
    <Stack space={2}>
      <Select
        {...elementProps}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.currentTarget.value
          onChange(v ? set(v) : unset())
        }}
      >
        <option value="">Select game…</option>
        {names.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </Select>
      <Text size={0} muted>Missing a game? Add it under 🎮 Games in the Studio sidebar.</Text>
    </Stack>
  )
}
