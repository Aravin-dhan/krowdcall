# Database Schema

All tables use TEXT primary keys (nanoid) and ISO 8601 timestamps stored as TEXT. The schema lives in `src/lib/schema.ts` and is applied by `ensureDatabase()` on startup.

---

## users

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `email` | TEXT UNIQUE NOT NULL | normalized to lowercase |
| `display_name` | TEXT NOT NULL | shown in UI |
| `password_hash` | TEXT NOT NULL | bcryptjs, 10 rounds |
| `role` | TEXT DEFAULT `'member'` | `member` or `admin` |
| `email_verified_at` | TEXT | ISO timestamp; null = unverified |
| `created_at` | TEXT NOT NULL | ISO timestamp |

Admin role is assigned automatically when:
- The signup email matches `ADMIN_EMAIL` env var, or
- `BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP=1` and no human admins exist yet.

---

## sessions

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `user_id` | TEXT FK → users.id | CASCADE DELETE |
| `token_hash` | TEXT UNIQUE NOT NULL | SHA256 of 32-byte random token |
| `expires_at` | TEXT NOT NULL | 30 days from creation |
| `created_at` | TEXT NOT NULL | ISO timestamp |

The raw token is stored in an HttpOnly cookie. The DB only stores the hash, so token leaks cannot be reversed.

---

## questions

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `slug` | TEXT UNIQUE NOT NULL | URL-safe, e.g. `will-tmc-win-wb-2026` |
| `title` | TEXT NOT NULL | 12–120 chars |
| `description` | TEXT NOT NULL | 20–280 chars |
| `category` | TEXT NOT NULL | 3–40 chars, e.g. `West Bengal 2026` |
| `status` | TEXT NOT NULL | `draft` / `active` / `locked` / `resolved` |
| `close_at` | TEXT NOT NULL | ISO timestamp; forecasting closes at this time |
| `resolve_by` | TEXT NOT NULL | ISO timestamp; resolution deadline |
| `resolution_source` | TEXT NOT NULL | 4–120 chars, e.g. `Election Commission of India` |
| `outcome` | INTEGER | `1` = YES, `0` = NO, `null` = unresolved |
| `created_by` | TEXT FK → users.id | nullable; system user for seeds |
| `created_at` | TEXT NOT NULL | ISO timestamp |

**Index**: `questions_status_close_idx` on `(status, close_at)`

### Status lifecycle

```
draft → active → locked → resolved
```

- `draft` — only visible to admins
- `active` — open for forecasting
- `locked` — forecasting closed, awaiting resolution
- `resolved` — outcome set; leaderboard calculates scores

---

## forecasts

One active forecast per user per question (enforced by UNIQUE constraint). Updating a forecast overwrites the existing row.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `user_id` | TEXT FK → users.id | CASCADE DELETE |
| `question_id` | TEXT FK → questions.id | CASCADE DELETE |
| `side` | TEXT DEFAULT `'agree'` | `agree` (YES) or `disagree` (NO) |
| `probability` | REAL NOT NULL | 1–99 |
| `stake_coins` | INTEGER DEFAULT 25 | 1–1000 |
| `created_at` | TEXT NOT NULL | ISO timestamp |
| `updated_at` | TEXT NOT NULL | ISO timestamp |

**Constraint**: UNIQUE `(user_id, question_id)`
**Index**: `forecasts_question_updated_idx` on `(question_id, updated_at)`

---

## forecast_ticks

Append-only history of every forecast placement or update. Powers the price history chart.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `question_id` | TEXT FK → questions.id | CASCADE DELETE |
| `side` | TEXT DEFAULT `'agree'` | `agree` or `disagree` |
| `probability` | REAL NOT NULL | snapshot at time of forecast |
| `stake_coins` | INTEGER DEFAULT 25 | snapshot at time of forecast |
| `created_at` | TEXT NOT NULL | ISO timestamp |

**Index**: `forecast_ticks_question_created_idx` on `(question_id, created_at)`

---

## market_events

Immutable audit log for every significant market action.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `question_id` | TEXT FK → questions.id | CASCADE DELETE |
| `actor_user_id` | TEXT FK → users.id | SET NULL on delete; null = system |
| `type` | TEXT NOT NULL | see types below |
| `note` | TEXT NOT NULL | human-readable detail |
| `created_at` | TEXT NOT NULL | ISO timestamp |

**Index**: `market_events_question_created_idx` on `(question_id, created_at)`

**Event types**: `created`, `published`, `locked`, `resolved`, `dispute_opened`, `dispute_resolved`, `dispute_dismissed`

---

## market_disputes

Resolution challenges filed by users.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `question_id` | TEXT FK → questions.id | CASCADE DELETE |
| `created_by` | TEXT FK → users.id | CASCADE DELETE |
| `message` | TEXT NOT NULL | 12–500 chars |
| `status` | TEXT DEFAULT `'open'` | `open` / `resolved` / `dismissed` |
| `resolution_note` | TEXT | nullable; admin's ruling |
| `resolved_by` | TEXT FK → users.id | SET NULL on delete |
| `resolved_at` | TEXT | ISO timestamp |
| `created_at` | TEXT NOT NULL | ISO timestamp |

**Index**: `market_disputes_question_status_created_idx` on `(question_id, status, created_at)`

---

## email_verification_tokens

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `user_id` | TEXT FK → users.id | CASCADE DELETE |
| `token_hash` | TEXT UNIQUE NOT NULL | SHA256 of raw token in email link |
| `expires_at` | TEXT NOT NULL | 24 hours from creation |
| `created_at` | TEXT NOT NULL | ISO timestamp |

---

## password_reset_tokens

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `user_id` | TEXT FK → users.id | CASCADE DELETE |
| `token_hash` | TEXT UNIQUE NOT NULL | SHA256 of raw token in email link |
| `expires_at` | TEXT NOT NULL | 2 hours from creation |
| `created_at` | TEXT NOT NULL | ISO timestamp |

---

## auth_rate_limits

Tracks per-action, per-IP/identifier request counts for rate limiting.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | nanoid |
| `action` | TEXT NOT NULL | see actions below |
| `key` | TEXT NOT NULL | composite key: `action:ip:x.x.x.x` or `action:id:email` |
| `count` | INTEGER DEFAULT 0 | requests in current window |
| `window_started_at` | TEXT NOT NULL | ISO timestamp of window start |
| `blocked_until` | TEXT | ISO timestamp; null = not blocked |
| `updated_at` | TEXT NOT NULL | ISO timestamp |

**Constraint**: UNIQUE `(action, key)`

**Actions**: `signup`, `login`, `resend_verification`, `password_reset_request`, `password_reset_consume`
