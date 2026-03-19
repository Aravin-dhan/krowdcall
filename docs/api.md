# API & Server Actions

---

## API routes

### `GET /api/board`

Returns a JSON snapshot of all public markets.

**Response**:
```json
[
  {
    "id": "...",
    "slug": "will-tmc-win-wb-2026",
    "title": "Will the TMC win a majority in the West Bengal Assembly election?",
    "category": "West Bengal 2026",
    "status": "active",
    "closeAt": "2026-05-01T09:00:00.000Z",
    "resolveBy": "2026-05-15T09:00:00.000Z",
    "probability": 45,
    "forecasterCount": 3,
    "totalStake": 750,
    "outcome": null
  }
]
```

### `GET /api/board/stream`

Server-Sent Events stream. Emits a full market snapshot every 5 seconds.

```
event: message
data: [{ ...market }, ...]
```

Used by `LiveBoardPanels` to show live price changes with flash animations.

### `GET /api/markets/[slug]`

Returns full detail for a single market including forecast ticks and market events.

### `GET /api/markets/[slug]/stream`

SSE stream for a single market. Used by `LiveMarketView` to keep the order ticket live.

### `GET /api/markets/[slug]/news`

Fetches recent news for the market topic (used in the market enforcement panel).

---

## Server Actions

All mutations are React Server Actions defined in `src/app/actions.ts`. They accept `FormData` and return an `ActionState` object:

```ts
type ActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}
```

---

### Auth actions

#### `signupAction(formData)`

| Field | Type | Validation |
|---|---|---|
| `email` | string | valid email |
| `password` | string | ≥ 8 characters |
| `displayName` | string | 2–40 characters |

Creates a new user. If `AUTO_VERIFY_LOCAL=1`, auto-verifies and redirects to `/app`. Otherwise sends verification email.

#### `loginAction(formData)`

| Field | Type | Validation |
|---|---|---|
| `email` | string | valid email |
| `password` | string | required |

Verifies credentials. If email unverified, sends fresh verification link. On success, creates a 30-day session and redirects to `/app`.

#### `logoutAction()`

Deletes the current session cookie and DB session. Redirects to `/`.

#### `resendVerificationAction(formData)`

| Field | Type |
|---|---|
| `email` | string |

Sends a new verification email. Rate limited: 5 per email/IP per hour.

#### `requestPasswordResetAction(formData)`

| Field | Type |
|---|---|
| `email` | string |

Sends a password reset email. Silently succeeds for unknown emails. Rate limited.

#### `resetPasswordAction(formData)`

| Field | Type |
|---|---|
| `token` | string |
| `password` | string (≥ 8 chars) |

Consumes reset token, updates password, logs out all sessions, auto-logs in.

---

### Forecast actions

#### `forecastAction(formData)`

| Field | Type | Validation |
|---|---|---|
| `slug` | string | existing question slug |
| `side` | string | `agree` or `disagree` |
| `probability` | number | 1–99 |
| `stakeCoins` | number | 1–1,000 |

Requires authentication. Validates:
- Question exists and is `active`
- `close_at` is in the future
- User has enough `availableCoins`

Upserts the forecast (one per user per question). Always appends a `forecast_tick`. Revalidates the market page.

---

### Admin actions

All admin actions call `requireAdmin()` — they 403 for non-admins.

#### `createQuestionAction(formData)`

| Field | Type | Validation |
|---|---|---|
| `title` | string | 12–120 chars |
| `description` | string | 20–280 chars |
| `category` | string | 3–40 chars |
| `closeAt` | datetime-local | future date |
| `resolveBy` | datetime-local | after closeAt |
| `resolutionSource` | string | 4–120 chars |
| `status` | string | `draft` or `active` |

Creates question and logs a `created` market event.

#### `setQuestionStatusAction(formData)`

| Field | Type | Values |
|---|---|---|
| `questionId` | string | existing id |
| `status` | string | `draft`, `active`, `locked` |
| `note` | string | optional note |

Changes market status. Logs `published` or `locked` event.

#### `resolveQuestionAction(formData)`

| Field | Type | Values |
|---|---|---|
| `questionId` | string | existing id |
| `outcome` | number | `1` (YES) or `0` (NO) |
| `note` | string | optional resolution note |

Sets `outcome`, moves status to `resolved`, logs `resolved` event. Triggers payout calculation.

#### `importElectionPackAction(formData)`

Bulk imports the 2026 India election question pack (`src/lib/election-pack.ts`). Skips questions whose slugs already exist.

---

### Dispute actions

#### `createMarketDisputeAction(formData)`

| Field | Type | Validation |
|---|---|---|
| `questionId` | string | existing id |
| `message` | string | 12–500 chars |

Requires authentication. Creates dispute and logs `dispute_opened` event.

#### `resolveMarketDisputeAction(formData)`

| Field | Type | Values |
|---|---|---|
| `disputeId` | string | existing id |
| `questionId` | string | existing id |
| `status` | string | `resolved` or `dismissed` |
| `resolutionNote` | string | required |

Admin only. Closes dispute and logs `dispute_resolved` or `dispute_dismissed` event.
