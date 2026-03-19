# Forecast Stack

A prediction market app where users forecast yes/no outcomes on real-world events and earn coins for accuracy.

## Quick links

- [Architecture](docs/architecture.md) — system design, data flow, stack decisions
- [Database schema](docs/schema.md) — all tables, columns, indexes
- [Auth system](docs/auth.md) — sessions, email verification, rate limiting
- [Forecasting mechanics](docs/forecasting.md) — pricing, payouts, scoring, wallet
- [API & server actions](docs/api.md) — all routes and mutations
- [UI design system](docs/ui.md) — CSS tokens, theming, components
- [Admin guide](docs/admin.md) — managing questions, resolving markets, disputes

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```env
DATABASE_URL=file:./data/app.db
ADMIN_EMAIL=you@example.com
APP_URL=http://localhost:3000
AUTO_VERIFY_LOCAL=1
```

### 3. Seed the database

```bash
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

Sign up with the email in `ADMIN_EMAIL` to get an admin account.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path (`file:./data/app.db`) or Turso URL |
| `ADMIN_EMAIL` | Yes | Email that automatically receives the `admin` role on signup |
| `APP_URL` | Yes | Origin used in auth emails (e.g. `https://yourapp.com`) |
| `AUTO_VERIFY_LOCAL` | Dev only | Set to `1` to skip email verification on signup |
| `TURSO_DATABASE_URL` | Prod | Hosted libSQL URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Prod | Turso auth token |
| `RESEND_API_KEY` | Prod | Resend API key for transactional email |
| `EMAIL_FROM` | Prod | From address (e.g. `Forecast Stack <auth@example.com>`) |
| `BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP` | Optional | Set to `1` so the first real user becomes admin once |

---

## npm scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run dev:fresh` | Clear `.next` then start dev (fixes stale chunk errors) |
| `npm run build` | Production build |
| `npm run build:isolated` | Build to `.next-build` without stopping the running dev server |
| `npm run build:fresh` | Clear `.next-build` then build |
| `npm run db:seed` | Seed the local database with sample questions |
| `npm run lint` | Run ESLint |

---

## Deployment

| Step | Detail |
|---|---|
| Host | Vercel free tier |
| Database | Turso (hosted libSQL) — set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` |
| Email | Resend free tier — set `RESEND_API_KEY` + `EMAIL_FROM` |
| Admin | Set `ADMIN_EMAIL` or `BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP=1` |
| Verification | Unset `AUTO_VERIFY_LOCAL` in production |

The app auto-initializes its schema on first startup — no migration step needed.
