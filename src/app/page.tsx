import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buildPublicMarketSnapshots } from "@/lib/data";
import { siteConfig } from "@/config/site";
import { LiveBoardPanels } from "@/components/live-board-panels";
import { LegalFooter } from "@/components/legal-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductTour } from "@/components/product-tour";

/** Lotus mandala SVG — 8-petal geometric decoration for hero */
function MandalaIcon() {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    const cx = 100 + 46 * Math.sin(angle);
    const cy = 100 - 46 * Math.cos(angle);
    const rot = i * 45;
    return (
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={10}
        ry={22}
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        transform={`rotate(${rot}, ${cx}, ${cy})`}
      />
    );
  });
  const lines = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 22.5 * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={100}
        y1={100}
        x2={100 + 88 * Math.sin(angle)}
        y2={100 - 88 * Math.cos(angle)}
        stroke="currentColor"
        strokeWidth="0.4"
        opacity={0.5}
      />
    );
  });
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 5" />
      <circle cx="100" cy="100" r="66" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="100" cy="100" r="26" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="8" stroke="currentColor" strokeWidth="0.8" />
      {lines}
      {petals}
    </svg>
  );
}

export default async function HomePage() {
  const [user, markets] = await Promise.all([getCurrentUser(), buildPublicMarketSnapshots()]);

  return (
    <main className="site-shell landing-shell board-shell">
      <section className="top-strip panel">
        <div className="top-strip-copy">
          <span className="brand-mark">{siteConfig.name}</span>
          <span className="small-copy">Live board</span>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-secondary" href={user ? "/app" : "/auth"}>
            {user ? "Account" : "Sign in"}
          </Link>
        </div>
      </section>

      <section className="board-hero panel">
        {/* Decorative lotus mandala — purely visual */}
        <div className="hero-mandala-deco" aria-hidden="true">
          <MandalaIcon />
        </div>

        <div className="board-hero-copy stack-xs">
          <span className="eyebrow">Public market · Indian elections &amp; world events</span>
          <h1>Get to the crux.</h1>
          <p className="small-copy">Predict yes/no outcomes on real events. Earn coins when you&apos;re right. No real money.</p>
          <div className="satyameva-bar">
            <span className="satyameva-devanagari">सत्यमेव जयते</span>
            <span className="satyameva-sep">·</span>
            <span className="satyameva-latin">Truth alone triumphs</span>
          </div>
        </div>
        <div className="board-summary-row board-summary-row-spread">
          <div className="nav-actions">
            <span className="live-dot" />
            <span className="small-copy">Live</span>
          </div>
          {!user ? (
            <Link className="button button-primary" href="/auth">Sign up free</Link>
          ) : null}
        </div>
      </section>

      {!user && <ProductTour />}

      <LiveBoardPanels initialMarkets={markets} userSignedIn={Boolean(user)} />

      <LegalFooter />
    </main>
  );
}
