# Architecture

## Overview

Forecast Stack is a server-rendered Next.js app with a thin client layer. All data mutations go through React Server Actions. Real-time board updates are delivered via Server-Sent Events (SSE).

```
Browser
  │
  ├── Server Components (data fetching, rendering)
  ├── Client Components (interactive UI, SSE subscription)
  └── Server Actions (mutations: forecast, auth, admin)
        │
        ├── lib/db.ts       — raw DB queries (Drizzle ORM)
        ├── lib/data.ts     — aggregated data builders
        ├── lib/auth.ts     — session management
        └── lib/score.ts    — Brier score calculation
              │
              └── libSQL / SQLite (local) or Turso (hosted)
```

---

## Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components + Server Actions in one file |
| UI | React 19 | Concurrent features, `useActionState` |
| Database | libSQL / SQLite | Zero-cost local dev; Turso for hosted |
| ORM | Drizzle | Type-safe SQL, no abstraction overhead |
| Auth | Custom (bcryptjs + SHA256) | No external auth service needed |
| Email | Resend | Free tier, simple API |
| Hosting | Vercel | Zero-config Next.js deployment |
| CSS | Custom (globals.css) | Full control; no component library overhead |

---

## Request lifecycle

### Page load (Server Component)

```
GET /app
  → layout.tsx calls requireUser() (reads session cookie → DB lookup)
  → page.tsx calls buildPublicMarketSnapshots() + getUserForecasts()
  → HTML streamed to browser
```

### Mutation (Server Action)

```
User submits forecast form
  → forecastAction(formData) runs on server
  → validates input with Zod
  → checks auth, coins, market status
  → upsertForecast() → DB write
  → revalidatePath('/app') to bust Next.js cache
  → redirects or returns action state to client
```

### Real-time updates (SSE)

```
LiveBoardPanels (client component)
  → connects to GET /api/board/stream
  → server sends JSON snapshot every 5 seconds
  → client merges delta, flashes rows that moved
  → fallback: LiveRefresh polls page every 30s via router.refresh()
```

---

## File layout

```
src/
├── app/
│   ├── (app)/              # Protected app shell (requires auth)
│   │   ├── app/
│   │   │   ├── layout.tsx  # Sidebar + content wrapper
│   │   │   ├── page.tsx    # Feed / dashboard
│   │   │   ├── leaderboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── admin/page.tsx
│   │   └── markets/[slug]/page.tsx  # Market detail (also public)
│   ├── auth/               # Login / signup / verify / reset
│   ├── api/
│   │   ├── board/          # GET snapshot + SSE stream
│   │   └── markets/[slug]/ # Market detail API + SSE
│   ├── actions.ts          # All server actions
│   └── globals.css         # All styles
├── components/             # Shared UI components
├── lib/
│   ├── schema.ts           # Drizzle table definitions
│   ├── db.ts               # DB queries
│   ├── data.ts             # Aggregated data builders
│   ├── auth.ts             # Session & auth helpers
│   ├── score.ts            # Brier score
│   ├── utils.ts            # Formatting, math helpers
│   ├── email.ts            # Resend wrappers
│   └── election-pack.ts    # Bulk question seed data
└── config/
    └── site.ts             # App name, nav links
```

---

## Rendering strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` (landing) | Server Component | SSR with live market data |
| `/markets/[slug]` | Server Component + Client shell | SSR header; client SSE for live ticket |
| `/app` | Server Component | Auth-gated; SSR feed |
| `/app/profile` | Server Component | Auth-gated; static at request time |
| `/app/leaderboard` | Server Component | Auth-gated; static at request time |
| `/api/board/stream` | Route Handler | Long-lived SSE connection |

---

## Caching

Next.js cache is invalidated by `revalidatePath()` calls in Server Actions after every mutation. The SSE stream bypasses Next.js cache entirely — it reads directly from the DB.

---

## Database connection

`src/lib/db.ts` exports a single `db` client initialized from `DATABASE_URL` (SQLite file) or `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (Turso). The connection is module-level (not per-request) to avoid cold-start overhead.

`ensureDatabase()` is called once on startup and is idempotent: creates missing tables, adds missing columns via `ALTER TABLE IF NOT EXISTS`, creates indexes, and seeds the system user.
