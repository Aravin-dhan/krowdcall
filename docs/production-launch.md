# Pakka Production Launch Guide

Everything here uses free tiers. Total cost: ~$6-10/year for the domain only.

---

## 1. Database: Turso (Free Tier)

**Free tier:** 9GB storage, 500M row reads/month, 25K row writes/month.

### Setup

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create pakka

# Get the connection URL
turso db show pakka --url
# Output: libsql://pakka-<your-username>.turso.io

# Create an auth token
turso db tokens create pakka
# Output: eyJhbG...  (save this)
```

### Production env vars

The app already supports both `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` and `DATABASE_URL`/`DATABASE_AUTH_TOKEN`. No code changes needed.

```
DATABASE_URL=libsql://pakka-<your-username>.turso.io
DATABASE_AUTH_TOKEN=eyJhbG...
```

### Initialize production database

Run the seed against production:

```bash
DATABASE_URL=libsql://pakka-xxx.turso.io \
DATABASE_AUTH_TOKEN=eyJhbG... \
node --env-file=.env.production scripts/seed.ts
```

---

## 2. Email: Resend (Free Tier)

**Free tier:** 100 emails/day, 3,000 emails/month. More than enough for launch.

### Setup

1. Go to [resend.com](https://resend.com) and sign up
2. **Add your domain** (Settings > Domains > Add Domain)
   - Add the DNS records (MX, TXT, DKIM) they provide to your domain registrar
   - Wait for verification (usually 5-30 minutes)
3. **Create an API key** (Settings > API Keys > Create)
4. Update your production env:

```
RESEND_API_KEY=re_LIVE_xxxxxxxxxxxx
EMAIL_FROM="Pakka <hello@yourdomain.in>"
```

**Note:** Until you verify a domain, you can only send to your own email. Verify the domain before inviting users.

---

## 3. Hosting: Vercel (Free Tier)

**Free tier:** Unlimited deploys, serverless functions, edge network, custom domains, SSL.

### Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Environment Variables

In Vercel dashboard (Settings > Environment Variables), add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `libsql://pakka-xxx.turso.io` | Production |
| `DATABASE_AUTH_TOKEN` | `eyJhbG...` | Production |
| `RESEND_API_KEY` | `re_LIVE_xxx` | Production |
| `EMAIL_FROM` | `Pakka <hello@yourdomain.in>` | Production |
| `APP_URL` | `https://yourdomain.in` | Production |
| `ADMIN_EMAIL` | `your-real-email@gmail.com` | Production |

**Do NOT set** `AUTO_VERIFY_LOCAL` in production. Users must verify email.

### Custom Domain

1. Vercel Dashboard > Project > Settings > Domains
2. Add `yourdomain.in`
3. Update DNS at your registrar:
   - Type: `CNAME`, Name: `@` or `www`, Value: `cname.vercel-dns.com`
   - Or use Vercel nameservers for automatic setup

---

## 4. Domain Registration

Recommended registrars for `.in` domains:

| Registrar | Price | Notes |
|-----------|-------|-------|
| [Namecheap](https://namecheap.com) | ~$5-8/yr | Good DNS management |
| [BigRock](https://bigrock.in) | ~Rs 500-700/yr | Indian registrar |
| [GoDaddy](https://godaddy.com) | ~$6-10/yr | Most popular |
| [Cloudflare](https://cloudflare.com) | At-cost pricing | Best value, free DNS/CDN |

Check availability: `pakka.in`, `pakka.co.in`, `pakka.com`

---

## 5. Pre-Launch Checklist

### Infrastructure
- [ ] Turso database created and seeded
- [ ] Resend domain verified and API key created
- [ ] Vercel project deployed with all env vars
- [ ] Custom domain connected with SSL
- [ ] Admin account created (sign up with ADMIN_EMAIL)

### Legal
- [ ] Terms of Service live at `/legal/terms`
- [ ] Privacy Policy live at `/legal/privacy`
- [ ] Disclaimer live at `/legal/disclaimer`
- [ ] 18+ age checkbox on signup
- [ ] "No real money" messaging visible on landing page
- [ ] Legal footer on landing, auth, and app pages

### Content
- [ ] Seed 5-10 real markets with clear resolution sources
- [ ] Resolution sources are publicly verifiable (e.g., Election Commission of India)
- [ ] All market descriptions are clear and unambiguous

### Security
- [ ] `AUTO_VERIFY_LOCAL` is NOT set in production
- [ ] Session cookie has `secure: true` in production (already handled in code)
- [ ] Rate limiting is active on all auth endpoints
- [ ] ADMIN_EMAIL is your real email

### Testing
- [ ] Sign up flow works (email verification received)
- [ ] Login flow works
- [ ] Password reset flow works
- [ ] Forecast placement works
- [ ] Market resolution works (admin)
- [ ] Legal pages all load correctly
- [ ] Light/dark theme works
- [ ] Mobile layout works

---

## 6. Post-Launch Monitoring

### Free monitoring options

| Tool | What it monitors | Free tier |
|------|-----------------|-----------|
| [Vercel Analytics](https://vercel.com/analytics) | Page views, Web Vitals | Built-in |
| [UptimeRobot](https://uptimerobot.com) | Uptime monitoring | 50 monitors, 5min checks |
| [Sentry](https://sentry.io) | Error tracking | 5K events/month |
| [Turso Dashboard](https://turso.tech) | DB usage, row counts | Built-in |

### Key metrics to watch
- Turso row reads (stay under 500M/month)
- Resend email count (stay under 100/day)
- Vercel function invocations
- Error rates in Vercel logs

---

## 7. Scaling Notes

The free tiers are generous for an MVP:
- **Turso free** handles ~16K row reads/minute — enough for hundreds of concurrent users
- **Resend free** at 100 emails/day supports ~100 new signups/day
- **Vercel free** has no hard limit on requests for hobby projects

When you outgrow free tiers:
- Turso Scaler: $29/month (1B reads, 25M writes)
- Resend Pro: $20/month (50K emails)
- Vercel Pro: $20/month (more functions, analytics)
