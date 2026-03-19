import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import {
  authRateLimits,
  emailVerificationTokens,
  forecasts,
  forecastTicks,
  marketDisputes,
  marketEvents,
  passwordResetTokens,
  questions,
  sessions,
  users
} from "@/lib/schema";

const databaseUrl =
  process.env.TURSO_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "file:./data/app.db";
const databaseAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace("file:", "");
  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
}

const client = createClient(
  databaseAuthToken
    ? {
        url: databaseUrl,
        authToken: databaseAuthToken
      }
    : { url: databaseUrl }
);

export const db = drizzle(client, {
  schema: {
    users,
    sessions,
    questions,
    forecasts,
    forecastTicks,
    marketEvents,
    marketDisputes,
    emailVerificationTokens,
    passwordResetTokens,
    authRateLimits
  }
});

let initialized: Promise<void> | null = null;
const systemUserEmail = "system@forecast.local";

const legacySeedSlugs = [
  "india-score-175-next-t20",
  "budget-ai-mentions-over-10",
  "hindi-release-opening-above-20-crore"
] as const;

const publicStatuses = ["active", "locked", "resolved"] as const;
const startingCoins = 10000;

async function createTables() {
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

  try {
    await client.execute(`ALTER TABLE users ADD COLUMN email_verified_at TEXT`);
  } catch {
    // Column already exists on initialized databases.
  }

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
      side TEXT NOT NULL DEFAULT 'agree',
      probability REAL NOT NULL,
      stake_coins INTEGER NOT NULL DEFAULT 25,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(user_id, question_id)
    )
  `);

  try {
    await client.execute(
      `ALTER TABLE forecasts ADD COLUMN stake_coins INTEGER NOT NULL DEFAULT 25`
    );
  } catch {
    // Column already exists on initialized databases.
  }

  try {
    await client.execute(
      `ALTER TABLE forecasts ADD COLUMN side TEXT NOT NULL DEFAULT 'agree'`
    );
  } catch {
    // Column already exists on initialized databases.
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS forecast_ticks (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      side TEXT NOT NULL DEFAULT 'agree',
      probability REAL NOT NULL,
      stake_coins INTEGER NOT NULL DEFAULT 25,
      created_at TEXT NOT NULL,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  try {
    await client.execute(
      `ALTER TABLE forecast_ticks ADD COLUMN side TEXT NOT NULL DEFAULT 'agree'`
    );
  } catch {
    // Column already exists on initialized databases.
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS market_events (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      actor_user_id TEXT,
      type TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL
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
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(resolved_by) REFERENCES users(id) ON DELETE SET NULL
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

  await client.execute(
    `CREATE INDEX IF NOT EXISTS questions_status_close_idx ON questions(status, close_at)`
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS forecasts_question_updated_idx ON forecasts(question_id, updated_at)`
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS forecast_ticks_question_created_idx ON forecast_ticks(question_id, created_at)`
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS market_events_question_created_idx ON market_events(question_id, created_at)`
  );
  await client.execute(
    `CREATE INDEX IF NOT EXISTS market_disputes_question_status_created_idx ON market_disputes(question_id, status, created_at)`
  );
}

async function seedDatabase() {
  const timestamp = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT OR IGNORE INTO users
      (id, email, display_name, password_hash, role, email_verified_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [randomUUID(), systemUserEmail, "System", "disabled", "admin", timestamp, timestamp]
  });
}

async function cleanupLegacySeedQuestions() {
  const existingLegacyRows = await db
    .select({ id: questions.id })
    .from(questions)
    .where(inArray(questions.slug, [...legacySeedSlugs]));

  if (existingLegacyRows.length === 0) {
    return;
  }

  const legacyIds = existingLegacyRows.map((row) => row.id);
  await db.delete(forecasts).where(inArray(forecasts.questionId, legacyIds));
  await db.delete(questions).where(inArray(questions.id, legacyIds));
}

async function backfillMarketEvents() {
  const allQuestions = await db.query.questions.findMany();

  for (const question of allQuestions) {
    const existingEvents = await db.query.marketEvents.findFirst({
      where: eq(marketEvents.questionId, question.id)
    });

    if (existingEvents) {
      continue;
    }

    await db.insert(marketEvents).values({
      id: randomUUID(),
      questionId: question.id,
      actorUserId: question.createdBy,
      type: "backfill_created",
      note: `Market present before audit logging was enabled. Current status: ${question.status}.`,
      createdAt: question.createdAt
    });
  }
}

