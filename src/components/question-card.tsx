import Link from "next/link";
import type { AppQuestion } from "@/lib/schema";
import { formatDate, formatRelativeClose } from "@/lib/utils";

type QuestionCardProps = {
  question: AppQuestion;
};

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <article className="panel question-card">
      <div className="question-card-glow" />
      <div className="question-meta">
        <span className="pill">{question.category}</span>
        <span className={`pill pill-${question.status}`}>{question.status}</span>
      </div>
      <div className="stack-sm question-title-wrap">
        <h3>{question.title}</h3>
        <p>{question.description}</p>
      </div>
      <div className="question-signal">
        <span className="small-copy">Forecast momentum</span>
        <div className="question-signal-bar">
          <span className={`question-signal-fill question-signal-fill-${question.status}`} />
        </div>
      </div>
      <div className="question-footer">
        <div>
          <span className="muted">{formatRelativeClose(question.closeAt)}</span>
          <div className="small-copy">Resolving by {formatDate(question.resolveBy)}</div>
        </div>
        <Link className="button button-primary" href={`/markets/${question.slug}`}>
          Open
        </Link>
      </div>
    </article>
  );
}
