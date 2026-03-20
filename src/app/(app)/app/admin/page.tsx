import {
  importElectionPackAction,
  importIPLPackAction,
  resolveMarketDisputeAction,
  setQuestionStatusAction
} from "@/app/actions";
import { AdminResolveForm } from "@/components/admin-resolve-form";
import { CreateQuestionForm } from "@/components/create-question-form";
import { LiveRefresh } from "@/components/live-refresh";
import { requireAdmin } from "@/lib/auth";
import { getDashboardCounts, getFeedQuestions, getOpenDisputes } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const statusOrder: Record<string, number> = { locked: 0, active: 1, draft: 2, resolved: 3 };

export default async function AdminPage() {
  await requireAdmin();
  const [counts, questions, disputes] = await Promise.all([
    getDashboardCounts(),
    getFeedQuestions(),
    getOpenDisputes()
  ]);

  const sortedQuestions = [...questions].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  );
  const draftCount = questions.filter((question) => question.status === "draft").length;
  const activeCount = questions.filter((question) => question.status === "active").length;
  const lockedCount = questions.filter((question) => question.status === "locked").length;

  return (
    <div className="stack">
      <LiveRefresh />
      <section className="panel app-board-header">
        <div className="stack-xs">
          <span className="eyebrow">Admin</span>
          <h1>Market ops</h1>
        </div>
        <div className="board-summary-row">
          <div className="summary-chip">
            <span className="summary-chip-label">Users</span>
            <strong>{counts.userCount}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Forecasts</span>
            <strong>{counts.forecastCount}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Drafts</span>
            <strong>{draftCount}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Locked</span>
            <strong>{lockedCount}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Disputes</span>
            <strong>{counts.openDisputeCount}</strong>
          </div>
        </div>
      </section>

      <div className="board-grid">
        <CreateQuestionForm />

        <section className="panel stack">
          <div className="section-header">
            <h2>Market packs</h2>
            <span className="small-copy">Local bootstrap</span>
          </div>
          <div style={{display:"flex", gap:"0.5rem", flexWrap:"wrap"}}>
            <form action={importElectionPackAction}>
              <button className="button button-secondary" type="submit">
                Import 2026 elections
              </button>
            </form>
            <form action={importIPLPackAction}>
              <button className="button button-secondary" type="submit">
                Import IPL 2026 🏏
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="panel stack">
        <div className="table-header">
          <span>Market</span>
          <span>Status</span>
          <span>Close</span>
          <span>Action</span>
        </div>
        {sortedQuestions.map((question) => (
          <article className="admin-row admin-row-table" key={question.id}>
            <div className="stack-xs">
              <strong>{question.title}</strong>
              <span className="small-copy">{question.category}</span>
            </div>
            <span className={`pill pill-${question.status}`}>{question.status}</span>
            <span className="small-copy">{formatDate(question.closeAt)}</span>
            {question.status === "resolved" ? (
              <span className="pill pill-resolved">
                {question.outcome === 1 ? "YES" : "NO"}
              </span>
            ) : question.status === "draft" ? (
              <form action={setQuestionStatusAction} className="resolve-form">
                <input name="questionId" type="hidden" value={question.id} />
                <input name="note" placeholder="Publish note" />
                <button className="button button-secondary" name="status" value="active">
                  Publish
                </button>
              </form>
            ) : question.status === "active" ? (
              <form action={setQuestionStatusAction} className="resolve-form">
                <input name="questionId" type="hidden" value={question.id} />
                <input name="note" placeholder="Lock note" />
                <button className="button button-secondary" name="status" value="locked">
                  Lock
                </button>
              </form>
            ) : (
              <AdminResolveForm questionId={question.id} />
            )}
          </article>
        ))}
      </section>

      <section className="panel stack">
        <div className="section-header">
          <h2>Open disputes</h2>
          <span className="small-copy">{disputes.length}</span>
        </div>
        {disputes.length === 0 ? (
          <div className="chart-empty">No open disputes.</div>
        ) : (
          disputes.map(({ dispute, question, creator }) => (
            <article className="admin-row admin-row-table admin-dispute-row" key={dispute.id}>
              <div className="stack-xs">
                <strong>{question.title}</strong>
                <span className="small-copy">
                  {creator.displayName} · {formatDate(dispute.createdAt)}
                </span>
                <span className="small-copy">{dispute.message}</span>
              </div>
              <span className={`pill pill-${question.status}`}>{question.status}</span>
              <span className="small-copy">{question.category}</span>
              <form action={resolveMarketDisputeAction} className="resolve-form">
                <input name="disputeId" type="hidden" value={dispute.id} />
                <input name="questionId" type="hidden" value={question.id} />
                <input name="resolutionNote" placeholder="Resolution note" required />
                <button className="button button-buy" name="status" value="resolved">
                  Resolve
                </button>
                <button className="button button-secondary" name="status" value="dismissed">
                  Dismiss
                </button>
              </form>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
