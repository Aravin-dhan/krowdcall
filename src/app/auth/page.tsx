import Link from "next/link";
import { AuthPanels } from "@/components/auth-panels";
import { LegalFooter } from "@/components/legal-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

type AuthPageProps = {
  searchParams?: Promise<{
    verified?: string;
    verify?: string;
    reset?: string;
  }>;
};

function getBannerCopy(params: { verified?: string; verify?: string; reset?: string }) {
  if (params.verified === "success") {
    return { status: "success", message: "Email verified. Sign in to start forecasting." };
  }
  if (params.verified === "invalid") {
    return { status: "error", message: "That verification link is invalid or expired." };
  }
  if (params.verify === "required") {
    return { status: "error", message: "Verify your email before accessing the app." };
  }
  if (params.reset === "sent") {
    return { status: "success", message: "If the account exists, a password reset link has been sent." };
  }
  return null;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : {};
  const banner = getBannerCopy(params);

  return (
    <main className="auth-page-shell">
      {/* Top nav */}
      <nav className="auth-topnav">
        <Link className="brand-mark" href="/">{siteConfig.name}</Link>
        <div className="auth-topnav-right">
          <ThemeToggle />
          <Link className="button button-secondary" href="/">← Board</Link>
        </div>
      </nav>

      <div className="auth-center">
        <div className="auth-headline">
          <span className="eyebrow">Free to join</span>
          <h1>Your forecast.<br />Your record.</h1>
          <p>Predict yes/no outcomes on real events. 10,000 coins to start. No real money.</p>
        </div>

        {banner && (
          <p className={`form-message ${banner.status} auth-banner`}>{banner.message}</p>
        )}

        <AuthPanels />
      </div>

      <LegalFooter />
    </main>
  );
}
