"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForecastComposer } from "@/components/forecast-composer";
import { MarketDisputeForm } from "@/components/market-dispute-form";
import { MarketEnforcementPanel } from "@/components/market-enforcement-panel";
import { MarketHistory } from "@/components/market-history";
import { MarketNewsPanel } from "@/components/market-news-panel";
import type {
  AppForecast,
  AppForecastTick,
  AppMarketDispute,
  AppMarketEvent,
  AppQuestion,
  AppUser
} from "@/lib/schema";
import {
  formatCoins,
  formatDate,
  formatSignedDelta,
  getNoPrice,
  getPayoutMultiplier,
  getYesPrice
} from "@/lib/utils";

type MarketStats = {
  questionId: string;
  forecasterCount: number;
  avgProbability: number | null;
  totalStake: number;
};

type MarketPayload = {
  question: AppQuestion;
  marketStats: MarketStats;
  ticks: AppForecastTick[];
};

type LiveMarketViewProps = {
  initialQuestion: AppQuestion;
  initialMarketStats: MarketStats;
  initialTicks: AppForecastTick[];
  initialEvents: Array<{
    event: AppMarketEvent;
    actor: AppUser | null;
  }>;
  initialDisputes: Array<{
    dispute: AppMarketDispute;
    creator: AppUser;
  }>;
  userSignedIn: boolean;
  userForecast: AppForecast | null;
  defaultSide: "agree" | "disagree";
  initialSubmitted?: boolean;
  initialError?: string;
  wallet: {
    availableCoins: number;
    deployedCoins: number;
    winRate: number;
  } | null;
};

