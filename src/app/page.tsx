import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buildPublicMarketSnapshots } from "@/lib/data";
import { siteConfig } from "@/config/site";
import { LiveBoardPanels } from "@/components/live-board-panels";
import { LegalFooter } from "@/components/legal-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductTour } from "@/components/product-tour";

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
        <div className="board-hero-copy stack-xs">
          <span className="eyebrow">Public market</span>
          <h1>Get to the crux.</h1>
          <p className="small-copy">Predict yes/no outcomes on real events. Earn coins when you&apos;re right. No real money.</p>
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
