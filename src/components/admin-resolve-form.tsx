"use client";

import { useState } from "react";
import { resolveQuestionAction } from "@/app/actions";

type AdminResolveFormProps = {
  questionId: string;
};

export function AdminResolveForm({ questionId }: AdminResolveFormProps) {
  const [armed, setArmed] = useState<"yes" | "no" | null>(null);
  const [note, setNote] = useState("");

  if (!armed) {
    return (
      <div className="resolve-form">
        <input
          onChange={(e) => setNote(e.target.value)}
          placeholder="Resolver note"
          type="text"
          value={note}
        />
        <button
          className="button button-buy"
          onClick={() => setArmed("yes")}
          type="button"
        >
          Resolve YES
        </button>
        <button
          className="button button-sell"
          onClick={() => setArmed("no")}
          type="button"
        >
          Resolve NO
        </button>
      </div>
    );
  }

  return (
    <form action={resolveQuestionAction} className="resolve-form">
      <input name="questionId" type="hidden" value={questionId} />
      <input name="note" type="hidden" value={note} />
      <input name="outcome" type="hidden" value={armed === "yes" ? "1" : "0"} />
      <span className="small-copy eyebrow">Confirm {armed.toUpperCase()}?</span>
      <button
        className={`button ${armed === "yes" ? "button-buy" : "button-sell"}`}
        type="submit"
      >
        Confirm {armed.toUpperCase()}
      </button>
      <button
        className="button button-secondary"
        onClick={() => setArmed(null)}
        type="button"
      >
        Cancel
      </button>
    </form>
  );
}