export function LiveMarketView({
  initialQuestion,
  initialMarketStats,
  initialTicks,
  initialEvents,
  initialDisputes,
  userSignedIn,
  userForecast,
  defaultSide,
  initialSubmitted = false,
  initialError = "",
  wallet
}: LiveMarketViewProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [marketStats, setMarketStats] = useState(initialMarketStats);
  const [ticks, setTicks] = useState(initialTicks);
  const [priceDelta, setPriceDelta] = useState(0);
  const [volumeDelta, setVolumeDelta] = useState(0);
  const [showSubmitted, setShowSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    let fallbackInterval: number | null = null;

    const applySnapshot = (payload: MarketPayload) => {
      setMarketStats((previousStats) => {
        setPriceDelta(
          getYesPrice(payload.marketStats.avgProbability) -
            getYesPrice(previousStats.avgProbability)
        );
        setVolumeDelta(payload.marketStats.totalStake - previousStats.totalStake);
        return payload.marketStats;
      });

      setQuestion(payload.question);
      setTicks(payload.ticks);
    };

    const startFallbackPolling = () => {
      if (fallbackInterval !== null) {
        return;
      }

      fallbackInterval = window.setInterval(async () => {
        if (document.hidden) {
          return;
        }

        const response = await fetch(`/api/markets/${question.slug}`, { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        applySnapshot((await response.json()) as MarketPayload);
      }, 5000);
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      const eventSource = new EventSource(`/api/markets/${question.slug}/stream`);

      eventSource.addEventListener("snapshot", (event) => {
        applySnapshot(JSON.parse((event as MessageEvent).data) as MarketPayload);
      });

      eventSource.onerror = () => {
        eventSource.close();
        startFallbackPolling();
      };

      return () => {
        eventSource.close();

        if (fallbackInterval !== null) {
          window.clearInterval(fallbackInterval);
        }
      };
    }

    startFallbackPolling();

    return () => {
      if (fallbackInterval !== null) {
        window.clearInterval(fallbackInterval);
      }
    };
  }, [question.slug]);

  useEffect(() => {
    if (!showSubmitted) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowSubmitted(false);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [showSubmitted]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setError("");
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [error]);

  const yesPrice =
    question.status === "resolved"
      ? question.outcome === 1
        ? 100
        : 0
      : getYesPrice(marketStats.avgProbability);
  const noPrice =
    question.status === "resolved"
      ? question.outcome === 0
        ? 100
        : 0
      : getNoPrice(marketStats.avgProbability);

  return (
    <>
      <section className="panel market-head">
        <div className="stack-sm">
          <div className="question-meta">
            <span className="pill">{question.category}</span>
            <span className={`pill pill-${question.status}`}>{question.status}</span>
          </div>
          <h1>{question.title}</h1>
        </div>
        <div className="market-head-stats">
          <div className="summary-chip">
            <span className="summary-chip-label">YES</span>
            <strong>{yesPrice}%</strong>
            <span className="small-copy">{yesPrice > 0 ? `${getPayoutMultiplier(yesPrice)}x` : "--"}</span>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">NO</span>
            <strong>{noPrice}%</strong>
            <span className="small-copy">{noPrice > 0 ? `${getPayoutMultiplier(noPrice)}x` : "--"}</span>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Volume</span>
            <strong>{marketStats.totalStake}</strong>
            <span className="small-copy">{marketStats.forecasterCount} {marketStats.forecasterCount === 1 ? "trader" : "traders"}</span>
          </div>
          {wallet ? (
            <div className="summary-chip">
              <span className="summary-chip-label">Your coins</span>
              <strong>{formatCoins(wallet.availableCoins)}</strong>
              <span className="small-copy">{formatCoins(wallet.deployedCoins)} deployed</span>
            </div>
          ) : null}
          <div
            className={`summary-chip ${
              priceDelta > 0 ? "summary-chip-up" : priceDelta < 0 ? "summary-chip-down" : ""
            }`}
          >
            <span className="summary-chip-label">Last move</span>
            <strong>{formatSignedDelta(priceDelta)}%</strong>
            <span className="small-copy">
              {volumeDelta > 0 ? `+${volumeDelta}` : volumeDelta} coins
            </span>
          </div>
        </div>
      </section>

      <section className="detail-grid detail-grid-trading">
        <div className="stack">
          {showSubmitted ? (
            <div className="ticket-status ticket-status-success">
              Forecast submitted. Tape will update as the market moves.
            </div>
          ) : null}
          {error ? <div className="ticket-status ticket-status-error">{error}</div> : null}

          <MarketHistory ticks={ticks} />

          <section className="panel stack">
            <div className="section-header">
              <h2>Resolution</h2>
              <span className="small-copy" suppressHydrationWarning>
                {formatDate(question.closeAt)}
              </span>
            </div>
            <div className="resolution-grid">
              <div className="resolution-row">
                <span className="small-copy">Source</span>
                <strong>{question.resolutionSource}</strong>
              </div>
              <div className="resolution-row">
                <span className="small-copy">Outcome</span>
                <strong>
                  {question.status === "resolved"
                    ? question.outcome === 1
                      ? "YES"
                      : "NO"
                    : "Pending"}
                </strong>
              </div>
              <div className="resolution-row">
                <span className="small-copy">Rules</span>
                <strong>{question.description}</strong>
              </div>
            </div>
          </section>

          <MarketNewsPanel slug={question.slug} />

          <MarketEnforcementPanel events={initialEvents} disputes={initialDisputes} />
        </div>

        <aside className="panel stack trade-ticket">
          <div className="section-header">
            <h2>Order ticket</h2>
            <span className="small-copy">{question.status === "active" ? "Live" : "Closed"}</span>
          </div>

          {userSignedIn ? (
            <>
              <ForecastComposer
                availableCoins={wallet?.availableCoins ?? null}
                defaultProbability={Math.round(
                  userForecast?.probability ?? (defaultSide === "agree" ? 62 : 38)
                )}
                defaultSide={defaultSide}
                defaultStakeCoins={userForecast?.stakeCoins ?? 25}
                disabled={question.status !== "active"}
                questionSlug={question.slug}
                userForecast={userForecast}
              />
              <div className="ticket-footnote">
                <span className="small-copy">Latest view</span>
                <strong>
                  {userForecast
                    ? `${userForecast.side === "agree" ? "YES" : "NO"} · ${Math.round(
                        userForecast.probability
                      )}% · ${userForecast.stakeCoins} coins`
                    : "No position"}
                </strong>
              </div>
              <section className="ticket-footnote">
                <span className="small-copy">Enforcement</span>
                <strong>Audit trail, source lock, and dispute review are live.</strong>
              </section>
              <section className="panel stack dispute-card">
                <div className="section-header">
                  <h2>Challenge this market</h2>
                  <span className="small-copy">For source or rule issues</span>
                </div>
                <MarketDisputeForm questionId={question.id} />
              </section>
            </>
          ) : (
            <div className="stack gate-card">
              <strong>Sign in to place a forecast.</strong>
              <Link className="button button-primary" href="/auth">
                Sign in
              </Link>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
