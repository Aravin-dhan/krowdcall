import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cruxd — Call it before the crowd.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        {/* Saffron accent bar top-left */}
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
        {/* Top wordmark */}
        <div
          style={{
            position: "absolute",
            top: "64px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.04em"
            }}
          >
            Cruxd
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#71717a",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}
          >
            Prediction Markets
          </div>
        </div>
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "80px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: "1px solid #1f1f1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              border: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.3)"
              }}
            />
          </div>
        </div>
        {/* Sanskrit */}
        <div style={{ fontSize: "16px", color: "#f97316", marginBottom: "24px" }}>
          सत्यमेव जयते
        </div>
        {/* Headline */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            maxWidth: "900px"
          }}
        >
          Call it before
          <br />
          the crowd.
        </div>
        {/* Sub */}
        <div style={{ fontSize: "22px", color: "#71717a" }}>
          India&apos;s prediction market for elections, cricket, and current events.
        </div>
      </div>
    ),
    { ...size }
  );
}
