'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Box, Button, Card, Flex, Stack, Text, TextArea, Badge } from '@sanity/ui'
import { insert } from 'sanity'
import { useClient } from 'sanity'
import { nanoid } from 'nanoid'
import type { ArrayOfObjectsInputProps } from 'sanity'

interface TeamDoc {
  _id: string
  name: string
}

/**
 * Bulk-paste input for the match "Participants" array (Battle Royale matches).
 * Paste one team name per line (optionally "TeamName | placement | kills | points")
 * and it matches against existing Team documents by name and inserts participant
 * entries. Unmatched names are reported so the Team doc can be created first.
 */
export function BulkTeamAddInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-04-28' })
  const [teams, setTeams] = useState<TeamDoc[]>([])
  const [rawText, setRawText] = useState('')
  const [result, setResult] = useState<{ added: number; notFound: string[] } | null>(null)

  useEffect(() => {
    client.fetch<TeamDoc[]>(`*[_type == "team"]{_id, name} | order(name asc)`).then(setTeams).catch(() => {})
  }, [client])

  const teamByName = useMemo(() => {
    const map = new Map<string, TeamDoc>()
    teams.forEach((t) => map.set(t.name.trim().toLowerCase(), t))
    return map
  }, [teams])

  const existingTeamIds = new Set(
    (value || []).map((item: any) => item?.team?._ref).filter(Boolean)
  )

  const handleBulkAdd = useCallback(() => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) return

    const newItems: any[] = []
    const notFound: string[] = []

    for (const line of lines) {
      const parts = line.split('|').map((p) => p.trim())
      const teamName = parts[0]
      if (!teamName) continue
      const match = teamByName.get(teamName.toLowerCase())
      if (!match) {
        notFound.push(teamName)
        continue
      }
      if (existingTeamIds.has(match._id)) continue

      const placement = parts[1] ? Number(parts[1]) : undefined
      const kills = parts[2] ? Number(parts[2]) : undefined
      const points = parts[3] ? Number(parts[3]) : undefined

      newItems.push({
        _type: 'matchParticipant',
        _key: nanoid(),
        team: { _type: 'reference', _ref: match._id },
        ...(placement !== undefined && !Number.isNaN(placement) ? { placement } : {}),
        ...(kills !== undefined && !Number.isNaN(kills) ? { kills } : {}),
        ...(points !== undefined && !Number.isNaN(points) ? { points } : {}),
      })
      existingTeamIds.add(match._id)
    }

    if (newItems.length > 0) {
      onChange(insert(newItems, 'after', [-1]))
    }
    setResult({ added: newItems.length, notFound })
    setRawText('')
  }, [rawText, teamByName, existingTeamIds, onChange])

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} border tone="primary">
        <Stack space={3}>
          <Text size={1} weight="semibold">Bulk add teams (Battle Royale lobby)</Text>
          <Text size={1} muted>
            Paste one team per line, matched by exact Team name (case-insensitive). Optional
            columns separated by <code>|</code>: <code>TeamName | placement | kills | points</code>.
            Team docs must already exist — create missing teams first, then paste again.
          </Text>
          <TextArea
            rows={8}
            value={rawText}
            placeholder={'Team Soul\nGodlike Esports | 2 | 8 | 12\nTeam XSpark'}
            onChange={(e) => setRawText(e.currentTarget.value)}
          />
          <Flex align="center" gap={3}>
            <Button text="Add teams" tone="positive" onClick={handleBulkAdd} disabled={!rawText.trim()} />
            {result && (
              <Badge tone={result.added > 0 ? 'positive' : 'caution'}>
                {result.added} added{result.notFound.length ? ` · ${result.notFound.length} not found` : ''}
              </Badge>
            )}
          </Flex>
          {result && result.notFound.length > 0 && (
            <Card padding={2} radius={2} tone="critical" border>
              <Text size={1}>Not found (create these Team docs first): {result.notFound.join(', ')}</Text>
            </Card>
          )}
        </Stack>
      </Card>

      <Box>{renderDefault(props)}</Box>
    </Stack>
  )
}
