#!/usr/bin/env node
/**
 * scripts/setIsrMode.mjs
 *
 * One-switch control for the site's ISR (Incremental Static Regeneration)
 * behavior, so you can flip between the two modes without hand-editing
 * every page whenever your Vercel ISR Write Units usage changes:
 *
 *   node scripts/setIsrMode.mjs static   — HARD STOP. Every page becomes
 *     `revalidate = false` (fully static). Pages only update via the
 *     Sanity webhook (/api/revalidate) or a manual redeploy. Zero
 *     time-based ISR writes possible. Use this when you're close to your
 *     monthly ISR Write budget.
 *
 *   node scripts/setIsrMode.mjs normal   — restores the original
 *     time-based revalidate windows (60s–86400s depending on the page).
 *     Pages refresh automatically on a timer *and* on webhook publish.
 *     Higher ISR Write usage, but content is fresher without relying on
 *     the webhook being configured correctly.
 *
 * After running, review the diff (`git diff`) and commit + push/redeploy
 * for it to take effect.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const MODE = process.argv[2]
if (!['static', 'normal'].includes(MODE)) {
  console.error('Usage: node scripts/setIsrMode.mjs <static|normal>')
  process.exit(1)
}

// relative path → "normal mode" revalidate window in seconds.
// These are the pre-crisis values ("like earlier").
const NORMAL_VALUES = {
  'app/page.tsx': 300,
  'app/news/page.tsx': 600,
  'app/news/[slug]/page.tsx': 3600,
  'app/interviews/page.tsx': 1800,
  'app/guides/page.tsx': 86400,
  'app/esports/page.tsx': 1800,
  'app/esports/[slug]/page.tsx': 300,
  'app/esports/[slug]/bracket/page.tsx': 60,
  'app/tags/page.tsx': 1800,
  'app/tags/[slug]/page.tsx': 1800,
  'app/search/page.tsx': 1800,
  'app/videos/page.tsx': 1800,
  'app/rss.xml/route.ts': 3600,
  'app/news-sitemap.xml/route.ts': 300,
  'app/codes/page.tsx': 86400,
  'app/codes/blox-fruits/page.tsx': 86400,
}

// Matches the contiguous `// ...` comment block immediately above
// `export const revalidate = ...` (any current value/comment), plus the
// export line itself, so it can be replaced wholesale each time this
// script runs — regardless of which mode the file is currently in.
const BLOCK_RE = /(?:^[ \t]*\/\/.*\n)*[ \t]*export const revalidate\s*=\s*[^\n]*\n/m

let changed = 0
let skipped = 0

for (const [relPath, normalSeconds] of Object.entries(NORMAL_VALUES)) {
  const filePath = path.join(ROOT, relPath)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Not found, skipping: ${relPath}`)
    skipped++
    continue
  }

  const src = fs.readFileSync(filePath, 'utf8')
  if (!BLOCK_RE.test(src)) {
    console.warn(`⚠️  Could not find revalidate export in: ${relPath} (skipped — check manually)`)
    skipped++
    continue
  }

  const hasSemicolon = /export const revalidate\s*=\s*[^\n]*;/.test(src)
  const semi = hasSemicolon ? ';' : ''

  let comment
  let value
  if (MODE === 'static') {
    value = 'false'
    comment =
      `// ISR-MODE: static — on-demand only via the Sanity webhook (/api/revalidate)\n` +
      `// or a manual redeploy. Zero time-based ISR writes. Switch back with:\n` +
      `//   node scripts/setIsrMode.mjs normal\n`
  } else {
    value = String(normalSeconds)
    comment =
      `// ISR-MODE: normal — revalidates on a ${normalSeconds}s timer (plus on-demand via\n` +
      `// the Sanity webhook). Uses more ISR Write Units. Switch to a hard stop with:\n` +
      `//   node scripts/setIsrMode.mjs static\n`
  }

  const replacement = `${comment}export const revalidate = ${value}${semi}\n`
  const next = src.replace(BLOCK_RE, replacement)

  if (next !== src) {
    fs.writeFileSync(filePath, next)
    console.log(`✅ ${relPath} → revalidate = ${value}`)
    changed++
  } else {
    console.log(`·  ${relPath} already up to date`)
  }
}

console.log(`\n${MODE === 'static' ? '🛑 STATIC' : '🔁 NORMAL'} mode applied. ${changed} file(s) changed, ${skipped} skipped.`)
console.log('Review with `git diff`, then commit + push (or redeploy) for it to take effect.')
