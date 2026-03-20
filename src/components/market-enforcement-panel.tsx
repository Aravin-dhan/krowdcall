import type { AppMarketDispute, AppMarketEvent, AppUser } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

type MarketEnforcementPanelProps = {
  events: Array<{
    event: AppMarketEvent;
    actor: AppUser | null;
  }>;
  disputes: Array<{
    dispute: AppMarketDispute;
    creator: AppUser;
  }>;
};

export function MarketEnforcementPanel({
  events,
  disputes
}: MarketEnforcementPanelProps) {
  return (
    <section className="panel stack">
      <div className="section-header">
        <h2>Audit trail</h2>
        <span className="small-copy">{events.length} events</span>
      </div>

      <div className="audit-list">
        {events.length === 0 ? (
          <div className="chart-empty">No market events logged yet.</div>
        ) : (
          events.map(({ event, actor }) => (
            <article className="audit-row" key={event.id}>
              <div className="stack-xs">
                <strong>{event.note}</strong>
                <span className="small-copy" suppressHydrationWarning>
                  {actor?.displayName ?? "System"} · {event.type} · {formatDate(event.createdAt)}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="section-header">
        <h2>Disputes</h2>
        <span className="small-copy">{disputes.length}</span>
      </div>

      <div className="audit-list">
        {disputes.length === 0 ? (
          <div className="chart-empty">No disputes on this market.</div>
        ) : (
          disputes.map(({ dispute, creator }) => (
            <article className="audit-row" key={dispute.id}>
              <div className="stack-xs">
                <div className="question-meta">
                  <span className={`pill pill-${dispute.status === "open" ? "locked" : "resolved"}`}>
                    {dispute.status}
                  </span>
                </div>
                <strong>{dispute.message}</strong>
                <span className="small-copy" suppressHydrationWarning>
                  {creator.displayName} · {formatDate(dispute.createdAt)}
                </span>
                {dispute.resolutionNote ? (
                  <span className="small-copy">Resolution: {dispute.resolutionNote}</span>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
