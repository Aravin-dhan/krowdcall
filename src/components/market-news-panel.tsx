"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

type MarketNewsPanelProps = {
  slug: string;
};

export function MarketNewsPanel({ slug }: MarketNewsPanelProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const response = await fetch(`/api/markets/${slug}/news`, {
        cache: "no-store"
      });

      if (!response.ok || !active) {
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as {
        items: NewsItem[];
      };

      if (!active) {
        return;
      }

      setItems(payload.items);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <section className="panel stack">
      <div className="section-header">
        <h2>Related news</h2>
        <span className="small-copy">Curated sources</span>
      </div>

      {loading ? <div className="chart-empty">Loading related coverage...</div> : null}

      {!loading && items.length === 0 ? (
        <div className="chart-empty">No curated coverage found yet.</div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="news-list">
          {items.map((item) => (
            <a
              className="news-row"
              href={item.link}
              key={`${item.link}-${item.title}`}
              rel="noreferrer"
              target="_blank"
            >
              <div className="stack-xs">
                <strong>{item.title}</strong>
                <span className="small-copy">
                  {item.source}
                  {item.publishedAt
                    ? ` · ${new Date(item.publishedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })}`
                    : ""}
                </span>
              </div>
              <span className="news-open">Read</span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
