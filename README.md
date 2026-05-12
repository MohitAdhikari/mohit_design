# PHONEOCEAN

Gaming news, esports updates and exclusive interviews — built with Next.js 15 (App Router), React 19, Tailwind CSS v4, and Sanity (optional CMS).

## Features

- **App Router + RSC** with static + dynamic rendering per route.
- **Sanity Studio** mounted at `/studio` (optional — works in mock/demo mode out of the box).
- **Theming** via `next-themes` (light / dark / system).
- **SEO-ready**: per-route metadata, `sitemap.xml`, `robots.txt`, JSON-LD on article pages.
- **Search** across news, interviews and guides with `?q=` URL param.
- **Breaking-news ticker** at the top of every page (auto-pulled from latest articles).
- **Newsletter CTA**, **theme-aware loading / error / 404 pages**, copy-to-clipboard code blocks, Ken-Burns hero, scroll-aware navbar.

## Tech stack

| Layer        | Tooling                                  |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 15 (App Router), React 19         |
| Styling      | Tailwind CSS v4, custom CSS animations    |
| Icons        | lucide-react                              |
| CMS (opt.)   | Sanity v4 + `@portabletext/react`         |
| Fonts        | Space Grotesk, Inter, JetBrains Mono      |
| Analytics    | `@next/third-parties/google` (optional)   |

## Run locally

**Prerequisites:** Node.js 20+ and `npm`.

```bash
npm install
cp .env.example .env.local   # if you create one — see below for variables
npm run dev
```

Visit `http://localhost:3000`.

## Environment variables

Create a `.env.local` file at the project root. **All variables are optional** — the app falls back to mock data and sane defaults when omitted.

```env
# --- Sanity (optional, only needed if you wire up a real Sanity project) ---
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-04-28

# --- SEO / canonical URLs (used by sitemap.xml, robots.txt, OG tags) ---
NEXT_PUBLIC_SITE_URL=https://phoneocean.com

# --- Analytics (optional) ---
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# --- Search Console verification (optional) ---
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-token
```

> **Note:** Without `NEXT_PUBLIC_SANITY_PROJECT_ID`, `@/lib/api` serves mock content from `lib/api.ts` so you can develop and preview the UI without standing up a Sanity backend.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start dev server (Turbopack)      |
| `npm run build`   | Production build (`output: standalone`) |
| `npm start`       | Serve the production build        |
| `npm run lint`    | Run Next.js / ESLint checks       |

## Project structure

```
app/
  layout.tsx               # Root layout, BreakingTicker, NewsletterCTA, Footer
  page.tsx                 # Home (hero + trending + latest feed)
  news/[slug]/page.tsx     # Article detail (PortableText)
  guides/[slug]/page.tsx   # Guide detail with code-redeem section
  interviews/page.tsx      # Interview index
  search/                  # Server data + client filtering
  studio/[[...tool]]/      # Sanity Studio (admin)
  loading.tsx | error.tsx | not-found.tsx
components/
  Navbar.tsx | Footer.tsx | BreakingTicker.tsx | NewsletterCTA.tsx
  PageHeader.tsx | SanityContent.tsx | CopyButton.tsx | VideoEmbed.tsx
lib/api.ts                 # Sanity queries + mock fallbacks
public/logo.svg            # Inline brand mark
```

## Deployment

### Vercel (recommended)

1. **Push** the repo to GitHub / GitLab / Bitbucket.
2. In Vercel: **New Project → Import** the repo.
3. Framework preset is auto-detected as **Next.js**.
4. Add the environment variables listed above under **Project → Settings → Environment Variables** (Production + Preview).
5. Click **Deploy**. Vercel will run `npm run build` and serve the standalone output.

Custom domain:

- Add the domain under **Project → Domains** and set DNS as instructed.
- Update `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy so `sitemap.xml` / OG tags pick it up.

### Self-host (Docker)

Because `next.config.ts` uses `output: 'standalone'`, you can ship a minimal Docker image:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t phoneocean .
docker run -p 3000:3000 --env-file .env.local phoneocean
```

### Other hosts

Any platform that supports a Node.js 20 server works (Railway, Render, Fly.io, AWS App Runner, etc.). Point the start command at `node .next/standalone/server.js` (with `.next/static` and `public` copied alongside) or run `npm start` if you skipped standalone.

## Wiring up Sanity (when ready)

1. Create a Sanity project at https://sanity.io and grab the **Project ID** + **Dataset**.
2. Set the `NEXT_PUBLIC_SANITY_*` env vars locally and in your host.
3. Replace the mock data inside `lib/api.ts` with real GROQ queries against the `client` exported from `sanity/lib/client.ts`.
4. Visit `/studio` to author content — it&apos;s already embedded.

## Customising the brand

- **Logo:** swap `public/logo.svg` (square SVG works best). Also update `app/icon.svg` for the favicon.
- **Colors:** the cyan / purple / green / red accent palette is centralised in `components/PageHeader.tsx` and inline Tailwind utility classes. Search for `#00E5FF`, `#9D00FF`, `#00FF66` to retheme.
- **Fonts:** edit the imports in `app/layout.tsx` and the matching CSS variables in `app/globals.css`.

## License

Proprietary — © PHONEOCEAN. All rights reserved.
