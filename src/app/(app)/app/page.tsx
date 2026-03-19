import Link from "next/link";
import { LiveBoardPanels } from "@/components/live-board-panels";
import { getCurrentUser } from "@/lib/auth";
import { buildPublicMarketSnapshots, buildUserProfileSummary } from "@/lib/data";
import { getUserForecasts } from "@/lib/db";
import { formatCoins } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, markets] = await Promise.all([getCurrentUser(), buildPublicMarketSnapshots()]);
  const [summary, forecasts] = user
    ? await Promise.all([buildUserProfileSummary(user.id), getUserForecasts(user.id)])
    : [null, []];

  return (
    <div className="stack">
      <section className="panel app-board-header">
        <div className="stack-xs">
          <span className="eyebrow">Desk</span>
          <h1>{user?.displayName ?? "Board"}</h1>
        </div>
        {summary ? (
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
              <span className="summary-chip-label">Win rate</span>
              <strong>{summary.wallet.winRate}%</strong>
            </div>
            <div className="summary-chip">
              <span className="summary-chip-label">Resolved</span>
              <strong>{summary.resolvedForecasts}</strong>
            </div>
          </div>
        ) : (
          <span className="small-copy">Board updates every 5 seconds.</span>
        )}
      </section>

      {summary ? (
        <section className="panel stack">
          <div className="section-header">
            <h2>Your board</h2>
            <Link className="small-copy" href="/app/profile">
              {forecasts.length} {forecasts.length === 1 ? "position" : "positions"} →
            </Link>
          </div>
          {forecasts.length === 0 ? (
            <div className="chart-empty">No positions yet. Find a market below and place your first forecast.</div>
          ) : (
            forecasts.slice(0, 6).map(({ forecast, question }) => (
              <Link className="profile-row compact-profile-row profile-row-link" href={`/markets/${question.slug}`} key={forecast.id}>
                <div className="stack-xs">
                  <strong>{question.title}</strong>
                  <span className="small-copy">
                    {forecast.side === "agree" ? "YES" : "NO"} ·{" "}
                    {Math.round(forecast.probability)}% · {formatCoins(forecast.stakeCoins)} coins
                  </span>
                </div>
                <div className="profile-metric">
                  <span className="small-copy">Status</span>
                  <strong>{question.status}</strong>
                </div>
              </Link>
            ))
          )}
        </section>
      ) : null}

      <LiveBoardPanels initialMarkets={markets} userSignedIn={Boolean(user)} />
    </div>
  );
}
