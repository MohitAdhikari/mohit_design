import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nlydr3l6'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-28'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('SANITY_API_WRITE_TOKEN not set')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function toDay(iso) {
  const d = new Date(iso)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

async function main() {
  const editions = await client.fetch(
    `*[_type == "tournamentEdition"] | order(tournament->name asc, startDate asc) {
      _id,
      year,
      "tournamentName": tournament->name,
      "tournamentId": tournament->_id,
      "tournamentSlug": tournament->slug.current,
      "slug": slug.current,
      tournamentStatus,
      startDate,
      endDate,
      publishStatus,
      "winnerName": winner->name,
      "runnerUpName": runnerUp->name,
      "mvpName": mvp->ign,
      stages[] { name, startDate, endDate, status }
    }`
  )

  console.log(`Found ${editions.length} edition(s)\n`)

  const ongoingStatuses = ['group_stage', 'survival_stage', 'grand_finals', 'upcoming']
  const seen = new Map()
  let issues = []

  for (const e of editions) {
    const key = `${e.tournamentName}::${e.slug}`
    if (seen.has(key)) {
      issues.push(`Duplicate edition slug for same tournament: ${key}`)
    } else {
      seen.set(key, e._id)
    }

    if (e.publishStatus !== 'published') {
      issues.push(`${e.tournamentName} ${e.year} publishStatus is ${e.publishStatus}`)
    }

    if (ongoingStatuses.includes(e.tournamentStatus) && (e.winnerName || e.runnerUpName || e.mvpName)) {
      issues.push(`${e.tournamentName} ${e.year} (${e.tournamentStatus}) should have empty winner/runnerUp/mvp`)
    }

    const editionStart = toDay(e.startDate)
    const editionEnd = toDay(e.endDate)

    for (const s of e.stages || []) {
      const sStart = toDay(s.startDate)
      const sEnd = toDay(s.endDate)
      if (sStart < editionStart || sEnd > editionEnd) {
        issues.push(`${e.tournamentName} ${e.year} stage "${s.name}" dates [${s.startDate} → ${s.endDate}] outside edition range [${e.startDate} → ${e.endDate}]`)
      }
      if (!['upcoming', 'live', 'completed'].includes(s.status)) {
        issues.push(`${e.tournamentName} ${e.year} stage "${s.name}" has invalid status: ${s.status}`)
      }
    }

    console.log(`- ${e.tournamentName} | ${e.year} (${e.slug}) [${e.tournamentStatus}] | ${e.startDate} → ${e.endDate} | pub: ${e.publishStatus}`)
    if (e.winnerName) console.log(`  winner: ${e.winnerName}${e.runnerUpName ? `, runnerUp: ${e.runnerUpName}` : ''}`)
  }

  console.log('\n---')
  if (issues.length) {
    console.log(`Issues found: ${issues.length}`)
    issues.forEach((i) => console.log(`• ${i}`))
    process.exit(1)
  } else {
    console.log('All validation checks passed.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
