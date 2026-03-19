import type { ReactNode } from "react";
import Link from "next/link";
import { AppNavigation } from "@/components/app-navigation";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/lib/auth";
import { getUserWalletSummary } from "@/lib/db";
import { formatCoins } from "@/lib/utils";

export default async function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireUser();
  const wallet = await getUserWalletSummary(user.id);

  return (
    <main className="site-shell app-shell">
      <aside className="app-sidebar panel">
        <div className="stack">
          <div className="stack-xs">
            <Link href="/" className="brand-mark">
              {siteConfig.name}
            </Link>
            <p className="small-copy">{siteConfig.shortDescription}</p>
          </div>
          <AppNavigation isAdmin={user.role === "admin"} />
        </div>
        <div className="stack">
          <ThemeToggle />
          <div className="user-block">
            <strong>{user.displayName}</strong>
            <span className="small-copy">{user.email}</span>
            <span className="small-copy">
              {formatCoins(wallet.availableCoins)} coins available
            </span>
            {user.role === "admin" ? <span className="pill">{user.role}</span> : null}
          </div>
          <LogoutButton />
          <div className="sidebar-legal-links">
            <Link href="/legal/terms" className="small-copy">Terms</Link>
            <Link href="/legal/privacy" className="small-copy">Privacy</Link>
            <Link href="/legal/disclaimer" className="small-copy">Disclaimer</Link>
          </div>
        </div>
      </aside>
      <section className="app-content">{children}</section>
    </main>
  );
}
