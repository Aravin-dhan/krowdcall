"use client";

import { useMemo, useState } from "react";
import { forecastAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import type { AppForecast } from "@/lib/schema";
import { clamp, cn, formatCoins, getNoPrice, getPayoutMultiplier, getYesPrice } from "@/lib/utils";

type ForecastComposerProps = {
  questionSlug: string;
  defaultProbability: number;
  defaultStakeCoins?: number;
  defaultSide?: "agree" | "disagree";
  disabled?: boolean;
  compact?: boolean;
  availableCoins?: number | null;
  userForecast?: AppForecast | null;
};

const agreeProbabilities = [55, 62, 70, 82];
const disagreeProbabilities = [45, 38, 30, 18];
const stakeOptions = [5, 25, 100, 250];

export function ForecastComposer({
  questionSlug,
  defaultProbability,
  defaultStakeCoins = 25,
  defaultSide,
  disabled = false,
  compact = false,
  availableCoins = null,
  userForecast = null
}: ForecastComposerProps) {
  const initialProbability = clamp(defaultProbability, 1, 99);
  const initialSide =
    defaultSide ?? (initialProbability >= 50 ? "agree" : "disagree");
  const [side, setSide] = useState<"agree" | "disagree">(initialSide);
  const [probability, setProbability] = useState(initialProbability);
  const [stakeCoins, setStakeCoins] = useState(defaultStakeCoins);

  const selectedPrice = side === "agree" ? getYesPrice(probability) : getNoPrice(probability);
  const opposingPrice = 100 - selectedPrice;
  const payoutMultiplier = getPayoutMultiplier(selectedPrice);
  const projectedReturn = Math.round(stakeCoins * Number(payoutMultiplier));
  const quickProbabilities = side === "agree" ? agreeProbabilities : disagreeProbabilities;

  const sliderBounds = useMemo(
    () => (side === "agree" ? { min: 50, max: 99 } : { min: 1, max: 50 }),
    [side]
  );
  const effectiveAvailableCoins = Math.max(
    0,
    (availableCoins ?? 0) + (userForecast?.stakeCoins ?? 0)
  );

  function switchSide(nextSide: "agree" | "disagree") {
    setSide(nextSide);
    setProbability((currentProbability) => {
      if (nextSide === "agree") {
        return currentProbability >= 50 ? currentProbability : 62;
      }

      return currentProbability <= 50 ? currentProbability : 38;
    });
  }

  function updateProbability(nextValue: string) {
    const parsedValue = Number(nextValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    setProbability(clamp(Math.round(parsedValue), sliderBounds.min, sliderBounds.max));
  }

  function updateStake(nextValue: string) {
    const parsedValue = Number(nextValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    setStakeCoins(clamp(Math.round(parsedValue), 1, 1000));
  }

  return (
    <form action={forecastAction} className={cn("ticket-form stack", compact && "ticket-form-compact")}>
      <input name="slug" type="hidden" value={questionSlug} />
      <input name="probability" type="hidden" value={probability} />
      <input name="stakeCoins" type="hidden" value={stakeCoins} />
      <input name="side" type="hidden" value={side} />

      <div className="ticket-side-switch" role="tablist" aria-label="Choose your side">
        <button
          className={cn("ticket-side-button", side === "agree" && "ticket-side-button-agree")}
          disabled={disabled}
          onClick={() => switchSide("agree")}
          type="button"
        >
          YES
        </button>
        <button
          className={cn(
            "ticket-side-button",
            side === "disagree" && "ticket-side-button-disagree"
          )}
          disabled={disabled}
          onClick={() => switchSide("disagree")}
          type="button"
        >
          NO
        </button>
      </div>

      <section className="ticket-summary">
        <div className="ticket-price-stack">
          <span className="small-copy">Entry</span>
          <strong>{selectedPrice}%</strong>
          <span className="small-copy">Opposite: {opposingPrice}%</span>
        </div>
        <div className="ticket-price-stack">
          <span className="small-copy">Payout</span>
          <strong>{payoutMultiplier}x</strong>
          <span className="small-copy">{projectedReturn} coins if correct</span>
        </div>
      </section>
      <div className="prob-split-bar" title={`YES ${selectedPrice}% · NO ${opposingPrice}%`}>
        <div
          className="prob-split-yes"
          style={{ width: `${side === "agree" ? selectedPrice : opposingPrice}%` }}
        />
      </div>

      {availableCoins !== null ? (
        <div className="ticket-cap-row">
          <span className="small-copy">Available now</span>
          <strong>{formatCoins(availableCoins)} coins</strong>
          <span className="small-copy">Max size from here: {formatCoins(effectiveAvailableCoins)}</span>
        </div>
      ) : null}

      <section className="ticket-block stack-xs">
        <div className="ticket-row">
          <span className="small-copy">Probability</span>
          <strong>{probability}%</strong>
        </div>
        <input
          aria-label="Probability"
          className="range-input"
          disabled={disabled}
          max={sliderBounds.max}
          min={sliderBounds.min}
          onChange={(event) => updateProbability(event.target.value)}
          type="range"
          value={probability}
        />
        <div className="quick-probability-row">
          {quickProbabilities.map((value) => (
            <button
              className={cn("chip-button", probability === value && "chip-button-active")}
              disabled={disabled}
              key={value}
              onClick={() => setProbability(value)}
              type="button"
            >
              {value}%
            </button>
          ))}
        </div>
      </section>

      <section className="ticket-block stack-xs">
        <div className="ticket-row">
          <span className="small-copy">Size</span>
          <strong>{stakeCoins} coins</strong>
        </div>
        <div className="stake-chip-row">
          {stakeOptions.map((value) => (
            <button
              className={cn("chip-button", stakeCoins === value && "chip-button-active")}
              disabled={disabled}
              key={value}
              onClick={() => setStakeCoins(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Custom size</span>
          <input
            disabled={disabled}
            inputMode="numeric"
            max={1000}
            min={1}
            onChange={(event) => updateStake(event.target.value)}
            type="number"
            value={stakeCoins}
          />
        </label>
      </section>

      {!disabled ? (
        <SubmitButton>Place {side === "agree" ? "YES" : "NO"}</SubmitButton>
      ) : (
        <button className="button button-secondary" disabled type="button">
          Market locked
        </button>
      )}
    </form>
  );
}