export async function ensureDatabase() {
  if (!initialized) {
    initialized = (async () => {
      await createTables();
      await seedDatabase();
      await cleanupLegacySeedQuestions();
      await backfillMarketEvents();
    })();
  }

  await initialized;
}

export async function getFeedQuestions() {
  await ensureDatabase();
  return db.query.questions.findMany({
    orderBy: [desc(questions.createdAt)]
  });
}

export async function getPublicQuestions() {
  await ensureDatabase();
  return db.query.questions.findMany({
    where: inArray(questions.status, [...publicStatuses]),
    orderBy: [asc(questions.closeAt), desc(questions.createdAt)]
  });
}

export async function getQuestionBySlug(slug: string) {
  await ensureDatabase();
  return db.query.questions.findFirst({
    where: eq(questions.slug, slug)
  });
}

export async function getQuestionForecast(questionId: string, userId: string) {
  await ensureDatabase();
  return db.query.forecasts.findFirst({
    where: and(eq(forecasts.questionId, questionId), eq(forecasts.userId, userId))
  });
}

export async function upsertForecast(input: {
  questionId: string;
  userId: string;
  side: "agree" | "disagree";
  probability: number;
  stakeCoins: number;
}) {
  await ensureDatabase();

  const existing = await db.query.forecasts.findFirst({
    where: and(
      eq(forecasts.questionId, input.questionId),
      eq(forecasts.userId, input.userId)
    )
  });

  const timestamp = new Date().toISOString();

  if (existing) {
    await db
      .update(forecasts)
      .set({
        side: input.side,
        probability: input.probability,
        stakeCoins: input.stakeCoins,
        updatedAt: timestamp
      })
      .where(eq(forecasts.id, existing.id));
  } else {
    await db.insert(forecasts).values({
      id: randomUUID(),
      questionId: input.questionId,
      userId: input.userId,
      side: input.side,
      probability: input.probability,
      stakeCoins: input.stakeCoins,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  await db.insert(forecastTicks).values({
    id: randomUUID(),
    questionId: input.questionId,
    side: input.side,
    probability: input.probability,
    stakeCoins: input.stakeCoins,
    createdAt: timestamp,
  });
}

export async function getForecastTicksByQuestionId(questionId: string, limit = 48) {
  await ensureDatabase();
  return db.query.forecastTicks.findMany({
    where: eq(forecastTicks.questionId, questionId),
    orderBy: [asc(forecastTicks.createdAt)],
    limit
  });
}

export async function createQuestion(input: {
  slug: string;
  title: string;
  description: string;
  category: string;
  closeAt: string;
  resolveBy: string;
  resolutionSource: string;
  status: "draft" | "active";
  createdBy: string;
}) {
  await ensureDatabase();
  const questionId = randomUUID();
  const createdAt = new Date().toISOString();
  await db.insert(questions).values({
    id: questionId,
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: input.category,
    status: input.status,
    closeAt: input.closeAt,
    resolveBy: input.resolveBy,
    resolutionSource: input.resolutionSource,
    outcome: null,
    createdBy: input.createdBy,
    createdAt
  });

  await createMarketEvent({
    questionId,
    actorUserId: input.createdBy,
    type: "created",
    note: `Market created as ${input.status}.`
  });
}

export async function resolveQuestion(input: {
  questionId: string;
  outcome: number;
  actorUserId?: string | null;
  note?: string;
}) {
  await ensureDatabase();
  await db
    .update(questions)
    .set({
      outcome: input.outcome,
      status: "resolved"
    })
    .where(eq(questions.id, input.questionId));

  await createMarketEvent({
    questionId: input.questionId,
    actorUserId: input.actorUserId ?? null,
    type: "resolved",
    note:
      input.note?.trim() ||
      `Market resolved ${input.outcome === 1 ? "YES" : "NO"}.`
  });
}

export async function updateQuestionStatus(input: {
  questionId: string;
  status: "draft" | "active" | "locked";
  actorUserId?: string | null;
  note?: string;
}) {
  await ensureDatabase();
  await db
    .update(questions)
    .set({
      status: input.status
    })
    .where(eq(questions.id, input.questionId));

  const actionLabel =
    input.status === "active" ? "published" : input.status === "locked" ? "locked" : "moved to draft";

  await createMarketEvent({
    questionId: input.questionId,
    actorUserId: input.actorUserId ?? null,
    type: input.status,
    note: input.note?.trim() || `Market ${actionLabel}.`
  });
}

export async function createMarketEvent(input: {
  questionId: string;
  actorUserId?: string | null;
  type: string;
  note: string;
}) {
  await ensureDatabase();
  await db.insert(marketEvents).values({
    id: randomUUID(),
    questionId: input.questionId,
    actorUserId: input.actorUserId ?? null,
    type: input.type,
    note: input.note,
    createdAt: new Date().toISOString()
  });
}

export async function getUserByEmail(email: string) {
  await ensureDatabase();
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase())
  });
}

