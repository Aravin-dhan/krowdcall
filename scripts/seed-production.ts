/**
 * Cruxd — Production Seed Script
 * Creates schema, admin user, fake community users, all 21 markets, and seed forecasts.
 *
 * Usage (against production Turso):
 *   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=ey... npx tsx scripts/seed-production.ts
 *
 * Usage (local dev):
 *   npx tsx scripts/seed-production.ts
 */

import { randomUUID, createHash } from "node:crypto";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { electionPack2026 } from "../src/lib/election-pack";

// ── DB connection ─────────────────────────────────────────────────────────────

const databaseUrl =
  process.env.TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./data/local-dev.db";

const databaseAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

const client = createClient(
  databaseAuthToken ? { url: databaseUrl, authToken: databaseAuthToken } : { url: databaseUrl }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function now() {
  return new Date().toISOString();
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ── Fake users ─────────────────────────────────────────────────────────────────
// These accounts have verified emails but bcrypt hashes of random UUIDs as
// passwords — meaning they exist and show activity, but nobody can log in as them.

const FAKE_USERS = [
  { displayName: "Rohit Sharma",     email: "rohit.s.forecast@gmail.com"   },
  { displayName: "Priya Nair",       email: "priya.nair.calls@gmail.com"   },
  { displayName: "Arjun Mehta",      email: "arjun.mehta.pred@gmail.com"   },
  { displayName: "Deepika Iyer",     email: "deepika.iyer.kc@gmail.com"    },
  { displayName: "Karthik Rajan",    email: "karthik.rajan.fc@gmail.com"   },
  { displayName: "Sneha Patel",      email: "sneha.patel.cruxd@gmail.com" },
  { displayName: "Vikram Bose",      email: "vikram.bose.markets@gmail.com"   },
  { displayName: "Ananya Krishnan",  email: "ananya.krishnan.fc@gmail.com"    },
  { displayName: "Rahul Verma",      email: "rahulverma.calls@gmail.com"   },
  { displayName: "Meera Joshi",      email: "meera.joshi.pred@gmail.com"   },
  { displayName: "Suresh Iyer",      email: "suresh.iyer.kc@gmail.com"     },
  { displayName: "Kavya Reddy",      email: "kavya.reddy.forecasts@gmail.com" },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function createSchema() {
  console.log("Creating schema...");

  await client.execute(`PRAGMA foreign_keys = ON`);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      email_verified_at TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      close_at TEXT NOT NULL,
      resolve_by TEXT NOT NULL,
      resolution_source TEXT NOT NULL,
      outcome INTEGER,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS forecasts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      side TEXT NOT NULL DEFAULT 'agree',
      probability REAL NOT NULL,
      stake_coins INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(user_id, question_id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS forecast_ticks (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      side TEXT NOT NULL,
      probability REAL NOT NULL,
      stake_coins INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS market_events (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      actor_user_id TEXT,
      type TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS market_disputes (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      resolution_note TEXT,
      resolved_by TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      window_started_at TEXT NOT NULL,
      blocked_until TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(action, key)
    )
  `);

  console.log("  Schema ready.");
}

async function createAdminUser() {
  console.log("Creating system admin user...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@cruxd.in";
  const existing = await client.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [adminEmail]
  });

  if (existing.rows.length > 0) {
    console.log(`  Admin user already exists (${adminEmail}).`);
    return existing.rows[0].id as string;
  }

  const adminId = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID(), 10); // random — set real password via reset flow
  await client.execute({
    sql: `INSERT OR IGNORE INTO users (id, email, display_name, password_hash, role, email_verified_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [adminId, adminEmail, "Cruxd Admin", passwordHash, "admin", now(), now()]
  });

  console.log(`  Admin created: ${adminEmail}`);
  return adminId;
}

async function createFakeUsers() {
  console.log("Creating fake community users...");
  const ids: string[] = [];

  for (const u of FAKE_USERS) {
    const existing = await client.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [u.email]
    });
    if (existing.rows.length > 0) {
      ids.push(existing.rows[0].id as string);
      continue;
    }

    const id = randomUUID();
    // bcrypt of a random UUID — no one can log in as these users
    const passwordHash = await bcrypt.hash(randomUUID(), 10);
    const createdDaysAgo = Math.floor(Math.random() * 14) + 1;

    await client.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, display_name, password_hash, role, email_verified_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, u.email, u.displayName, passwordHash, "member", daysAgo(createdDaysAgo), daysAgo(createdDaysAgo)]
    });
    ids.push(id);
  }

  console.log(`  ${FAKE_USERS.length} community users ready.`);
  return ids;
}

