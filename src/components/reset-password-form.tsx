"use client";

import { useActionState } from "react";
import { defaultActionState } from "@/app/action-state";
import { resetPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPasswordAction, defaultActionState);

  return (
    <form action={formAction} className="stack">
      <input name="token" type="hidden" value={token} />
      <label className="field">
        <span>New password</span>
        <input autoComplete="new-password" minLength={8} name="password" required type="password" />
      </label>
      {state.status !== "idle" ? (
        <p className={`form-message ${state.status}`}>{state.message}</p>
      ) : null}
      <SubmitButton>Reset password</SubmitButton>
    </form>
  );
}
