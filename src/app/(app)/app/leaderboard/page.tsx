import { LiveRefresh } from "@/components/live-refresh";
import { buildLeaderboard } from "@/lib/data";

export default async function LeaderboardPage() {
  const leaderboard = await buildLeaderboard();

  return (
    <div className="stack">
      <LiveRefresh />
      <section className="panel app-board-header">
        <div className="stack-xs">
          <span className="eyebrow">Leaderboard</span>
          <h1>Calibration</h1>
        </div>
        <div className="board-summary-row">
          <div className="summary-chip">
            <span className="summary-chip-label">Ranked</span>
            <strong>{leaderboard.length}</strong>
          </div>
        </div>
      </section>

      <section className="panel stack">
        <div className="table-header">
          <span>Rank</span>
          <span>Forecaster</span>
          <span>Calls</span>
          <span>Score</span>
        </div>
        <p className="small-copy muted">
          Score is 0–100. Higher is better. Based on Brier accuracy across all resolved markets.
        </p>
        {leaderboard.length === 0 ? (
          <p className="small-copy">No resolved forecasts yet.</p>
        ) : (
          leaderboard.map((row, index) => (
            <div className="table-row" key={row.id}>
              <span>#{index + 1}</span>
              <strong>{row.displayName}</strong>
              <span>{row.scores.length}</span>
              <div className="score-cell">
                <span>{row.average}</span>
                <div className="score-bar-shell">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${row.average}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
