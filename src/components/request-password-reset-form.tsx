"use client";

import { useActionState } from "react";
import { defaultActionState } from "@/app/action-state";
import { requestPasswordResetAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function RequestPasswordResetForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    defaultActionState
  );

  return (
    <form action={formAction} className="stack">
      <label className="field">
        <span>Email</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {state.status !== "idle" ? (
        <p className={`form-message ${state.status}`}>{state.message}</p>
      ) : null}
      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
