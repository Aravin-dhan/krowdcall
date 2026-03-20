import type { AppForecastTick } from "@/lib/schema";
import { formatShortDate, formatShortTime } from "@/lib/utils";

type MarketHistoryProps = {
  ticks: AppForecastTick[];
};

function buildPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function MarketHistory({ ticks }: MarketHistoryProps) {
  if (ticks.length === 0) {
    return (
      <section className="panel stack">
        <div className="section-header">
          <h2>Price history</h2>
          <span className="small-copy">No movement yet</span>
        </div>
        <div className="chart-empty">No forecasts yet. Be the first to set a price.</div>
      </section>
    );
  }

  const points = ticks.map((tick, index) => {
    const x = ticks.length === 1 ? 50 : (index / (ticks.length - 1)) * 100;
    const y = 100 - tick.probability;
    return { x, y };
  });

  // For a single tick, extend the line across the full width
  const linePoints = ticks.length === 1
    ? [{ x: 0, y: points[0].y }, { x: 100, y: points[0].y }]
    : points;
  const areaPoints = ticks.length === 1
    ? [{ x: 0, y: points[0].y }, { x: 100, y: points[0].y }]
    : points;

  const recentMoves = [...ticks].reverse().slice(0, 8);

  return (
    <section className="panel stack">
      <div className="section-header">
        <h2>Price history</h2>
        <span className="small-copy">{ticks.length} {ticks.length === 1 ? "trade" : "trades"}</span>
      </div>

      <div className="chart-shell">
        <div className="chart-axis">
          <span>80%</span>
          <span>50%</span>
          <span>20%</span>
        </div>
        <svg
          aria-label="Price history"
          className="history-chart"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path className="history-grid-line" d="M 0 20 L 100 20" />
          <path className="history-grid-line" d="M 0 50 L 100 50" />
          <path className="history-grid-line" d="M 0 80 L 100 80" />
          <path className="history-area" d={`${buildPath(areaPoints)} L 100 100 L 0 100 Z`} />
          <path className="history-line" d={buildPath(linePoints)} />
        </svg>
      </div>
      {ticks.length > 1 && (
        <div className="chart-time-axis">
          <span suppressHydrationWarning>{formatShortDate(ticks[0].createdAt)}</span>
          <span suppressHydrationWarning>{formatShortDate(ticks[ticks.length - 1].createdAt)}</span>
        </div>
      )}

      <div className="tape-table">
        <div className="tape-row tape-row-head">
          <span>Time</span>
          <span>Side</span>
          <span>YES</span>
          <span>Size</span>
        </div>
        {recentMoves.map((tick) => (
          <div className="tape-row" key={tick.id}>
            <span suppressHydrationWarning>{formatShortTime(tick.createdAt)}</span>
            <span>{tick.side === "agree" ? "YES" : "NO"}</span>
            <strong>{Math.round(tick.probability)}%</strong>
            <span>{tick.stakeCoins} coins</span>
          </div>
        ))}
      </div>
    </section>
  );
}
