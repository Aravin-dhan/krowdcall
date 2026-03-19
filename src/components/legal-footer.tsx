import Link from "next/link";
import { siteConfig } from "@/config/site";

export function LegalFooter() {
  return (
    <footer className="legal-footer panel">
      <div className="legal-footer-links">
        <Link href="/legal/terms">Terms</Link>
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/disclaimer">Disclaimer</Link>
      </div>
      <p className="small-copy legal-copyright">
        {siteConfig.name} &mdash; Play-money predictions. No real money. No gambling. 18+ only.
      </p>
    </footer>
  );
}
