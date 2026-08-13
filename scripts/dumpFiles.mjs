import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const files = [
  ['1.', 'sanity/schemaTypes/tournamentEdition.ts'],
  ['2.', 'sanity/schemaTypes/team.ts'],
  ['3.', 'sanity/schemaTypes/objects/editionParticipant.ts'],
  ['4.', 'sanity/schemaTypes/index.ts'],
  ['5.', 'lib/tournamentApi.ts'],
  ['6.', 'components/TeamLogo.tsx'],
  ['7.', 'components/StandingsTables.tsx'],
  ['8.', 'app/esports/[slug]/page.tsx'],
  ['9.', 'app/esports/[slug]/matches/page.tsx'],
  ['10.', 'app/esports/page.tsx'],
  ['11.', 'app/schedule/page.tsx'],
  ['12.', 'app/standings/page.tsx'],
  ['13.', 'tsconfig.json'],
  ['14.', 'package.json'],
]

let out = ''

for (const [num, f] of files) {
  out += `=== ${num} ${f} ===\n`
  if (existsSync(f)) {
    out += readFileSync(f, 'utf8')
  } else {
    out += 'FILE NOT FOUND\n'
  }
  out += '\n\n'
}

out += '=== 15. tailwind.config.ts / tailwind.config.js ===\n'
if (existsSync('tailwind.config.ts')) {
  out += readFileSync('tailwind.config.ts', 'utf8')
} else if (existsSync('tailwind.config.js')) {
  out += readFileSync('tailwind.config.js', 'utf8')
} else {
  out += 'No tailwind.config.ts or tailwind.config.js found at project root.\n'
}

writeFileSync('requested_files_dump.txt', out)
console.log('Wrote requested_files_dump.txt')