export async function getUserById(id: string) {
  await ensureDatabase();
  return db.query.users.findFirst({
    where: eq(users.id, id)
  });
}

export async function createUser(input: {
  email: string;
  displayName: string;
  passwordHash: string;
  emailVerifiedAt?: string | null;
}) {
  await ensureDatabase();
  const normalizedEmail = input.email.toLowerCase();
  const [humanAdminCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "admin"), sql`${users.email} != ${systemUserEmail}`));
  const shouldBootstrapAdmin =
    process.env.BOOTSTRAP_ADMIN_ON_FIRST_SIGNUP === "1" &&
    Number(humanAdminCount?.count ?? 0) === 0;

  const role =
    normalizedEmail === (process.env.ADMIN_EMAIL ?? "").toLowerCase()
      ? "admin"
      : shouldBootstrapAdmin
      ? "admin"
      : "member";

  const [createdUser] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email: normalizedEmail,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      role,
      emailVerifiedAt: input.emailVerifiedAt ?? null,
      createdAt: new Date().toISOString()
    })
    .returning();

  return createdUser;
}

export async function deleteUserById(userId: string) {
  await ensureDatabase();
  await db.delete(users).where(eq(users.id, userId));
}

export async function markUserEmailVerified(userId: string) {
  await ensureDatabase();
  const timestamp = new Date().toISOString();
  await db
    .update(users)
    .set({
      emailVerifiedAt: timestamp
    })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(input: {
  userId: string;
  passwordHash: string;
}) {
  await ensureDatabase();
  await db
    .update(users)
    .set({
      passwordHash: input.passwordHash
    })
    .where(eq(users.id, input.userId));
}

export async function createSession(input: { userId: string; tokenHash: string; expiresAt: string }) {
  await ensureDatabase();
  const [session] = await db
    .insert(sessions)
    .values({
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString()
    })
    .returning();

  return session;
}

export async function getSessionByHash(tokenHash: string) {
  await ensureDatabase();
  return db.query.sessions.findFirst({
    where: eq(sessions.tokenHash, tokenHash)
  });
}

export async function deleteSessionByHash(tokenHash: string) {
  await ensureDatabase();
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteExpiredSessions() {
  await ensureDatabase();
  await db.delete(sessions).where(sql`${sessions.expiresAt} <= ${new Date().toISOString()}`);
}

export async function deleteSessionsByUserId(userId: string) {
  await ensureDatabase();
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function createEmailVerificationToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  await ensureDatabase();
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, input.userId));
  const [token] = await db
    .insert(emailVerificationTokens)
    .values({
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString()
    })
    .returning();

  return token;
}

export async function getEmailVerificationTokenByHash(tokenHash: string) {
  await ensureDatabase();
  return db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.tokenHash, tokenHash)
  });
}

export async function deleteEmailVerificationTokensByUserId(userId: string) {
  await ensureDatabase();
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
}

export async function deleteEmailVerificationTokenByHash(tokenHash: string) {
  await ensureDatabase();
  await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.tokenHash, tokenHash));
}

export async function deleteExpiredEmailVerificationTokens() {
  await ensureDatabase();
  await db
    .delete(emailVerificationTokens)
    .where(sql`${emailVerificationTokens.expiresAt} <= ${new Date().toISOString()}`);
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  await ensureDatabase();
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.userId));
  const [token] = await db
    .insert(passwordResetTokens)
    .values({
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date().toISOString()
    })
    .returning();

  return token;
}

export async function getPasswordResetTokenByHash(tokenHash: string) {
  await ensureDatabase();
  return db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.tokenHash, tokenHash)
  });
}

export async function deletePasswordResetTokensByUserId(userId: string) {
  await ensureDatabase();
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
}

