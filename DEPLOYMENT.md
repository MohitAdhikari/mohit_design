# PHONEOCEAN — Deploy & Manage Guide

A practical, step-by-step guide to running, deploying, and managing this Next.js 16 site. It is already live on **Vercel**; this doc covers day-to-day operations, content, and going from mock data to a real CMS.

---

## 0. How the app works (2-minute mental model)

- **Framework:** Next.js 16 (App Router, React 19, Tailwind v4).
- **Content source:** `lib/api.ts`.
  - If `NEXT_PUBLIC_SANITY_PROJECT_ID` is **missing or `demo1234`**, the site serves **built-in mock data** (what you see now).
  - If a **real Sanity project ID** is set, it fetches live content via GROQ queries.
- **Admin CMS:** Sanity Studio is embedded at **`/studio`** (also linked in the footer as "Owner CMS Login").
- **Rendering:** Most pages are static; `/news/[slug]` and `/guides/[slug]` are server-rendered on demand; `/videos` revalidates hourly.

---

## 1. Run locally

Prereqs: **Node.js 20+** and npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # lint
```

---

## 2. Environment variables

Create `.env.local` for local dev; set the same in Vercel for production. **All are optional** — without them the site runs on mock data.

```env
# --- Sanity CMS (enables real content + the /studio editor) ---
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-04-28
SANITY_API_READ_TOKEN=            # only needed to preview drafts

# --- SEO / canonical URLs (sitemap.xml, robots.txt, OG tags) ---
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# --- Analytics (optional) ---
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# --- Search Console verification (optional) ---
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-token
```

> Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. `SANITY_API_READ_TOKEN` is server-only — never prefix it with `NEXT_PUBLIC_`.

---

## 3. Deploy on Vercel (day-to-day)

Because the repo is already connected to Vercel, the normal workflow is **push to Git → auto-deploy**.

1. Commit and push to your default branch (e.g. `main`):
   ```bash
   git add .
   git commit -m "Update site"
   git push
   ```
2. Vercel builds automatically. Every push to `main` = **Production**; every other branch/PR = a **Preview** URL.
3. Watch the build in the Vercel dashboard → your project → **Deployments**.

### Set env vars on Vercel
Project → **Settings → Environment Variables** → add each key for **Production** (and Preview if needed) → **Redeploy** so they take effect.

### Manual redeploy / rollback
- **Redeploy:** Deployments → pick a build → **Redeploy**.
- **Rollback:** Deployments → a previous healthy build → **Promote to Production** (instant, zero rebuild).

### Custom domain
1. Project → **Domains** → add your domain and follow the DNS records shown.
2. Set `NEXT_PUBLIC_SITE_URL` to the final URL and redeploy (so `sitemap.xml` / OG tags are correct).

---

## 4. Managing content

### Option A — Quick edits (mock mode, no CMS)
Edit `lib/api.ts` → the `mockData` object (news, interviews, guides). Change titles, images, categories, `codesList`, etc., then push. Good for a static demo/portfolio.

### Option B — Real CMS with Sanity (recommended for a live news site)
1. Create a free project at <https://www.sanity.io> and copy the **Project ID** + **Dataset** (`production`).
2. In the Sanity project settings → **API → CORS origins**, add your site URL and `http://localhost:3000` (enable credentials).
3. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` (+ dataset) locally and on Vercel.
4. Go to **`/studio`** on your site, sign in, and start publishing. Content types available: **News Post**, **Interview**, **Guide** (see `sanity/schemaTypes/`).
5. Published content appears automatically via the GROQ queries in `lib/api.ts`.

> The switch from mock → live is automatic: as soon as a valid project ID (not `demo1234`) is present, `lib/api.ts` fetches from Sanity instead of mock data.

---

## 5. Customising the brand

- **Logo:** replace `public/logo.svg`; favicon is `app/icon.svg`.
- **Accent colors:** cyan `#00E5FF`, purple `#9D00FF`, green `#00FF66`, red for "live". Search the codebase for these hex values to retheme.
- **Fonts:** Space Grotesk / Inter / JetBrains Mono — configured in `app/layout.tsx`.
- **Animations:** all custom motion lives in `app/globals.css` (aurora, reveal, sheen, float, gradient-x, marquee) plus the `components/Reveal.tsx`, `AmbientBackground.tsx`, `StatsBand.tsx`, and `GamesMarquee.tsx` helpers.

---

## 6. Analytics & SEO checklist

- Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable Google Analytics.
- Add `NEXT_PUBLIC_SITE_URL` so `sitemap.xml`, `robots.txt`, and Open Graph tags resolve correctly.
- Submit `https://your-domain.com/sitemap.xml` in Google Search Console; verify with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Article pages already emit JSON-LD structured data.

---

## 7. Maintenance

- **Dependencies:** periodically run `npm outdated` and `npm update`; test with `npm run build` before pushing.
- **Newsletter:** `components/NewsletterCTA.tsx` currently simulates submission — wire it to a real provider (Mailchimp/ConvertKit/Resend) by replacing the `onSubmit` handler.
- **Contact form:** `components/ContactForm.tsx` — connect to your email/API endpoint when ready.
- **Pre-push sanity check:**
  ```bash
  npm run lint && npm run build
  ```

---

## 8. Alternative hosting (optional)

`next.config.ts` uses `output: 'standalone'`, so you can self-host via Docker or any Node 20 host (Railway, Render, Fly.io). Start command: `node .next/standalone/server.js` (copy `.next/static` and `public` alongside).

---

### Quick reference

| Task | Where |
| --- | --- |
| Edit content (no CMS) | `lib/api.ts` → `mockData` |
| Edit content (CMS) | `/studio` on your site |
| Env vars | Vercel → Settings → Environment Variables |
| Deploy | `git push` (auto) |
| Rollback | Vercel → Deployments → Promote |
| Domain | Vercel → Domains |
| Theme colors | search `#00E5FF` / `#9D00FF` / `#00FF66` |
