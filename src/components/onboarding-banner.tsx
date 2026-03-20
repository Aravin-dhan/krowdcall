"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "cruxd-onboarded";

const steps = [
  {
    icon: "📋",
    title: "Pick a market",
    body: "Browse yes/no questions on elections, cricket, world events — things actually happening."
  },
  {
    icon: "🎯",
    title: "Call it",
    body: "Hit YES or NO. Set your probability and how many coins you want to stake."
  },
  {
    icon: "🪙",
    title: "Earn coins",
    body: "You start with 10,000 coins. No real money ever. Win coins when you're right."
  },
  {
    icon: "🏆",
    title: "Get ranked",
    body: "Your Brier score tracks accuracy across all calls. Lower is better. Climb the board."
  }
];

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="onboarding-banner panel">
      <div className="onboarding-header">
        <div className="stack-xs">
          <span className="eyebrow">How it works</span>
          <h2>Make your first call in 30 seconds.</h2>
        </div>
        <button className="button button-secondary onboarding-dismiss" onClick={dismiss} type="button">
          Got it
        </button>
      </div>
      <div className="onboarding-steps">
        {steps.map((step) => (
          <div className="onboarding-step" key={step.title}>
            <span className="onboarding-icon">{step.icon}</span>
            <div className="stack-xs">
              <strong>{step.title}</strong>
              <span className="small-copy">{step.body}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="onboarding-footer">
        <span className="small-copy">Play money only. No deposits. No withdrawals. Just skill.</span>
        <Link className="button button-primary" href="/auth">
          Create free account →
        </Link>
      </div>
    </div>
  );
}