export async function deletePasswordResetTokenByHash(tokenHash: string) {
  await ensureDatabase();
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash));
}

export async function deleteExpiredPasswordResetTokens() {
  await ensureDatabase();
  await db
    .delete(passwordResetTokens)
    .where(sql`${passwordResetTokens.expiresAt} <= ${new Date().toISOString()}`);
}

export async function getAuthRateLimitBucket(action: string, key: string) {
  await ensureDatabase();
  return db.query.authRateLimits.findFirst({
    where: and(eq(authRateLimits.action, action), eq(authRateLimits.key, key))
  });
}

export async function saveAuthRateLimitBucket(input: {
  action: string;
  key: string;
  count: number;
  windowStartedAt: string;
  blockedUntil: string | null;
}) {
  await ensureDatabase();
  const existing = await getAuthRateLimitBucket(input.action, input.key);
  const timestamp = new Date().toISOString();

  if (existing) {
    await db
      .update(authRateLimits)
      .set({
        count: input.count,
        windowStartedAt: input.windowStartedAt,
        blockedUntil: input.blockedUntil,
        updatedAt: timestamp
      })
      .where(eq(authRateLimits.id, existing.id));
    return;
  }

  await db.insert(authRateLimits).values({
    id: randomUUID(),
    action: input.action,
    key: input.key,
    count: input.count,
    windowStartedAt: input.windowStartedAt,
    blockedUntil: input.blockedUntil,
    updatedAt: timestamp
  });
}

export async function deleteStaleAuthRateLimits() {
  await ensureDatabase();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .delete(authRateLimits)
    .where(
      sql`${authRateLimits.updatedAt} <= ${cutoff} AND (${authRateLimits.blockedUntil} IS NULL OR ${authRateLimits.blockedUntil} <= ${new Date().toISOString()})`
    );
}

export async function getLeaderboardRows() {
  await ensureDatabase();
  const resolvedQuestions = await db.query.questions.findMany({
    where: eq(questions.status, "resolved")
  });

  if (resolvedQuestions.length === 0) {
    return [];
  }

  const resolvedIds = resolvedQuestions.map((question) => question.id);
  const rows = await db
    .select({
      forecast: forecasts,
      user: users,
      question: questions
    })
    .from(forecasts)
    .innerJoin(users, eq(forecasts.userId, users.id))
    .innerJoin(questions, eq(forecasts.questionId, questions.id))
    .where(inArray(forecasts.questionId, resolvedIds));

  return rows;
}

export async function getUserForecasts(userId: string) {
  await ensureDatabase();
  return db
    .select({
      forecast: forecasts,
      question: questions
    })
    .from(forecasts)
    .innerJoin(questions, eq(forecasts.questionId, questions.id))
    .where(eq(forecasts.userId, userId))
    .orderBy(desc(forecasts.updatedAt));
}

