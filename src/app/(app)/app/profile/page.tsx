import Link from "next/link";
import { LiveRefresh } from "@/components/live-refresh";
import { requireUser } from "@/lib/auth";
import { buildUserProfileSummary } from "@/lib/data";
import { getUserForecasts } from "@/lib/db";
import { brierScore } from "@/lib/score";
import { formatCoins, formatDate } from "@/lib/utils";

function scoreColor(score: number): string {
  if (score >= 70) return "var(--success)";
  if (score >= 50) return "var(--signal)";
  return "var(--danger)";
}

export default async function ProfilePage() {
  const user = await requireUser();
  const [forecasts, summary] = await Promise.all([
    getUserForecasts(user.id),
    buildUserProfileSummary(user.id)
  ]);

  return (
    <div className="stack">
      <LiveRefresh />
      <section className="panel app-board-header">
        <div className="stack-xs">
          <span className="eyebrow">Profile</span>
          <h1>{user.displayName}</h1>
        </div>
        <div className="board-summary-row">
          <div className="summary-chip">
            <span className="summary-chip-label">Available</span>
            <strong>{formatCoins(summary.wallet.availableCoins)}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Deployed</span>
            <strong>{formatCoins(summary.wallet.deployedCoins)}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Active</span>
            <strong>{summary.activeForecasts}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Resolved</span>
            <strong>{summary.resolvedForecasts}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Win rate</span>
            <strong>{summary.wallet.winRate}%</strong>
          </div>
        </div>
      </section>

      <section className="panel stack">
        <div className="section-header">
          <h2>Breakdown by category</h2>
        </div>
        {summary.categoryBreakdown.length === 0 ? (
          <p className="small-copy">No category history yet.</p>
        ) : (
          summary.categoryBreakdown.map((entry) => {
            const resolvedPct = entry.total > 0 ? Math.round((entry.resolved / entry.total) * 100) : 0;
            return (
              <article className="profile-row" key={entry.name}>
                <div className="stack-xs">
                  <strong>{entry.name}</strong>
                  <span className="small-copy">
                    {entry.total} {entry.total === 1 ? "forecast" : "forecasts"} · {entry.resolved} resolved
                  </span>
                  <div className="category-bar-shell">
                    <div className="category-bar-fill" style={{ width: `${resolvedPct}%` }} />
                  </div>
                </div>
                <div className="profile-metric">
                  <span className="small-copy">Avg score</span>
                  <strong
                    style={
                      entry.averageScore
                        ? { color: scoreColor(entry.averageScore) }
                        : undefined
                    }
                  >
                    {entry.averageScore || "Pending"}
                  </strong>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="panel stack">
        <div className="section-header">
          <h2>Positions</h2>
          <span className="small-copy">{forecasts.length}</span>
        </div>
        {forecasts.length === 0 ? (
          <p className="small-copy">No positions yet.</p>
        ) : (
          forecasts.map(({ forecast, question }) => {
            const resolvedScore =
              question.status === "resolved"
                ? brierScore({ probability: forecast.probability, outcome: question.outcome ?? 0 })
                : null;
            const side = forecast.side === "agree" ? "YES" : "NO";
            return (
              <article className="profile-row" key={forecast.id}>
                <div className="stack-xs">
                  <Link href={`/markets/${question.slug}`}>
                    <strong>{question.title}</strong>
                  </Link>
                  <span className="small-copy">
                    {side} · {Math.round(forecast.probability)}% · {formatCoins(forecast.stakeCoins)} coins ·{" "}
                    {formatDate(forecast.updatedAt)}
                  </span>
                </div>
                <div className="profile-metric">
                  <span className="small-copy">Score</span>
                  <strong
                    style={resolvedScore !== null ? { color: scoreColor(resolvedScore) } : undefined}
                  >
                    {resolvedScore !== null ? resolvedScore : "Pending"}
                  </strong>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
