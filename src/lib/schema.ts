import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  emailVerifiedAt: text("email_verified_at"),
  createdAt: text("created_at").notNull()
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  closeAt: text("close_at").notNull(),
  resolveBy: text("resolve_by").notNull(),
  resolutionSource: text("resolution_source").notNull(),
  outcome: integer("outcome"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull()
});

export const forecasts = sqliteTable("forecasts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  side: text("side").notNull().default("agree"),
  probability: real("probability").notNull(),
  stakeCoins: integer("stake_coins").notNull().default(25),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const forecastTicks = sqliteTable("forecast_ticks", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  side: text("side").notNull().default("agree"),
  probability: real("probability").notNull(),
  stakeCoins: integer("stake_coins").notNull().default(25),
  createdAt: text("created_at").notNull()
});

export const marketEvents = sqliteTable("market_events", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull()
});

export const marketDisputes = sqliteTable("market_disputes", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  resolutionNote: text("resolution_note"),
  resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: text("resolved_at"),
  createdAt: text("created_at").notNull()
});

export const emailVerificationTokens = sqliteTable("email_verification_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const authRateLimits = sqliteTable(
  "auth_rate_limits",
  {
    id: text("id").primaryKey(),
    action: text("action").notNull(),
    key: text("key").notNull(),
    count: integer("count").notNull().default(0),
    windowStartedAt: text("window_started_at").notNull(),
    blockedUntil: text("blocked_until"),
    updatedAt: text("updated_at").notNull()
  },
  (table) => ({
    actionKeyIndex: uniqueIndex("auth_rate_limits_action_key_idx").on(table.action, table.key)
  })
);

export type AppUser = typeof users.$inferSelect;
export type AppQuestion = typeof questions.$inferSelect;
export type AppForecast = typeof forecasts.$inferSelect;
export type AppForecastTick = typeof forecastTicks.$inferSelect;
export type AppMarketEvent = typeof marketEvents.$inferSelect;
export type AppMarketDispute = typeof marketDisputes.$inferSelect;
