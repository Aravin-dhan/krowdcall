# Auth System

All auth logic lives in `src/lib/auth.ts`. No third-party auth service is used.

---

## Session model

| Property | Value |
|---|---|
| Cookie name | `kalshi_session` |
| Duration | 30 days |
| Storage | HttpOnly, SameSite=Lax; Secure in production |
| Token | 32-byte random; SHA256 hash stored in DB |

The raw token is placed in the cookie. The database only stores its SHA256 hash — a stolen DB dump cannot be used to forge sessions.

On each authenticated request, `getCurrentUser()`:
1. Reads the cookie
2. Hashes the token
3. Queries `sessions` for a matching, non-expired hash
4. Returns the joined `users` row (or `null`)

---

## Access control helpers

| Helper | Behaviour |
|---|---|
| `getCurrentUser()` | Returns user or `null`. Never redirects. |
| `requireUser()` | Redirects to `/auth` if not authenticated. Redirects to `/auth?verify=required` if email unverified. |
| `requireAdmin()` | Calls `requireUser()` then checks `role === 'admin'`. Returns 403 if not admin. |

---

## Signup flow

```
POST /auth (signupAction)
  1. Validate email + password (Zod: email format, password ≥ 8 chars)
  2. Rate limit: 5 signups per IP + 5 per email in 15-min window
  3. Check email uniqueness
  4. Hash password (bcryptjs, 10 rounds)
  5. Insert user
     - AUTO_VERIFY_LOCAL=1 → emailVerifiedAt set immediately
     - Otherwise → emailVerifiedAt = null
  6a. If auto-verified → create session → redirect to /app
  6b. Otherwise → send verification email → show "check your email"
```

---

## Login flow

```
POST /auth (loginAction)
  1. Validate email + password (Zod)
  2. Rate limit: 10 logins per IP + 10 per email in 15-min window
  3. Look up user by email
  4. Compare password with bcryptjs
  5. If email unverified → send fresh verification email → return error
  6. Create session (30-day expiry) → set HttpOnly cookie → redirect to /app
```

---

## Email verification

Verification links are sent on signup (if not auto-verified) and on login attempts with an unverified account.

```
GET /auth/verify?token=<raw-token>
  1. SHA256 hash the token
  2. Query email_verification_tokens for matching, non-expired hash
  3. Set user.emailVerifiedAt
  4. Delete token
  5. Create session → redirect to /app
```

- Tokens expire in 24 hours
- Resend limit: 5 per email/IP per hour (`resend_verification` action)
- Old tokens for a user are deleted when a new one is issued

---

## Password reset

```
POST /auth/reset (requestPasswordResetAction)
  1. Rate limit: 5 requests per email/IP per hour
  2. Look up user (silently ignore unknown email)
  3. Delete old tokens for user
  4. Create new token (expires 2 hours)
  5. Send reset email

GET /auth/reset?token=<raw-token>  → shows reset form

POST /auth/reset (resetPasswordAction)
  1. Rate limit: 10 consume attempts per token per hour
  2. SHA256 hash token → look up in password_reset_tokens
  3. Check not expired
  4. Hash new password
  5. Update user.passwordHash
  6. Delete all password_reset_tokens for user
  7. Delete all sessions for user (log out everywhere)
  8. Create new session → redirect to /app
```

---

## Rate limiting

Rate limits are stored in `auth_rate_limits` and keyed by `action:type:value`:

| Action | Key | Limit | Window |
|---|---|---|---|
| `signup` | IP + email | 5 each | 15 min |
| `login` | IP + email | 10 each | 15 min |
| `resend_verification` | IP + email | 5 each | 60 min |
| `password_reset_request` | IP + email | 5 each | 60 min |
| `password_reset_consume` | token hash | 10 | 60 min |

When the limit is exceeded, `blocked_until` is set (30–60 min). Stale records (> 7 days since last update) are pruned automatically.

---

## Admin accounts

An account receives the `admin` role if either:

- Its email exactly matches `ADMIN_EMAIL` at signup time, or
- `BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP=1` is set and no human admin exists yet.

There is also a `system@forecast.local` seeded user (role `admin`) that owns seed questions. It has no password and cannot log in.
