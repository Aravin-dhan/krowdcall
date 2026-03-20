"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MarketBoard } from "@/components/market-board";
import { getYesPrice } from "@/lib/utils";

type PublicMarketSnapshot = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  closeAt: string;
  resolveBy: string;
  forecasterCount: number;
  avgProbability: number | null;
  outcome: number | null;
  totalStake: number;
  tickProbabilities: number[];
  lastTickAt: string | null;
};

const LOCKING_SOON_DAYS = 7;

function splitBoardMarkets(markets: PublicMarketSnapshot[]) {
  const now = Date.now();
  const activeMarkets = markets.filter((m) => m.status === "active");
  // "Locking next" = active markets closing within LOCKING_SOON_DAYS days
  const lockingMarkets = activeMarkets.filter(
    (m) => new Date(m.closeAt).getTime() - now < LOCKING_SOON_DAYS * 24 * 60 * 60 * 1000
  );
  const resolvedMarkets = markets
    .filter((m) => m.status === "resolved")
    .sort((a, b) => new Date(b.closeAt).getTime() - new Date(a.closeAt).getTime())
    .slice(0, 6);
  return { activeMarkets, lockingMarkets, resolvedMarkets };
}

type LiveBoardPanelsProps = {
  initialMarkets: PublicMarketSnapshot[];
  userSignedIn?: boolean;
};

export function LiveBoardPanels({ initialMarkets, userSignedIn = false }: LiveBoardPanelsProps) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [movements, setMovements] = useState<Record<string, { delta: number; volumeDelta: number }>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down">>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const marketsRef = useRef(initialMarkets);
  const flashTimeoutRef = useRef<number | null>(null);

  const { activeMarkets: rawActive, lockingMarkets, resolvedMarkets } = splitBoardMarkets(markets);

  const categories = useMemo(
    () => [...new Set(markets.map((m) => m.category))].sort(),
    [markets]
  );

  const activeMarkets = useMemo(() => {
    return rawActive.filter((m) => {
      const matchesSearch =
        !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [rawActive, searchQuery, activeCategory]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("forecast-density");
      if (stored === "compact" || stored === "comfortable") setDensity(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("forecast-density", density);
    } catch {
      // ignore
    }
  }, [density]);

  useEffect(() => {
    let fallbackInterval: number | null = null;

    const applySnapshot = (nextMarkets: PublicMarketSnapshot[]) => {
      const previousById = new Map(marketsRef.current.map((m) => [m.id, m]));
      const nextMovements: Record<string, { delta: number; volumeDelta: number }> = {};
      const newFlash: Record<string, "up" | "down"> = {};

      for (const market of nextMarkets) {
        const prev = previousById.get(market.id);
        if (!prev) continue;
        const delta =
          getYesPrice(market.avgProbability) - getYesPrice(prev.avgProbability);
        nextMovements[market.id] = {
          delta,
          volumeDelta: market.totalStake - prev.totalStake
        };
        if (delta !== 0) newFlash[market.id] = delta > 0 ? "up" : "down";
      }

      marketsRef.current = nextMarkets;
      setMarkets(nextMarkets);
      setMovements(nextMovements);

      if (Object.keys(newFlash).length > 0) {
        setFlashMap(newFlash);
        if (flashTimeoutRef.current !== null) {
          window.clearTimeout(flashTimeoutRef.current);
        }
        flashTimeoutRef.current = window.setTimeout(() => setFlashMap({}), 900);
      }
    };

    const startFallbackPolling = () => {
      if (fallbackInterval !== null) return;
      fallbackInterval = window.setInterval(async () => {
        if (document.hidden) return;
        const response = await fetch("/api/board", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { markets: PublicMarketSnapshot[] };
        applySnapshot(payload.markets);
      }, 5000);
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      const eventSource = new EventSource("/api/board/stream");
      eventSource.addEventListener("snapshot", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as {
          markets: PublicMarketSnapshot[];
        };
        applySnapshot(payload.markets);
      });
      eventSource.onerror = () => {
        eventSource.close();
        startFallbackPolling();
      };
      return () => {
        eventSource.close();
        if (fallbackInterval !== null) window.clearInterval(fallbackInterval);
        if (flashTimeoutRef.current !== null) window.clearTimeout(flashTimeoutRef.current);
      };
    }

    startFallbackPolling();
    return () => {
      if (fallbackInterval !== null) window.clearInterval(fallbackInterval);
      if (flashTimeoutRef.current !== null) window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  return (
    <div className="stack">
      <div className="board-summary-row board-summary-row-spread">
        <div className="board-filter-row">
          <div className="summary-chip">
            <span className="summary-chip-label">Active</span>
            <strong>{rawActive.length}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Locking next</span>
            <strong>{lockingMarkets.length}</strong>
          </div>
          <div className="summary-chip">
            <span className="summary-chip-label">Resolved</span>
            <strong>{resolvedMarkets.length}</strong>
          </div>
        </div>
        <div className="density-switch" role="tablist" aria-label="Board density">
          <button
            className={density === "compact" ? "density-switch-active" : ""}
            onClick={() => setDensity("compact")}
            type="button"
          >
            Compact
          </button>
          <button
            className={density === "comfortable" ? "density-switch-active" : ""}
            onClick={() => setDensity("comfortable")}
            type="button"
          >
            Comfortable
          </button>
        </div>
      </div>

      <div className="board-filter-bar">
        <div className="board-search-wrap">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="board-search-input"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets…"
            type="search"
            value={searchQuery}
          />
        </div>
        {categories.length > 1 && (
          <div className="category-strip">
            <button
              className={`category-chip${activeCategory === null ? " category-chip-active" : ""}`}
              onClick={() => setActiveCategory(null)}
              type="button"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                className={`category-chip${activeCategory === cat ? " category-chip-active" : ""}`}
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <MarketBoard
        compact={density === "compact"}
        emptyCopy={searchQuery || activeCategory ? "No markets match your filter." : "No active markets."}
        emptyTitle={searchQuery || activeCategory ? "No matches" : "Active is empty"}
        flashMap={flashMap}
        markets={activeMarkets}
        movements={movements}
        title="Active"
        userSignedIn={userSignedIn}
      />

      {lockingMarkets.length > 0 && (
        <MarketBoard
          compact={density === "compact"}
          emptyCopy="Nothing near lock."
          emptyTitle="No near-lock markets"
          flashMap={flashMap}
          markets={lockingMarkets}
          movements={movements}
          title="Closing this week"
          userSignedIn={userSignedIn}
        />
      )}

      <MarketBoard
        compact={density === "compact"}
        emptyCopy="No recently resolved markets."
        emptyTitle="Resolved is empty"
        flashMap={flashMap}
        markets={resolvedMarkets}
        movements={movements}
        title="Resolved recently"
        userSignedIn={userSignedIn}
      />
    </div>
  );
}
