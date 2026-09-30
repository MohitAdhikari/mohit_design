# Agent notes

## Verify
- Typecheck: `npx tsc --noEmit -p .`
- Lint (repo has pre-existing `react-hooks/set-state-in-effect` errors; lint only changed files): `npx eslint <files>`
- Build: `npm run build`
- Studio is embedded at `/studio` (sanity.config.ts), so it ships with the Next app.

## Gotchas
- Tailwind v4: custom CSS in `app/globals.css` must live in `@layer components` if it sets properties Tailwind utilities also set (e.g. `position`), otherwise it silently overrides the utilities.
- Tournament standings import (Studio tool + News Post "🏆 Tournament" tab) always creates `standing` docs with `status: 'draft'`; the site only reads `status == "published"`.
- Shared tournament import logic: `lib/articleImport/tournamentMeta.ts`. Game list: `lib/games.ts` + `game` docs.
