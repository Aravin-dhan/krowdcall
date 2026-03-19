# Admin Guide

The admin panel is at `/app/admin`. It is only accessible to users with `role = 'admin'`.

---

## Getting admin access

**Local dev**: Sign up with the email set in `ADMIN_EMAIL` in `.env.local`.

**Production (first deploy)**:
- Set `ADMIN_EMAIL` to your signup email, or
- Set `BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP=1` — the first user to sign up becomes admin.

---

## Dashboard stats

The admin header shows live counts:

| Stat | What it counts |
|---|---|
| Users | All registered users |
| Forecasts | All active forecasts in the system |
| Active | Questions with `status = active` |
| Drafts | Questions with `status = draft` |
| Locked | Questions with `status = locked` |
| Disputes | Open (unresolved) disputes |

---

## Creating a question

Fill in the "Publish a new question" form:

| Field | Notes |
|---|---|
| Title | 12–120 chars. Phrased as a yes/no question, e.g. *Will X happen?* |
| Description | 20–280 chars. Criteria, timing, edge cases. |
| Category | 3–40 chars. Groups related questions, e.g. `West Bengal 2026`. |
| Resolution source | 4–120 chars. Where the outcome will be determined. |
| Close at | When forecasting stops. Must be in the future. |
| Resolve by | Deadline for setting outcome. Must be after Close at. |
| Status | `draft` (invisible to users) or `active` (live immediately). |

On submit, a `created` market event is logged and the question appears in the admin list.

---

## Question lifecycle

```
draft ──► active ──► locked ──► resolved
```

### draft → active

Click **Publish** in the admin list. The question becomes visible to all users and open for forecasting.

### active → locked

Click **Lock** (optionally add a note). Forecasting closes. The question awaits resolution.

### locked → resolved

The **AdminResolveForm** (two-step confirm) appears for locked questions:

1. Click **Resolve YES** or **Resolve NO** — arms the action.
2. Click **Confirm YES** or **Confirm NO** — submits the resolution.
3. Optionally add a note before confirming.

On resolution:
- `outcome` is set to `1` (YES) or `0` (NO)
- Status moves to `resolved`
- Payouts are calculated on next wallet summary request
- A `resolved` event is logged

You can also lock a question with a note explaining the delay, and leave it in `locked` state until results are officially announced.

---

## Market packs (bulk import)

The **Import 2026 elections** button imports a pre-built set of questions for the 2026 India state elections (West Bengal, Tamil Nadu, Kerala, Puducherry, Assam). Questions already in the DB (matched by slug) are skipped.

To add your own packs, edit `src/lib/election-pack.ts`.

---

## Disputes

Users can file resolution challenges on any question. Open disputes appear at the bottom of the admin page.

Each dispute shows:
- The question it relates to
- The user who filed it
- Their message

To resolve:
1. Add a resolution note
2. Click **Resolve** (outcome stands) or **Dismiss** (dispute rejected)

Both actions log a market event and close the dispute.

---

## Audit log

Every significant action on a question is recorded in `market_events`. The event log is visible on the market detail page under "Price history" for admins, and on the enforcement panel. Events include:

| Type | Trigger |
|---|---|
| `created` | Question created |
| `published` | Status → active |
| `locked` | Status → locked |
| `resolved` | Outcome set |
| `dispute_opened` | User files dispute |
| `dispute_resolved` | Admin resolves dispute |
| `dispute_dismissed` | Admin dismisses dispute |
