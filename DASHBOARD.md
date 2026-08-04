# Role-Based Dashboard — Architecture & Deployment Guide

A custom, role-based editorial dashboard built inside the existing Next.js app.
Sanity remains the single source of truth for content; Supabase provides free,
managed authentication and role storage. No Sanity Studio seats are needed for
editors.

## 1. Architecture decision (why this, not the original plan)

The original request proposed Auth.js (NextAuth) + Supabase Postgres. Instead,
this implementation uses **Supabase Auth** directly, for one reason: security
surface area. Auth.js's Credentials provider would require us to hand-roll
password hashing, session/token rotation, and rate limiting on top of a plain
Postgres table. Supabase Auth (GoTrue) already provides all of that, audited
and maintained, on the same free Postgres instance. One fewer custom
security-critical system to build and maintain, for the same cost: free.

Everything else matches the original plan:
- Sanity stays the single source of truth for content.
- All Sanity writes happen server-side; the write token never reaches the browser.
- Editors never get a Sanity Studio account.
- Article ownership is stored as a field on the Sanity document itself
  (`dashboardOwnerId`) rather than a separate mapping table — no duplicated
  relational data, and Sanity Studio can still show who created what.

## 2. Folder structure

```
app/
  dashboard/
    layout.tsx              # protected shell, own <html>/<body> (like /studio)
    login/page.tsx
    page.tsx                 # overview
    articles/
      page.tsx               # list (own articles, or all for admin)
      new/page.tsx
      [id]/page.tsx          # edit
    admin/
      page.tsx               # stub landing, future sections listed
      users/page.tsx         # invite + list users
  api/
    dashboard/
      articles/route.ts          # GET list, POST create
      articles/[id]/route.ts     # GET one, PATCH update
      upload/route.ts            # image upload to Sanity assets
      taxonomy/route.ts          # read-only categories/tags
      admin/users/route.ts       # GET list, POST invite (admin only)

components/dashboard/
  LoginForm.tsx
  LogoutButton.tsx
  ArticleForm.tsx
  InviteUserForm.tsx

lib/
  supabase/
    client.ts        # browser client (anon key)
    server.ts         # server client (anon key + user session) + admin client (service role)
    middleware.ts      # session refresh + redirect logic used by root middleware.ts
  dashboard/
    roles.ts           # role/permission registry, nav config — the ONLY place to edit when adding a role
    session.ts          # getDashboardUser() / requireRole() — source of truth for "who is this"
    sanityDashboard.ts   # ownership-aware Sanity read/write helpers

middleware.ts           # root: refreshes session, gates /dashboard/*

supabase/migrations/0001_init.sql   # profiles table, RLS, triggers, activity_log
```

## 3. Database schema (Supabase Postgres)

See `supabase/migrations/0001_init.sql`. Summary:

- `dashboard_role` enum: `'admin' | 'editor'` — add new roles here later.
- `public.profiles`: one row per Supabase auth user (`id`, `email`, `full_name`,
  `role`, `active`). RLS: users may `select` only their own row. All
  inserts/updates/deletes happen server-side with the service role key —
  **a user can never change their own role from the client.**
- `on_auth_user_created` trigger: auto-creates a `profiles` row when an admin
  invites a new user via the Supabase Admin API.
- `public.activity_log`: empty table ready for future audit-log features, no
  client access (server-only), so it can be wired up later with zero schema
  changes.

Content itself is **not** duplicated into Postgres. Articles live only in
Sanity; Postgres only stores `who is this user and what role do they have`.

## 4. Sanity schema change

One additive change to `sanity/schemaTypes/newsPost.ts`:
- `dashboardOwnerId` (string, read-only) — Supabase user ID of the creator.
- `dashboardOwnerEmail` (string, read-only) — for display in Studio.

Both fields are optional and hidden from normal editing; existing documents,
queries, and the public frontend are unaffected. Articles created through the
dashboard appear immediately in Sanity Studio like any other document.

## 5. Authentication flow

1. Admin invites a user via `/dashboard/admin/users` → `POST /api/dashboard/admin/users`.
2. That route uses the **service role** Supabase client to call
   `auth.admin.inviteUserByEmail`, which creates the auth user and sends a
   Supabase-hosted invite email. The `handle_new_user` trigger creates their
   `profiles` row with the requested role.
3. The invited user sets their own password via the emailed link (Supabase
   handles this entirely — no plaintext password ever touches our server).
4. They log in at `/dashboard/login` with `supabase.auth.signInWithPassword`,
   which sets an HTTP-only, secure session cookie (via `@supabase/ssr`).
5. `middleware.ts` refreshes that cookie on every request and redirects
   unauthenticated users away from `/dashboard/*`.
6. Every Server Component and API route calls `getDashboardUser()` /
   `requireRole()`, which re-verifies the session server-side and looks up
   the role from `profiles` — **the client's claimed role is never trusted.**

## 6. API routes

