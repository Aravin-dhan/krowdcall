import { ImageResponse } from "next/og";
import { getQuestionBySlug } from "@/lib/db";
import { buildPublicMarketActivity } from "@/lib/data";
import { getYesPrice } from "@/lib/utils";

export const runtime = "edge";
export const alt = "Cruxd market";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);

  if (!question || question.status === "draft") {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#000",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "32px",
            fontFamily: "sans-serif"
          }}
        >
          Cruxd
        </div>
      ),
      { ...size }
    );
  }

  const activity = await buildPublicMarketActivity(slug);
  const avgProb = activity?.marketStats.avgProbability
    ? Number(activity.marketStats.avgProbability)
    : null;
  const yesPrice =
    question.status === "resolved"
      ? question.outcome === 1
        ? 100
        : 0
      : getYesPrice(avgProb);
  const noPrice = 100 - yesPrice;

  const statusLabel =
    question.status === "resolved"
      ? `Resolved: ${question.outcome === 1 ? "YES" : "NO"}`
      : question.status === "locked"
        ? "Locked"
        : "Live";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative"
        }}
      >
        {/* Saffron side bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "6px",
            height: "100%",
            background: "#f97316"
          }}
        />

        {/* Wordmark top */}
        <div
          style={{
            position: "absolute",
            top: "64px",
            left: "80px",
            fontSize: "22px",
            fontWeight: 800,
            color: "#f97316",
            letterSpacing: "-0.03em",
            display: "flex"
          }}
        >
          Cruxd
        </div>

        {/* Status + category top-right */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            display: "flex",
            gap: "12px",
            alignItems: "center"
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex"
            }}
          >
            {question.category}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: question.status === "active" ? "#1ec97b" : "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex"
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* YES / NO chips */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "32px"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(30,201,123,0.1)",
              border: "1px solid rgba(30,201,123,0.3)",
              borderRadius: "14px",
              padding: "16px 32px"
            }}
          >
            <div style={{ fontSize: "13px", color: "#1ec97b", marginBottom: "4px", display: "flex" }}>
              YES
            </div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#ffffff", display: "flex" }}>
              {yesPrice}%
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,92,92,0.1)",
              border: "1px solid rgba(255,92,92,0.3)",
              borderRadius: "14px",
              padding: "16px 32px"
            }}
          >
            <div style={{ fontSize: "13px", color: "#ff5c5c", marginBottom: "4px", display: "flex" }}>
              NO
            </div>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#ffffff", display: "flex" }}>
              {noPrice}%
            </div>
          </div>
          {activity && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#0d0d0d",
                border: "1px solid #1f1f1f",
                borderRadius: "14px",
                padding: "16px 32px"
              }}
            >
              <div style={{ fontSize: "13px", color: "#71717a", marginBottom: "4px", display: "flex" }}>
                Traders
              </div>
              <div style={{ fontSize: "48px", fontWeight: 800, color: "#ffffff", display: "flex" }}>
                {Number(activity.marketStats.forecasterCount ?? 0)}
              </div>
            </div>
          )}
        </div>

        {/* Market title */}
        <div
          style={{
            fontSize: question.title.length > 60 ? "38px" : "48px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "1040px",
            display: "flex"
          }}
        >
          {question.title}
        </div>
      </div>
    ),
    { ...size }
  );
}