async function createMarkets(adminId: string) {
  console.log("Creating markets...");
  const questionIds: string[] = [];

  for (const q of electionPack2026) {
    const slug = slugify(q.title);
    const existing = await client.execute({
      sql: "SELECT id FROM questions WHERE slug = ?",
      args: [slug]
    });

    if (existing.rows.length > 0) {
      questionIds.push(existing.rows[0].id as string);
      continue;
    }

    const id = randomUUID();
    const createdAt = daysAgo(Math.floor(Math.random() * 7) + 1);

    await client.execute({
      sql: `INSERT INTO questions (id, slug, title, description, category, status, close_at, resolve_by, resolution_source, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, slug, q.title, q.description, q.category, q.status, q.closeAt, q.resolveBy, q.resolutionSource, adminId, createdAt]
    });

    // Log market creation event
    await client.execute({
      sql: `INSERT INTO market_events (id, question_id, actor_user_id, type, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), id, adminId, "created", "Market published", createdAt]
    });

    questionIds.push(id);
  }

  console.log(`  ${electionPack2026.length} markets ready.`);
  return questionIds;
}

async function createSeedForecasts(userIds: string[], questionIds: string[]) {
  console.log("Creating seed forecasts...");
  let count = 0;

  for (const questionId of questionIds) {
    // Each market gets 4-9 forecasters
    const numForecasters = Math.floor(Math.random() * 6) + 4;
    const shuffled = [...userIds].sort(() => Math.random() - 0.5).slice(0, numForecasters);

    // Generate a "consensus" probability with some spread around it
    const consensus = 30 + Math.floor(Math.random() * 50); // 30–80%

    for (const userId of shuffled) {
      // Each user's probability is within ±20 of the consensus
      const spread = Math.floor(Math.random() * 40) - 20;
      const probability = Math.min(95, Math.max(5, consensus + spread));
      const stakeCoins = [50, 100, 150, 200, 250, 500][Math.floor(Math.random() * 6)];
      const side = Math.random() > 0.35 ? "agree" : "disagree";
      const createdAt = daysAgo(Math.floor(Math.random() * 5) + 1);

      try {
        const forecastId = randomUUID();
        await client.execute({
          sql: `INSERT OR IGNORE INTO forecasts (id, user_id, question_id, side, probability, stake_coins, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [forecastId, userId, questionId, side, probability, stakeCoins, createdAt, createdAt]
        });

        // Add a tick for the sparkline
        await client.execute({
          sql: `INSERT INTO forecast_ticks (id, question_id, side, probability, stake_coins, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [randomUUID(), questionId, side, probability, stakeCoins, createdAt]
        });

        count++;
      } catch {
        // ignore duplicate key errors
      }
    }
  }

  console.log(`  ${count} forecasts created.`);
}

async function main() {
  console.log(`\nCruxd Production Seed`);
  console.log(`DB: ${databaseUrl}\n`);

  await createSchema();
  const adminId = await createAdminUser();
  const userIds = await createFakeUsers();
  const questionIds = await createMarkets(adminId);
  await createSeedForecasts(userIds, questionIds);

  console.log("\nSeed complete!");
  console.log(`  Admin email:   ${process.env.ADMIN_EMAIL ?? "admin@cruxd.in"}`);
  console.log(`  Markets:       ${questionIds.length}`);
  console.log(`  Community:     ${userIds.length} users`);
  console.log(`\nNext: Go to ${process.env.APP_URL ?? "your app URL"} and sign up with`);
  console.log(`  your ADMIN_EMAIL to claim admin access.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
