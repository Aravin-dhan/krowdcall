"use client";

import { useActionState } from "react";
import { defaultActionState } from "@/app/action-state";
import { resendVerificationAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function ResendVerificationForm() {
  const [state, formAction] = useActionState(
    resendVerificationAction,
    defaultActionState
  );

  return (
    <form action={formAction} className="stack-sm">
      <label className="field">
        <span>Need a new verification link?</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {state.status !== "idle" ? (
        <p className={`form-message ${state.status}`}>{state.message}</p>
      ) : null}
      <SubmitButton>Resend verification</SubmitButton>
    </form>
  );
}
