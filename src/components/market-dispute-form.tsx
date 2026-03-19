"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultActionState } from "@/app/action-state";
import { createMarketDisputeAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

type MarketDisputeFormProps = {
  questionId: string;
};

export function MarketDisputeForm({ questionId }: MarketDisputeFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createMarketDisputeAction, defaultActionState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="stack">
      <input name="questionId" type="hidden" value={questionId} />
      <label className="field">
        <span>Dispute note</span>
        <textarea
          name="message"
          placeholder="Flag ambiguity, source issues, or resolution concerns."
          required
          rows={4}
        />
      </label>
      {state.status !== "idle" ? (
        <p className={`form-message ${state.status === "error" ? "error" : "success"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton>Open dispute</SubmitButton>
    </form>
  );
}
