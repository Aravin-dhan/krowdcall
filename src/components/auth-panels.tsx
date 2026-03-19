"use client";

import Link from "next/link";
import { useActionState } from "react";
import { defaultActionState } from "@/app/action-state";
import { loginAction, signupAction } from "@/app/actions";
import { ResendVerificationForm } from "@/components/resend-verification-form";
import { SubmitButton } from "@/components/submit-button";

export function AuthPanels() {
  const [signupState, signupFormAction] = useActionState(
    signupAction,
    defaultActionState
  );
  const [loginState, loginFormAction] = useActionState(
    loginAction,
    defaultActionState
  );

  return (
    <div className="auth-grid">
      <section className="panel auth-panel">
        <div className="panel-heading stack-xs">
          <span className="eyebrow">New account</span>
          <h2>Create account</h2>
        </div>
        <form action={signupFormAction} className="stack">
          <label className="field">
            <span>Name</span>
            <input autoComplete="name" name="displayName" placeholder="Aarav" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="new-password" minLength={8} name="password" required type="password" />
          </label>
          <label className="field field-checkbox">
            <input name="ageConfirm" required type="checkbox" value="1" />
            <span>I confirm I am at least 18 years old and agree to the <a href="/legal/terms" target="_blank">Terms of Service</a> and <a href="/legal/privacy" target="_blank">Privacy Policy</a>.</span>
          </label>
          {signupState.status !== "idle" ? (
            <p className={`form-message ${signupState.status}`}>{signupState.message}</p>
          ) : null}
          <SubmitButton>Create account</SubmitButton>
        </form>
      </section>

      <section className="panel auth-panel">
        <div className="panel-heading stack-xs">
          <span className="eyebrow">Existing account</span>
          <h2>Sign in</h2>
        </div>
        <form action={loginFormAction} className="stack">
          <label className="field">
            <span>Email</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" name="password" required type="password" />
          </label>
          {loginState.status === "error" ? (
            <p className="form-message error">{loginState.message}</p>
          ) : null}
          <SubmitButton>Sign in</SubmitButton>
        </form>
        <div className="stack-sm form-divider">
          <Link className="small-copy auth-link" href="/auth/reset">
            Forgot your password?
          </Link>
          <ResendVerificationForm />
        </div>
      </section>
    </div>
  );
}