| Route | Method | Access | Notes |
|---|---|---|---|
| `/api/dashboard/articles` | GET | admin, editor | Editors see only their own; enforced in the GROQ query |
| `/api/dashboard/articles` | POST | admin, editor | Always creates as `draft`, sets `dashboardOwnerId` server-side |
| `/api/dashboard/articles/[id]` | GET | admin, editor (owner only) | Returns 404 for both "not found" and "not yours" |
| `/api/dashboard/articles/[id]` | PATCH | admin, editor (owner only) | Editors can only set status to `draft`/`in_review` — never `published` |
| `/api/dashboard/upload` | POST | admin, editor | Validates type/size, uploads via server-only write token |
| `/api/dashboard/taxonomy` | GET | admin, editor | Read-only category/tag list |
| `/api/dashboard/admin/users` | GET/POST | admin only | Uses service role client, unreachable by editors |

## 7. Dashboard UI

- **Editor**: Overview → New Article / My Articles. Article form supports
  title, excerpt, body, featured image upload, category select, tag
  multi-select, SEO fields, Save Draft, Submit for Review.
- **Admin**: Everything an editor has, plus `/dashboard/admin` (stub landing
  with placeholders for Publishing Queue, Analytics, Settings, Media Library,
  Activity Log — each addable later with zero architecture changes) and
  `/dashboard/admin/users` (invite + list users).
- Adding a new role later: add it to the Postgres enum, `DashboardRole` union,
  `ROLE_PERMISSIONS`, and `NAV_ITEMS` in `lib/dashboard/roles.ts`. No other
  file needs to change.

## 8. Middleware

`middleware.ts` (root) delegates to `lib/supabase/middleware.ts`, which:
- Refreshes the Supabase session cookie on every request under `/dashboard/*`.
- Redirects unauthenticated users to `/dashboard/login?next=...`.
- Redirects already-authenticated users away from `/dashboard/login`.

Role-specific checks (admin vs editor) are **not** done in middleware (that
would require a DB round-trip on every request); they're done once per
request in the relevant Server Component / API route via `getDashboardUser()`,
which is the actual authorization boundary.

## 9. Environment variables

Add to `.env.local` (dev) and Vercel → Settings → Environment Variables (prod):

```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"   # server-only, never NEXT_PUBLIC_
```

`SANITY_API_WRITE_TOKEN` (already documented in `.env.example`) is reused by
the dashboard's Sanity writes — no new Sanity token is needed.

## 10. Setup / deployment guide

1. **Create a free Supabase project** at supabase.com.
2. **Run the migration**: open the SQL Editor in Supabase and paste the
   contents of `supabase/migrations/0001_init.sql`, then run it.
3. **Copy keys**: Project Settings → API → copy `Project URL`, `anon public`
   key, and `service_role` key into the env vars above.
4. **Configure email**: Authentication → Settings → make sure "Enable email
   confirmations"/invite email is on (Supabase's default SMTP works out of
   the box for low volume; add your own SMTP later if needed).
5. **Create your first admin**: since there are no users yet, either:
   - In Supabase Dashboard → Authentication → Users → "Add user", set a
     password, then in the SQL Editor run:
     `update public.profiles set role = 'admin' where email = 'you@example.com';`
   - Or temporarily call the invite API yourself once logged in as any user
     you've manually promoted to `admin` via the SQL above.
6. **Add env vars to Vercel** and redeploy.
7. Log in at `https://yourdomain.com/dashboard/login`.

## 11. Security review

| Concern | How it's addressed |
|---|---|
| Server-side authorization on every request | `getDashboardUser()`/`requireRole()` called at the top of every protected page and API route; role is re-read from `profiles`, never trusted from the client |
| Secure password hashing | Delegated entirely to Supabase Auth (industry-standard, audited) — no custom hashing code exists in this app |
| HTTP-only secure sessions | `@supabase/ssr` sets HTTP-only cookies; not readable by JavaScript |
| Middleware protection | `middleware.ts` blocks unauthenticated access to all `/dashboard/*` routes before any page code runs |
| Role-based authorization | Centralized in `lib/dashboard/roles.ts`; every API route explicitly declares which roles may call it |
| Ownership verification | `getArticleForUser`/`updateArticleForUser` check `dashboardOwnerId === user.id` for non-admins before returning or mutating any document; not-found and not-owned both return 404 (no existence leak) |
| Protection against privilege escalation | Role lives in `profiles`, writable only via the service-role client from server code that itself requires `role === 'admin'`; editors cannot set `status` beyond `draft`/`in_review` even if they tamper with the request body |
| No exposed API tokens | `SANITY_API_WRITE_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are read only in server-only modules (`lib/sanityServer.ts`, `lib/supabase/server.ts`) and API routes — never imported by any Client Component |
| No client-side trust | Every mutating action is re-validated server-side (title required, role checked, ownership checked) regardless of what the browser sends |
| No unnecessary attack surface | No custom auth code, no password storage in this codebase, no new public routes besides the documented API list, all under `/dashboard` and `/api/dashboard` |

### Trade-offs
- **Vendor coupling to Supabase Auth.** Mitigated: it's Postgres-backed and
  the `profiles` table/roles are plain SQL, so migrating away later is a
  matter of re-pointing auth, not re-architecting the app.
- **Plain-text article body for now.** The article form uses a plain
  textarea instead of the rich Portable Text editor used in Studio, to keep
  the first version simple. It writes valid Portable Text blocks, so
  upgrading to a rich editor later is a UI-only change — the API contract
  doesn't change.
- **Invite emails depend on Supabase's default SMTP**, which has low sending
  limits. Fine for a small editorial team; add custom SMTP in Supabase Auth
  settings if you scale up (still free to configure, cost depends on your
  SMTP provider).
