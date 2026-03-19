/**
 * Seed realistic-looking users with forecasts for social proof.
 * Run: npx tsx scripts/seed-users.ts
 *
 * These users have disabled passwords (cannot login) — they exist
 * purely so the platform looks alive on first visit.
 */

import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/app.db";
const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient(
  databaseAuthToken
    ? { url: databaseUrl, authToken: databaseAuthToken }
    : { url: databaseUrl }
);

// Realistic Indian names — mix of regions, genders
const seedUsers = [
  { name: "Arjun Mehta", email: "arjun.m@seed.local" },
  { name: "Priya Sharma", email: "priya.s@seed.local" },
  { name: "Rahul Iyer", email: "rahul.i@seed.local" },
  { name: "Sneha Reddy", email: "sneha.r@seed.local" },
  { name: "Aditya Nair", email: "aditya.n@seed.local" },
  { name: "Ananya Das", email: "ananya.d@seed.local" },
  { name: "Karthik Rao", email: "karthik.r@seed.local" },
  { name: "Diya Patel", email: "diya.p@seed.local" },
  { name: "Vikram Singh", email: "vikram.s@seed.local" },
  { name: "Meera Joshi", email: "meera.j@seed.local" },
  { name: "Rohan Gupta", email: "rohan.g@seed.local" },
  { name: "Ishita Banerjee", email: "ishita.b@seed.local" },
  { name: "Nikhil Menon", email: "nikhil.m@seed.local" },
  { name: "Kavya Krishnan", email: "kavya.k@seed.local" },
  { name: "Siddharth Chopra", email: "sid.c@seed.local" },
  { name: "Riya Mukherjee", email: "riya.m@seed.local" },
  { name: "Aman Verma", email: "aman.v@seed.local" },
  { name: "Tanvi Kulkarni", email: "tanvi.k@seed.local" },
  { name: "Harsh Pandey", email: "harsh.p@seed.local" },
  { name: "Nandini Bhat", email: "nandini.b@seed.local" },
  { name: "Dev Saxena", email: "dev.s@seed.local" },
  { name: "Shreya Agarwal", email: "shreya.a@seed.local" },
  { name: "Pranav Deshmukh", email: "pranav.d@seed.local" },
  { name: "Aisha Khan", email: "aisha.k@seed.local" },
  { name: "Varun Thakur", email: "varun.t@seed.local" },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomProbability() {
  // Cluster around 25-45 and 55-80 (realistic — people rarely pick 50)
  const r = Math.random();
  if (r < 0.4) return randomBetween(25, 45);
  if (r < 0.8) return randomBetween(55, 80);
  if (r < 0.9) return randomBetween(80, 95);
  return randomBetween(10, 24);
}

function randomStake() {
  const stakes = [25, 50, 75, 100, 150, 200, 250, 300, 500];
  return stakes[Math.floor(Math.random() * stakes.length)];
}

function randomSide() {
  return Math.random() < 0.6 ? "agree" : "disagree";
}

function randomDateBetween(start: Date, end: Date) {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t).toISOString();
}

async function main() {
  // Get all active questions
  const questionsResult = await client.execute(
    `SELECT id, slug FROM questions WHERE status = 'active'`
  );
  const questions = questionsResult.rows;

  if (questions.length === 0) {
    console.log("No active questions found. Run the main seed first.");
    process.exit(1);
  }

  console.log(`Found ${questions.length} active questions.`);

  // Create seed users
  const userIds: string[] = [];
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  for (const u of seedUsers) {
    const id = randomUUID();
    const createdAt = randomDateBetween(twoWeeksAgo, now);

    await client.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, display_name, password_hash, role, email_verified_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, u.email, u.name, "DISABLED_SEED_ACCOUNT", "member", createdAt, createdAt]
    });
    userIds.push(id);
  }

  console.log(`Created ${seedUsers.length} seed users.`);

  // Each user forecasts on 40-80% of questions
  let forecastCount = 0;
  let tickCount = 0;

  for (const userId of userIds) {
    const numForecasts = randomBetween(
      Math.ceil(questions.length * 0.4),
      Math.ceil(questions.length * 0.8)
    );
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, numForecasts);

    for (const q of picked) {
      const prob = randomProbability();
      const stake = randomStake();
      const side = randomSide();
      const createdAt = randomDateBetween(twoWeeksAgo, now);
      const forecastId = randomUUID();

      await client.execute({
        sql: `INSERT OR IGNORE INTO forecasts (id, user_id, question_id, side, probability, stake_coins, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [forecastId, userId, q.id, side, prob, stake, createdAt, createdAt]
      });
      forecastCount++;

      // Also insert a tick for the sparkline chart
      const tickId = randomUUID();
      await client.execute({
        sql: `INSERT INTO forecast_ticks (id, question_id, side, probability, stake_coins, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [tickId, q.id, side, prob, stake, createdAt]
      });
      tickCount++;
    }
  }

  // Add a few extra ticks (simulating users who updated their forecast)
  for (let i = 0; i < 40; i++) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    const tickId = randomUUID();
    const prob = randomProbability();
    const stake = randomStake();
    const side = randomSide();
    const createdAt = randomDateBetween(twoWeeksAgo, now);

    await client.execute({
      sql: `INSERT INTO forecast_ticks (id, question_id, side, probability, stake_coins, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [tickId, q.id, side, prob, stake, createdAt]
    });
    tickCount++;
  }

  // Add market events for activity
  for (const q of questions) {
    const numEvents = randomBetween(3, 8);
    for (let i = 0; i < numEvents; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const eventId = randomUUID();
      const createdAt = randomDateBetween(twoWeeksAgo, now);

      await client.execute({
        sql: `INSERT INTO market_events (id, question_id, actor_user_id, type, note, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [eventId, q.id, userId, "forecast", "Placed a forecast", createdAt]
      });
    }
  }

  console.log(`Created ${forecastCount} forecasts and ${tickCount} price ticks.`);
  console.log("Seed users and activity seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
