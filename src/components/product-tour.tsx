"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cruxd-toured";

type Step = {
  target?: string;        // CSS selector to spotlight
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
};

const STEPS: Step[] = [
  {
    title: "👋 Welcome to Cruxd",
    body: "Predict yes/no outcomes on real events — elections, cricket, world events. No real money, ever. Let's take a quick look around.",
  },
  {
    target: ".market-board-row",
    title: "📋 These are markets",
    body: "Each row is a live yes/no question on something happening in the real world. Click the title to read the full market.",
    placement: "bottom",
  },
  {
    target: ".market-board-action",
    title: "🎯 Call it — YES or NO",
    body: "Hit YES if you think it'll happen, NO if you think it won't. Quick click navigates to the full market. Hold for an instant ticket.",
    placement: "left",
  },
  {
    target: ".category-strip",
    title: "🗂 Filter by topic",
    body: "Browse West Bengal 2026, Tamil Nadu, Cricket, Lok Sabha 2027, World Events — pick what you know best.",
    placement: "bottom",
  },
  {
    title: "🪙 You start with 10,000 coins",
    body: "No deposits. No real money. Win coins by calling it right. Your Brier score on the leaderboard tracks accuracy across all your calls.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function TooltipCard({
  step,
  index,
  total,
  rect,
  onNext,
  onSkip,
}: {
  step: Step;
  index: number;
  total: number;
  rect: Rect | null;
  onNext: () => void;
  onSkip: () => void;
}) {
  const PAD = 14;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  let style: React.CSSProperties = {
    position: "fixed",
    zIndex: 10001,
    width: 300,
  };

  if (!rect || !step.target) {
    // centred modal
    style = {
      ...style,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 340,
    };
  } else {
    const placement = step.placement ?? "bottom";
    if (placement === "bottom") {
      style.top = rect.top + rect.height + PAD;
      style.left = Math.min(rect.left, window.innerWidth - 320);
    } else if (placement === "top") {
      style.top = rect.top - PAD - 160;
      style.left = Math.min(rect.left, window.innerWidth - 320);
    } else if (placement === "left") {
      style.top = rect.top;
      style.left = rect.left - 320 - PAD;
      if (style.left < 8) style.left = rect.left + rect.width + PAD;
    } else {
      style.top = rect.top;
      style.left = rect.left + rect.width + PAD;
    }
    // clamp to viewport
    if (typeof style.top === "number") style.top = Math.max(8, Math.min(style.top, window.innerHeight - 200));
    if (typeof style.left === "number") style.left = Math.max(8, style.left);
  }

  return (
    <div className="tour-card" style={style}>
      <div className="tour-progress">
        {STEPS.map((_, i) => (
          <span className={`tour-dot${i === index ? " tour-dot-active" : ""}`} key={i} />
        ))}
      </div>
      <h3 className="tour-title">{step.title}</h3>
      <p className="tour-body">{step.body}</p>
      <div className="tour-actions">
        <button className="button button-secondary tour-skip" onClick={onSkip} type="button">
          {isLast ? "Done" : "Skip"}
        </button>
        {!isLast && (
          <button className="button button-primary" onClick={onNext} type="button">
            {isFirst ? "Show me →" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ProductTour() {
  const [step, setStep] = useState(-1); // -1 = not started yet
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setStep(0);
    } catch {/* ignore */}
  }, []);

  const updateRect = useCallback((s: number) => {
    const target = STEPS[s]?.target;
    if (target) {
      setRect(getTargetRect(target));
    } else {
      setRect(null);
    }
  }, []);

  useEffect(() => {
    if (step >= 0) updateRect(step);
  }, [step, updateRect]);

  function next() {
    const nextStep = step + 1;
    if (nextStep >= STEPS.length) {
      dismiss();
    } else {
      setStep(nextStep);
    }
  }

  function dismiss() {
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {/* ignore */}
    setStep(-1);
  }

  if (step < 0) return null;

  const current = STEPS[step];
  const hasTarget = Boolean(current.target && rect);

  return (
    <>
      {/* Dark overlay */}
      <div className="tour-overlay" onClick={dismiss} />

      {/* Spotlight cutout around target */}
      {hasTarget && rect && (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <TooltipCard
        index={step}
        onNext={next}
        onSkip={dismiss}
        rect={hasTarget ? rect : null}
        step={current}
        total={STEPS.length}
      />
    </>
  );
}
