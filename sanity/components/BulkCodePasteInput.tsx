'use client'

import { useState, useCallback } from 'react'
import { Box, Button, Card, Flex, Stack, Text, TextArea, Badge } from '@sanity/ui'
import { set, insert } from 'sanity'
import { nanoid } from 'nanoid'
import type { ArrayOfObjectsInputProps } from 'sanity'

/**
 * Bulk-paste input for the "Code Entries" array (codeCopyBlock[]).
 * Renders the normal array input below, plus a paste box above it that
 * accepts one code per line and appends them as new codeCopyBlock items.
 *
 * Accepted formats per line:
 *   CODE
 *   CODE | Reward text
 *   CODE, Reward text
 */
export function BulkCodePasteInput(props: ArrayOfObjectsInputProps) {
  const { value = [], onChange, renderDefault } = props
  const [rawText, setRawText] = useState('')
  const [lastAdded, setLastAdded] = useState<number | null>(null)

  const existingCodes = new Set(
    (value || [])
      .map((item: any) => (typeof item?.code === 'string' ? item.code.trim().toUpperCase() : null))
      .filter(Boolean)
  )

  const handleBulkAdd = useCallback(() => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) return

    const newItems: any[] = []
    const seen = new Set<string>()

    for (const line of lines) {
      // Support "CODE | reward" or "CODE, reward" or just "CODE"
      const parts = line.split(/\s*[|,]\s*/)
      const code = parts[0]?.trim()
      const reward = parts.slice(1).join(', ').trim() || undefined
      if (!code) continue
      const key = code.toUpperCase()
      if (existingCodes.has(key) || seen.has(key)) continue
      seen.add(key)
      newItems.push({
        _type: 'codeCopyBlock',
        _key: nanoid(),
        code,
        ...(reward ? { reward, showReward: true } : { showReward: true }),
        isNew: true,
        isExpired: false,
        isRedeemed: false,
      })
    }

    if (newItems.length === 0) {
      setRawText('')
      setLastAdded(0)
      return
    }

    onChange(insert(newItems, 'after', [-1]))
    setLastAdded(newItems.length)
    setRawText('')
  }, [rawText, existingCodes, onChange])

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} border tone="primary">
        <Stack space={3}>
          <Text size={1} weight="semibold">Bulk add codes</Text>
          <Text size={1} muted>
            Paste one code per line. Optionally add a reward after a{' '}
            <code>|</code> or <code>,</code> — e.g. <code>LIZBZVHJXDX5AMQ9 | 50 UC</code>. Duplicate
            codes already in the list below are skipped automatically. New codes are added with the
            &quot;New&quot; badge and inserted at the top.
          </Text>
          <TextArea
            rows={8}
            value={rawText}
            placeholder={'LIZBZVHJXDX5AMQ9\nLIZCZTXGW8GDSN4R | 50 UC\nLIZDZXH3SQWK5PWG, Free skin'}
            onChange={(e) => setRawText(e.currentTarget.value)}
          />
          <Flex align="center" gap={3}>
            <Button text="Add codes" tone="positive" onClick={handleBulkAdd} disabled={!rawText.trim()} />
            {lastAdded !== null && (
              <Badge tone={lastAdded > 0 ? 'positive' : 'caution'}>
                {lastAdded > 0 ? `${lastAdded} code(s) added` : 'No new codes (all duplicates)'}
              </Badge>
            )}
          </Flex>
        </Stack>
      </Card>

      <Box>{renderDefault(props)}</Box>
    </Stack>
  )
}
