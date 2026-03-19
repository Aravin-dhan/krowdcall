import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("Missing TURSO_DATABASE_URL or DATABASE_URL");
}

const client = createClient(
  authToken
    ? {
        url: databaseUrl,
        authToken
      }
    : { url: databaseUrl }
);

const now = new Date().toISOString();

const localUsers = [
  {
    email: "local-admin@forecaststack.dev",
    displayName: "Local Admin",
    password: "KalshiAdmin!2026",
    role: "admin"
  },
  {
    email: "local-member@forecaststack.dev",
    displayName: "Local Member",
    password: "KalshiMember!2026",
    role: "member"
  }
] as const;

const electionPack2026 = [
  {
    title: "Will the TMC win a majority in the West Bengal Assembly election?",
    description:
      "Resolve YES if the Trinamool Congress wins 147 or more seats in the 2026 West Bengal Assembly election. Resolve NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-07T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the BJP win 100 or more seats in West Bengal?",
    description:
      "Resolve YES if the Bharatiya Janata Party wins at least 100 seats in the 2026 West Bengal Assembly election. Resolve NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-07T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will voter turnout in West Bengal exceed 80%?",
    description:
      "Resolve YES if the final official voter turnout in the 2026 West Bengal Assembly election is greater than 80.0%. Resolve NO otherwise.",
    category: "West Bengal 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-07T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the DMK-led alliance win a majority in Tamil Nadu?",
    description:
      "Resolve YES if the DMK-led alliance wins 118 or more seats in the 2026 Tamil Nadu Assembly election. Resolve NO otherwise.",
    category: "Tamil Nadu 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the AIADMK-led alliance win 75 or more seats in Tamil Nadu?",
    description:
      "Resolve YES if the AIADMK-led alliance wins at least 75 seats in the 2026 Tamil Nadu Assembly election. Resolve NO otherwise.",
    category: "Tamil Nadu 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will Tamil Nadu voter turnout exceed 75%?",
    description:
      "Resolve YES if the final official voter turnout in the 2026 Tamil Nadu Assembly election is greater than 75.0%. Resolve NO otherwise.",
    category: "Tamil Nadu 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-10T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the BJP-led alliance retain a majority in Assam?",
    description:
      "Resolve YES if the BJP-led alliance wins 64 or more seats in the 2026 Assam Assembly election. Resolve NO otherwise.",
    category: "Assam 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-20T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will Congress win 30 or more seats in Assam?",
    description:
      "Resolve YES if the Indian National Congress wins at least 30 seats in the 2026 Assam Assembly election. Resolve NO otherwise.",
    category: "Assam 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-20T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will Assam turnout exceed 82%?",
    description:
      "Resolve YES if the final official voter turnout in the 2026 Assam Assembly election is greater than 82.0%. Resolve NO otherwise.",
    category: "Assam 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-20T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the LDF retain power in Kerala?",
    description:
      "Resolve YES if the Left Democratic Front wins 71 or more seats in the 2026 Kerala Assembly election. Resolve NO otherwise.",
    category: "Kerala 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-23T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the UDF win a majority in Kerala?",
    description:
      "Resolve YES if the United Democratic Front wins 71 or more seats in the 2026 Kerala Assembly election. Resolve NO otherwise.",
    category: "Kerala 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-23T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the BJP win at least 1 seat in Kerala?",
    description:
      "Resolve YES if the Bharatiya Janata Party wins one or more seats in the 2026 Kerala Assembly election. Resolve NO otherwise.",
    category: "Kerala 2026",
    closeAt: "2026-05-01T09:00:00.000Z",
    resolveBy: "2026-05-23T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the NDA win a majority in Puducherry?",
    description:
      "Resolve YES if the NDA wins 16 or more of the 30 elected seats in the 2026 Puducherry Assembly election. Resolve NO otherwise.",
    category: "Puducherry 2026",
    closeAt: "2026-06-01T09:00:00.000Z",
    resolveBy: "2026-06-15T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will the Congress-led alliance win 10 or more seats in Puducherry?",
    description:
      "Resolve YES if the Congress-led alliance wins at least 10 elected seats in the 2026 Puducherry Assembly election. Resolve NO otherwise.",
    category: "Puducherry 2026",
    closeAt: "2026-06-01T09:00:00.000Z",
    resolveBy: "2026-06-15T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  },
  {
    title: "Will turnout in Puducherry exceed 82%?",
    description:
      "Resolve YES if the final official voter turnout in the 2026 Puducherry Assembly election is greater than 82.0%. Resolve NO otherwise.",
    category: "Puducherry 2026",
    closeAt: "2026-06-01T09:00:00.000Z",
    resolveBy: "2026-06-15T12:00:00.000Z",
    resolutionSource: "Election Commission of India final results / turnout data",
    status: "active"
  }
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureTables() {
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
      status TEXT NOT NULL,
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
      probability REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(user_id, question_id)
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
}

async function upsertLocalUsers() {
  for (const user of localUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const existing = await client.execute({
      sql: "select id from users where email = ?",
      args: [user.email]
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: `
          update users
          set display_name = ?, password_hash = ?, role = ?, email_verified_at = ?
          where email = ?
        `,
        args: [user.displayName, passwordHash, user.role, now, user.email]
      });
      continue;
    }

    await client.execute({
      sql: `
        insert into users (id, email, display_name, password_hash, role, email_verified_at, created_at)
        values (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [randomUUID(), user.email, user.displayName, passwordHash, user.role, now, now]
    });
  }
}

async function ensureSystemUser() {
  const existing = await client.execute({
    sql: "select id from users where email = ?",
    args: ["system@forecast.local"]
  });

  if (existing.rows.length > 0) {
    return;
  }

  await client.execute({
    sql: `
      insert into users (id, email, display_name, password_hash, role, email_verified_at, created_at)
      values (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [randomUUID(), "system@forecast.local", "System", "disabled", "admin", now, now]
  });
}

async function importElectionPack() {
  const adminRow = await client.execute({
    sql: "select id from users where email = ?",
    args: ["local-admin@forecaststack.dev"]
  });
  const adminId = String(adminRow.rows[0]?.id ?? "");

  if (!adminId) {
    throw new Error("Local admin account missing.");
  }

  for (const question of electionPack2026) {
    const slug = slugify(question.title);
    const existing = await client.execute({
      sql: "select id from questions where slug = ?",
      args: [slug]
    });

    if (existing.rows.length > 0) {
      await client.execute({
        sql: `
          update questions
          set title = ?, description = ?, category = ?, status = ?, close_at = ?, resolve_by = ?, resolution_source = ?
          where slug = ?
        `,
        args: [
          question.title,
          question.description,
          question.category,
          question.status,
          question.closeAt,
          question.resolveBy,
          question.resolutionSource,
          slug
        ]
      });
      continue;
    }

    await client.execute({
      sql: `
        insert into questions (
          id, slug, title, description, category, status, close_at, resolve_by,
          resolution_source, outcome, created_by, created_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        randomUUID(),
        slug,
        question.title,
        question.description,
        question.category,
        question.status,
        question.closeAt,
        question.resolveBy,
        question.resolutionSource,
        null,
        adminId,
        now
      ]
    });
  }
}

async function main() {
  await ensureTables();
  await ensureSystemUser();
  await upsertLocalUsers();
  await importElectionPack();

  const users = await client.execute({
    sql: "select email, role from users where email like 'local-%' order by email"
  });
  const questions = await client.execute({
    sql: "select count(*) as count from questions"
  });

  console.log("Local users:", JSON.stringify(users.rows, null, 2));
  console.log("Question count:", questions.rows[0]?.count ?? 0);
}

await main();
