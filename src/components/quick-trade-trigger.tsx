"use client";

import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForecastComposer } from "@/components/forecast-composer";
import { cn, formatCoins } from "@/lib/utils";

type QuickTradeTriggerProps = {
  market: {
    slug: string;
    title: string;
  };
  side: "agree" | "disagree";
  probability: number;
  signedIn: boolean;
};

const holdDelayMs = 260;

export function QuickTradeTrigger({
  market,
  side,
  probability,
  signedIn
}: QuickTradeTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number | null>(null);

  function clearHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function beginHold() {
    clearHold();
    setHeld(false);
    holdTimer.current = window.setTimeout(() => {
      setHeld(true);
      setOpen(true);
    }, holdDelayMs);
  }

  function endHold() {
    clearHold();
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (held) {
      event.preventDefault();
      setHeld(false);
      return;
    }

    router.push(`/markets/${market.slug}?side=${side}`);
  }

  return (
    <>
      <button
        className={cn("button", side === "agree" ? "button-buy" : "button-sell")}
        onClick={handleClick}
        onPointerCancel={endHold}
        onPointerDown={beginHold}
        onPointerLeave={endHold}
        onPointerUp={endHold}
        type="button"
      >
        {side === "agree" ? "YES" : "NO"}
      </button>

      {open ? (
        <div className="quick-ticket-backdrop" onClick={() => setOpen(false)}>
          <div
            className="quick-ticket panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="section-header">
              <div className="stack-xs">
                <h2>Quick ticket</h2>
                <span className="small-copy">{market.title}</span>
              </div>
              <button className="button button-secondary quick-ticket-close" onClick={() => setOpen(false)} type="button">
                Close
              </button>
            </div>

            <div className="quick-ticket-hint">
              <span className="small-copy">
                Hold to open. Set your probability and size, then submit without leaving the board.
              </span>
            </div>

            {signedIn ? (
              <ForecastComposer
                compact
                defaultProbability={probability}
                defaultSide={side}
                defaultStakeCoins={25}
                questionSlug={market.slug}
              />
            ) : (
              <div className="gate-card stack">
                <strong>Sign in to forecast from the board.</strong>
                <span className="small-copy">Your forecasts are tied to your account and coin balance.</span>
                <Link className="button button-primary" href="/auth">
                  Sign in
                </Link>
              </div>
            )}

            <div className="quick-ticket-footer">
              <span className="small-copy">Default stack</span>
              <strong>{formatCoins(25)} coins</strong>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
