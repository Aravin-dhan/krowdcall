"use client";

import { useActionState } from "react";
import { defaultActionState } from "@/app/action-state";
import { createQuestionAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function CreateQuestionForm() {
  const [state, formAction] = useActionState(
    createQuestionAction,
    defaultActionState
  );

  return (
    <form action={formAction} className="panel stack">
      <div className="panel-heading stack-xs">
        <span className="eyebrow">Admin</span>
        <h2>Publish a new question</h2>
      </div>
      <label className="field">
        <span>Title</span>
        <input name="title" placeholder="Will India win the toss tonight?" required />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          placeholder="Describe the criteria, timing, and source."
          required
          rows={4}
        />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Category</span>
          <input name="category" placeholder="Cricket" required />
        </label>
        <label className="field">
          <span>Resolution source</span>
          <input
            name="resolutionSource"
            placeholder="Official match scorecard"
            required
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Close at</span>
          <input name="closeAt" required type="datetime-local" />
        </label>
        <label className="field">
          <span>Resolve by</span>
          <input name="resolveBy" required type="datetime-local" />
        </label>
      </div>
      <label className="field">
        <span>Initial status</span>
        <select className="select-input" defaultValue="draft" name="status">
          <option value="draft">Draft</option>
          <option value="active">Publish immediately</option>
        </select>
      </label>
      {state.status !== "idle" ? (
        <p className={`form-message ${state.status === "error" ? "error" : "success"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>Save question</SubmitButton>
    </form>
  );
}
