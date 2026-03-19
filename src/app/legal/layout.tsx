import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="site-shell landing-shell">
      <section className="top-strip panel">
        <div className="top-strip-copy">
          <Link href="/" className="brand-mark">{siteConfig.name}</Link>
          <span className="small-copy">Legal</span>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-secondary" href="/">Back</Link>
        </div>
      </section>

      <section className="legal-content panel">
        {children}
      </section>

      <footer className="legal-footer panel">
        <div className="legal-footer-links">
          <Link href="/legal/terms">Terms of Service</Link>
          <Link href="/legal/privacy">Privacy Policy</Link>
          <Link href="/legal/disclaimer">Disclaimer</Link>
        </div>
        <p className="small-copy legal-copyright">
          {siteConfig.name} &mdash; Play-money prediction platform. No real money. No gambling.
        </p>
      </footer>
    </main>
  );
}
