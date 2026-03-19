import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/app.db";

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace("file:", "");
  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
}

const client = createClient({ url: databaseUrl });
const systemEmail = "system@forecast.local";
const legacySeedSlugs = [
  "india-score-175-next-t20",
  "budget-ai-mentions-over-10",
  "hindi-release-opening-above-20-crore"
];

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
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

  await client.execute({
    sql: `
      INSERT OR IGNORE INTO users (id, email, display_name, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [randomUUID(), systemEmail, "System", "disabled", "admin", new Date().toISOString()]
  });

  const placeholders = legacySeedSlugs.map(() => "?").join(", ");
  await client.execute({
    sql: `DELETE FROM forecasts WHERE question_id IN (SELECT id FROM questions WHERE slug IN (${placeholders}))`,
    args: legacySeedSlugs
  });
  await client.execute({
    sql: `DELETE FROM questions WHERE slug IN (${placeholders})`,
    args: legacySeedSlugs
  });

  console.log("Database initialized and legacy placeholder data removed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
