import {
  getForecastTicksByQuestionId,
  getForecastStatsByQuestionIds,
  getLeaderboardRows,
  getMarketDisputes,
  getMarketEvents,
  getPublicQuestions,
  getQuestionBySlug,
  getUserForecasts,
  getUserWalletSummary
} from "@/lib/db";
import { brierScore } from "@/lib/score";

export type PublicMarketSnapshot = Awaited<ReturnType<typeof buildPublicMarketSnapshots>>[number];

export async function buildLeaderboard() {
  const rows = await getLeaderboardRows();
  const byUser = new Map<
    string,
    {
      id: string;
      displayName: string;
      email: string;
      scores: number[];
    }
  >();

  for (const row of rows) {
    const bucket = byUser.get(row.user.id) ?? {
      id: row.user.id,
      displayName: row.user.displayName,
      email: row.user.email,
      scores: []
    };

    bucket.scores.push(
      brierScore({
        probability: row.forecast.probability,
        outcome: row.question.outcome ?? 0
      })
    );

    byUser.set(row.user.id, bucket);
  }

  return Array.from(byUser.values())
    .map((entry) => ({
      ...entry,
      average: entry.scores.length
        ? Math.round(
            (entry.scores.reduce((total, score) => total + score, 0) /
              entry.scores.length) *
              10
          ) / 10
        : 0
    }))
    .sort((left, right) => right.average - left.average);
}

export async function buildUserProfileSummary(userId: string) {
  const [rows, wallet] = await Promise.all([getUserForecasts(userId), getUserWalletSummary(userId)]);
  const resolvedRows = rows.filter(({ question }) => question.status === "resolved");
  const activeRows = rows.filter(({ question }) => question.status === "active");
  const scores = resolvedRows.map(({ forecast, question }) =>
    brierScore({
      probability: forecast.probability,
      outcome: question.outcome ?? 0
    })
  );

  const categories = new Map<
    string,
    {
      name: string;
      total: number;
      resolved: number;
      scoreTotal: number;
    }
  >();

  for (const row of rows) {
    const bucket = categories.get(row.question.category) ?? {
      name: row.question.category,
      total: 0,
      resolved: 0,
      scoreTotal: 0
    };

    bucket.total += 1;

    if (row.question.status === "resolved") {
      bucket.resolved += 1;
      bucket.scoreTotal += brierScore({
        probability: row.forecast.probability,
        outcome: row.question.outcome ?? 0
      });
    }

    categories.set(row.question.category, bucket);
  }

  return {
    wallet,
    totalForecasts: rows.length,
    activeForecasts: activeRows.length,
    resolvedForecasts: resolvedRows.length,
    averageScore: scores.length
      ? Math.round((scores.reduce((total, score) => total + score, 0) / scores.length) * 10) /
        10
      : 0,
    categoryBreakdown: Array.from(categories.values()).map((entry) => ({
      ...entry,
      averageScore:
        entry.resolved > 0
          ? Math.round((entry.scoreTotal / entry.resolved) * 10) / 10
          : 0
    }))
  };
}

export async function buildPublicMarketSnapshots() {
  const questions = await getPublicQuestions();
  const stats = await getForecastStatsByQuestionIds(questions.map((question) => question.id));
  const tickEntries = await Promise.all(
    questions.map(async (question) => {
      const ticks = await getForecastTicksByQuestionId(question.id, 8);

      return [
        question.id,
        {
          tickProbabilities: ticks.map((tick) => Math.round(tick.probability)),
          lastTickAt: ticks.at(-1)?.createdAt ?? null
        }
      ] as const;
    })
  );
  const statsByQuestion = new Map(
    stats.map((row) => [
      row.questionId,
      {
        forecasterCount: Number(row.forecasterCount ?? 0),
        avgProbability: row.avgProbability ? Math.round(Number(row.avgProbability)) : null,
        totalStake: Number(row.totalStake ?? 0)
      }
    ])
  );
  const ticksByQuestion = new Map(tickEntries);

  return questions.map((question) => {
    const stat = statsByQuestion.get(question.id);
    const tickMeta = ticksByQuestion.get(question.id);
    return {
      ...question,
      forecasterCount: stat?.forecasterCount ?? 0,
      avgProbability: stat?.avgProbability ?? null,
      totalStake: stat?.totalStake ?? 0,
      tickProbabilities: tickMeta?.tickProbabilities ?? [],
      lastTickAt: tickMeta?.lastTickAt ?? null
    };
  });
}

export function splitBoardMarkets(markets: PublicMarketSnapshot[]) {
  const activeMarkets = markets.filter((market) => market.status === "active");
  const lockingMarkets = [...activeMarkets]
    .sort((left, right) => new Date(left.closeAt).getTime() - new Date(right.closeAt).getTime())
    .slice(0, 6);
  const resolvedMarkets = markets
    .filter((market) => market.status === "resolved")
    .sort((left, right) => new Date(right.closeAt).getTime() - new Date(left.closeAt).getTime())
    .slice(0, 6);

  return {
    activeMarkets,
    lockingMarkets,
    resolvedMarkets
  };
}

export async function buildPublicMarketActivity(slug: string) {
  const question = await getQuestionBySlug(slug);

  if (!question || question.status === "draft") {
    return null;
  }

  const [questionStats, ticks, events, disputes] = await Promise.all([
    getForecastStatsByQuestionIds([question.id]),
    getForecastTicksByQuestionId(question.id),
    getMarketEvents(question.id),
    getMarketDisputes(question.id)
  ]);

  return {
    question,
    marketStats: questionStats[0] ?? {
      questionId: question.id,
      forecasterCount: 0,
      avgProbability: null,
      totalStake: 0
    },
    ticks,
    events,
    disputes
  };
}
