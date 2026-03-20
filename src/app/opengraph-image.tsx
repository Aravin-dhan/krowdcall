import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cruxd — Call it before the crowd";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "#000000",
          gap: 0,
        }}
      >
        {/* Subtle grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Icon */}
          <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#111" />
            <path d="M15 42h10V22H15v20Zm12 0h10V14H27v28Zm12 0h10V30H39v12Z" fill="#f5f5f5" />
          </svg>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#f4f4f5", letterSpacing: "-0.02em" }}>
            Cruxd
          </span>
        </div>

        {/* Live pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            padding: "6px 16px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#1ec97b",
            }}
          />
          <span style={{ fontSize: 16, color: "#8d8d93", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Live prediction market
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f4f4f5",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: 24,
          }}
        >
          Call it before<br />the crowd.
        </div>

        {/* Sub-copy */}
        <div style={{ fontSize: 24, color: "#8d8d93", marginBottom: 48 }}>
          Elections · Cricket · World events · No real money.
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { label: "Markets", value: "21+" },
            { label: "Play coins", value: "10,000" },
            { label: "Real money", value: "₹0" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: "#f4f4f5" }}>{stat.value}</span>
              <span style={{ fontSize: 16, color: "#8d8d93" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
