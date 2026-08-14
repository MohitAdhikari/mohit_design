/**
 * scripts/forceDynamicMode.mjs
 * Converts all content pages from ISR/static to fully dynamic (SSR).
 *
 * WHY: Vercel bills "ISR Write Units" for every page written to the ISR
 * cache — at build time (every page, every deploy) and on-demand for any
 * uncached path. With a Hobby plan cap of 200k/month, an active site plus
 * frequent deploys exhausts this. `force-dynamic` removes these routes from
 * the ISR cache system entirely, making ISR writes structurally impossible,
 * while letting freshly published Sanity content appear immediately with no
 * redeploy.
 *
 * Run: node scripts/forceDynamicMode.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

const FILES = [
  'app/page.tsx',
  'app/news/page.tsx',
  'app/news/[slug]/page.tsx',
  'app/guides/page.tsx',
  'app/guides/[slug]/page.tsx',
  'app/esports/page.tsx',
  'app/esports/[slug]/page.tsx',
  'app/esports/[slug]/bracket/page.tsx',
  'app/tags/page.tsx',
  'app/tags/[slug]/page.tsx',
  'app/interviews/page.tsx',
  'app/videos/page.tsx',
  'app/search/page.tsx',
  'app/codes/page.tsx',
  'app/codes/blox-fruits/page.tsx',
  'app/rss.xml/route.ts',
  'app/news-sitemap.xml/route.ts',
]

const DYNAMIC_EXPORT = `// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce \`revalidate\`, \`generateStaticParams\` or
// \`dynamicParams\` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'`

let changed = 0

for (const rel of FILES) {
  const path = join(ROOT, rel)
  let src
  try {
    src = readFileSync(path, 'utf8')
  } catch {
    console.log(`[SKIP] not found: ${rel}`)
    continue
  }

  const before = src

  // 1. Strip the ISR-MODE comment block + revalidate export (with or without semicolon)
  src = src.replace(
    /\/\/ ISR-MODE:[\s\S]*?\n(?:\/\/.*\n)*export const revalidate = false;?\n/g,
    `${DYNAMIC_EXPORT}\n`,
  )
  // 2. Any remaining bare `export const revalidate = ...`
  src = src.replace(/^export const revalidate = .*;?$/m, DYNAMIC_EXPORT)

  // 3. Remove dynamicParams export + its comment block
  src = src.replace(/(?:^\/\/.*\n)*^export const dynamicParams = (?:true|false);?\n\n?/gm, '')

  // 4. Remove generateStaticParams (function body is always a simple block here)
  src = src.replace(
    /(?:^\/\/.*\n)*^export async function generateStaticParams\(\)[\s\S]*?^\}\n\n?/gm,
    '',
  )

  // 5. If no dynamic export was inserted (file had no revalidate), add one after imports
  if (!src.includes("export const dynamic = 'force-dynamic'")) {
    const lines = src.split('\n')
    let lastImport = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^import\s|^\}\s+from\s/.test(lines[i])) lastImport = i
    }
    lines.splice(lastImport + 1, 0, '', DYNAMIC_EXPORT)
    src = lines.join('\n')
  }

  if (src !== before) {
    writeFileSync(path, src)
    console.log(`[UPDATED] ${rel}`)
    changed++
  } else {
    console.log(`[NO CHANGE] ${rel}`)
  }
}

console.log(`\n✅ ${changed} file(s) converted to force-dynamic (zero-ISR mode).\n`)