export async function getDashboardCounts() {
  await ensureDatabase();
  const [questionCount] = await db.select({ count: sql<number>`count(*)` }).from(questions);
  const [forecastCount] = await db.select({ count: sql<number>`count(*)` }).from(forecasts);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [openDisputeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(marketDisputes)
    .where(eq(marketDisputes.status, "open"));

  return {
    questionCount: Number(questionCount?.count ?? 0),
    forecastCount: Number(forecastCount?.count ?? 0),
    userCount: Number(userCount?.count ?? 0),
    openDisputeCount: Number(openDisputeCount?.count ?? 0)
  };
}

export async function getPublicDashboardCounts() {
  await ensureDatabase();
  const [questionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(inArray(questions.status, [...publicStatuses]));
  const [categoryCount] = await db
    .select({ count: sql<number>`count(distinct ${questions.category})` })
    .from(questions)
    .where(inArray(questions.status, [...publicStatuses]));

  return {
    publicQuestionCount: Number(questionCount?.count ?? 0),
    categoryCount: Number(categoryCount?.count ?? 0)
  };
}

export async function getForecastStatsByQuestionIds(questionIds: string[]) {
  await ensureDatabase();

  if (questionIds.length === 0) {
    return [];
  }

  return db
    .select({
      questionId: forecasts.questionId,
      forecasterCount: sql<number>`count(*)`,
      avgProbability:
        sql<number>`round((sum(${forecasts.probability} * ${forecasts.stakeCoins}) * 1.0) / nullif(sum(${forecasts.stakeCoins}), 0), 0)`,
      totalStake: sql<number>`sum(${forecasts.stakeCoins})`
    })
    .from(forecasts)
    .where(inArray(forecasts.questionId, questionIds))
    .groupBy(forecasts.questionId);
}

export async function getMarketEvents(questionId: string) {
  await ensureDatabase();
  return db
    .select({
      event: marketEvents,
      actor: users
    })
    .from(marketEvents)
    .leftJoin(users, eq(marketEvents.actorUserId, users.id))
    .where(eq(marketEvents.questionId, questionId))
    .orderBy(desc(marketEvents.createdAt));
}

export async function getMarketDisputes(questionId: string) {
  await ensureDatabase();
  return db
    .select({
      dispute: marketDisputes,
      creator: users
    })
    .from(marketDisputes)
    .innerJoin(users, eq(marketDisputes.createdBy, users.id))
    .where(eq(marketDisputes.questionId, questionId))
    .orderBy(desc(marketDisputes.createdAt));
}

export async function getOpenDisputes() {
  await ensureDatabase();
  return db
    .select({
      dispute: marketDisputes,
      question: questions,
      creator: users
    })
    .from(marketDisputes)
    .innerJoin(questions, eq(marketDisputes.questionId, questions.id))
    .innerJoin(users, eq(marketDisputes.createdBy, users.id))
    .where(eq(marketDisputes.status, "open"))
    .orderBy(desc(marketDisputes.createdAt));
}

export async function createMarketDispute(input: {
  questionId: string;
  createdBy: string;
  message: string;
}) {
  await ensureDatabase();
  const createdAt = new Date().toISOString();
  await db.insert(marketDisputes).values({
    id: randomUUID(),
    questionId: input.questionId,
    createdBy: input.createdBy,
    message: input.message,
    status: "open",
    resolutionNote: null,
    resolvedBy: null,
    resolvedAt: null,
    createdAt
  });

  await createMarketEvent({
    questionId: input.questionId,
    actorUserId: input.createdBy,
    type: "dispute_opened",
    note: "A user opened a market dispute."
  });
}

export async function resolveMarketDispute(input: {
  disputeId: string;
  questionId: string;
  resolvedBy: string;
  status: "resolved" | "dismissed";
  resolutionNote: string;
}) {
  await ensureDatabase();
  const resolvedAt = new Date().toISOString();
  await db
    .update(marketDisputes)
    .set({
      status: input.status,
      resolutionNote: input.resolutionNote,
      resolvedBy: input.resolvedBy,
      resolvedAt
    })
    .where(eq(marketDisputes.id, input.disputeId));

  await createMarketEvent({
    questionId: input.questionId,
    actorUserId: input.resolvedBy,
    type: `dispute_${input.status}`,
    note: input.resolutionNote
  });
}

function getEntryPrice(side: "agree" | "disagree", probability: number) {
  return side === "agree" ? probability : 100 - probability;
}

export async function getUserWalletSummary(userId: string) {
  await ensureDatabase();
  const rows = await getUserForecasts(userId);

  let reservedCoins = 0;
  let realizedPnl = 0;
  let winningPositions = 0;
  let losingPositions = 0;

  for (const { forecast, question } of rows) {
    const entryPrice = getEntryPrice(forecast.side as "agree" | "disagree", Math.round(forecast.probability));
    const payout = Math.round(forecast.stakeCoins * (100 / Math.max(1, Math.min(entryPrice, 99))));
    const isWinningSide =
      question.outcome !== null &&
      ((forecast.side === "agree" && question.outcome === 1) ||
        (forecast.side === "disagree" && question.outcome === 0));

    if (question.status === "resolved") {
      if (isWinningSide) {
        realizedPnl += payout - forecast.stakeCoins;
        winningPositions += 1;
      } else {
        realizedPnl -= forecast.stakeCoins;
        losingPositions += 1;
      }
      continue;
    }

    reservedCoins += forecast.stakeCoins;
  }

  const availableCoins = Math.max(0, startingCoins + realizedPnl - reservedCoins);
  const deployedCoins = reservedCoins;

  return {
    startingCoins,
    reservedCoins,
    deployedCoins,
    realizedPnl,
    availableCoins,
    settledPositions: winningPositions + losingPositions,
    winningPositions,
    losingPositions,
    winRate:
      winningPositions + losingPositions > 0
        ? Math.round((winningPositions / (winningPositions + losingPositions)) * 100)
        : 0
  };
}
