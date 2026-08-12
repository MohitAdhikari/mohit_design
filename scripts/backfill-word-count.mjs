/**
 * One-time backfill script for the new `wordCount` field on newsPost/guide docs.
 *
 * Reads `content` from each document, counts the words, and patches `wordCount`.
 *
 * Run with a write token:
 *   SANITY_API_WRITE_TOKEN=skxxx node scripts/backfill-word-count.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'

function loadEnv() {
  if (process.loadEnvFile) {
    try {
      process.loadEnvFile(path.join(process.cwd(), '.env.local'))
    } catch {}
  } else {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const text = fs.readFileSync(envPath, 'utf8')
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(['"]?)(.*?)\2\s*$/)
        if (match && process.env[match[1]] === undefined) {
          process.env[match[1]] = match[3]
        }
      }
    }
  }
}

loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Set SANITY_API_WRITE_TOKEN before running this script.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

function extractPlainText(content) {
  if (!content || !Array.isArray(content)) return ''
  return content
    .map((block) => (block?.children || []).map((c) => c?.text || '').join(' '))
    .join(' ')
    .trim()
}

function countWords(content) {
  const text = extractPlainText(content)
  return text.split(/\s+/).filter(Boolean).length
}

async function backfillType(type) {
  console.log(`\nBackfilling wordCount for ${type}...`)
  const docs = await client.fetch(
    `*[_type == $type] { _id, content }`,
    { type }
  )
  console.log(`Found ${docs.length} ${type} documents.`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    const wordCount = countWords(doc.content)
    if (wordCount === 0) {
      skipped++
      continue
    }
    try {
      await client.patch(doc._id).set({ wordCount }).commit()
      updated++
      process.stdout.write('.')
    } catch (err) {
      failed++
      console.error(`\nFailed to patch ${doc._id}:`, err.message)
    }
  }

  console.log(`\n${type}: updated=${updated}, skipped=${skipped}, failed=${failed}`)
}

async function main() {
  await backfillType('newsPost')
  await backfillType('guide')
  console.log('\nBackfill complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
