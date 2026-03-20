import Link from "next/link";
import { QuickTradeTrigger } from "@/components/quick-trade-trigger";
import { formatShortDate, formatShortTime, formatSignedDelta, getNoPrice, getPayoutMultiplier, getYesPrice } from "@/lib/utils";

type MarketSnapshot = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  closeAt: string;
  forecasterCount: number;
  avgProbability: number | null;
  outcome: number | null;
  totalStake: number;
  tickProbabilities: number[];
  lastTickAt: string | null;
};

type MarketBoardProps = {
  title: string;
  markets: MarketSnapshot[];
  emptyTitle: string;
  emptyCopy: string;
  compact?: boolean;
  userSignedIn?: boolean;
  movements?: Record<string, { delta: number; volumeDelta: number }>;
  flashMap?: Record<string, "up" | "down">;
};

type LinkedCellProps = {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

function LinkedCell({ href, label, children, className }: LinkedCellProps) {
  return (
    <Link className={`market-board-cell market-board-cell-link ${className ?? ""}`.trim()} href={href}>
      <span className="market-board-cell-label">{label}</span>
      {children}
    </Link>
  );
}

function getCategoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("cricket")) return "🏏";
  if (c.includes("general election") || c.includes("lok sabha")) return "🏛️";
  if (c.includes("west bengal")) return "🐯"; // Bengal Tiger — state animal, politically neutral
  if (c.includes("kerala")) return "🌴";
  if (c.includes("tamil") || c.includes("tn")) return "🏺";
  if (c.includes("assam")) return "🦏";
  if (c.includes("puducherry") || c.includes("pondicherry")) return "🌊";
  if (c.includes("world") || c.includes("global") || c.includes("us ") || c.includes("usa")) return "🌍";
  if (c.includes("economy") || c.includes("market") || c.includes("finance")) return "📈";
  if (c.includes("tech") || c.includes("ai")) return "💡";
  if (c.includes("election") || c.includes("vote") || c.includes("poll")) return "🗳️";
  return "🔮";
}

function formatLockLabel(market: MarketSnapshot) {
  if (market.status === "resolved") {
    return "Resolved";
  }

  const minutesLeft = Math.round((new Date(market.closeAt).getTime() - Date.now()) / 60000);

  if (minutesLeft <= 60) {
    return minutesLeft <= 0 ? "Locking" : `${minutesLeft}m`;
  }

  const hoursLeft = Math.round(minutesLeft / 60);

  if (hoursLeft <= 24) {
    return `${hoursLeft}h`;
  }

  return `${Math.round(hoursLeft / 24)}d`;
}

function buildSparklinePath(points: number[]) {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 100 - point;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function MarketBoard({
  title,
  markets,
  emptyTitle,
  emptyCopy,
  compact = true,
  userSignedIn = false,
  movements = {},
  flashMap = {}
}: MarketBoardProps) {
  return (
    <section className={`panel stack ${compact ? "board-compact" : "board-comfortable"}`}>
      <div className="section-header board-header">
        <h2>{title}</h2>
        <span className="small-copy board-count">{markets.length}</span>
      </div>

      {markets.length === 0 ? (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyCopy}</p>
        </div>
      ) : (
        <div className="market-board">
          <div className="market-board-head">
            <span>Market</span>
            <span>YES</span>
            <span>NO</span>
            <span>Volume</span>
            <span>Lock</span>
            <span>Act</span>
          </div>

          {markets.map((market) => {
            const movement = movements[market.id];
            const yesPrice =
              market.status === "resolved"
                ? market.outcome === 1
                  ? 100
                  : 0
                : getYesPrice(market.avgProbability);
            const noPrice =
              market.status === "resolved"
                ? market.outcome === 0
                  ? 100
                  : 0
                : getNoPrice(market.avgProbability);

            return (
              <article
                className={`market-board-row${flashMap[market.id] === "up" ? " market-board-row-flash-up" : flashMap[market.id] === "down" ? " market-board-row-flash-down" : ""}`}
                key={market.id}
              >
                <Link className="market-board-main market-board-link" href={`/markets/${market.slug}`}>
                  <span className="market-cat-thumb" aria-hidden="true">{getCategoryIcon(market.category)}</span>
                  <div className="market-main-text">
                    <div className="question-meta">
                      <span className="pill">{market.category}</span>
                      <span className={`pill pill-${market.status}`}>{market.status}</span>
                      {movement && movement.delta !== 0 ? (
                        <span
                          className={`move-tag ${movement.delta > 0 ? "move-tag-up" : "move-tag-down"}`}
                        >
                          {formatSignedDelta(movement.delta)}c
                        </span>
                      ) : null}
                    </div>
                    <strong>{market.title}</strong>
                    <div className="market-row-subcopy">
                      {market.lastTickAt ? (
                        <span className="small-copy" suppressHydrationWarning>
                          Last trade {formatShortTime(market.lastTickAt)}
                        </span>
                      ) : (
                        <span className="small-copy">No trades yet</span>
                      )}
                      <div className="row-sparkline-shell" aria-hidden="true">
                        {market.tickProbabilities.length > 0 ? (
                          <svg className="row-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d={buildSparklinePath(market.tickProbabilities)} />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>

                <LinkedCell className="price-cell" href={`/markets/${market.slug}`} label="YES">
                  <strong>{yesPrice}%</strong>
                  <span className="small-copy">{yesPrice > 0 ? `${getPayoutMultiplier(yesPrice)}x` : "--"}</span>
                </LinkedCell>

                <LinkedCell className="price-cell" href={`/markets/${market.slug}`} label="NO">
                  <strong>{noPrice}%</strong>
                  <span className="small-copy">{noPrice > 0 ? `${getPayoutMultiplier(noPrice)}x` : "--"}</span>
                </LinkedCell>

                <LinkedCell href={`/markets/${market.slug}`} label="Volume">
                  <strong>{market.totalStake}</strong>
                  <span className="small-copy">
                    {market.forecasterCount} {market.forecasterCount === 1 ? "trader" : "traders"}
                    {movement && movement.volumeDelta !== 0
                      ? ` · ${movement.volumeDelta > 0 ? "+" : ""}${movement.volumeDelta}`
                      : ""}
                  </span>
                </LinkedCell>

                <LinkedCell href={`/markets/${market.slug}`} label="Lock">
                  <strong>{formatLockLabel(market)}</strong>
                  <span className="small-copy" suppressHydrationWarning>
                    {formatShortDate(market.closeAt)}
                  </span>
                </LinkedCell>

                {market.status !== "resolved" ? (
                  <div className="market-board-action">
                    <QuickTradeTrigger
                      market={{ slug: market.slug, title: market.title }}
                      probability={Math.max(55, yesPrice)}
                      side="agree"
                      signedIn={userSignedIn}
                    />
                    <QuickTradeTrigger
                      market={{ slug: market.slug, title: market.title }}
                      probability={Math.min(45, yesPrice)}
                      side="disagree"
                      signedIn={userSignedIn}
                    />
                  </div>
                ) : (
                  <div className="market-board-action">
                    <Link className="button button-secondary" href={`/markets/${market.slug}`} style={{gridColumn: "1 / -1", textAlign: "center"}}>
                      View result
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
