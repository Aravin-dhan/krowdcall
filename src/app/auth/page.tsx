import { AuthPanels } from "@/components/auth-panels";
import { LegalFooter } from "@/components/legal-footer";
import { PageIntro } from "@/components/page-intro";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthPageProps = {
  searchParams?: Promise<{
    verified?: string;
    verify?: string;
    reset?: string;
  }>;
};

function getBannerCopy(params: { verified?: string; verify?: string; reset?: string }) {
  if (params.verified === "success") {
    return {
      status: "success",
      message: "Email verified. Sign in to start forecasting."
    };
  }

  if (params.verified === "invalid") {
    return {
      status: "error",
      message: "That verification link is invalid or expired. Request a fresh one below."
    };
  }

  if (params.verify === "required") {
    return {
      status: "error",
      message: "Verify your email before accessing the app."
    };
  }

  if (params.reset === "sent") {
    return {
      status: "success",
      message: "If the account exists, a password reset link has been sent."
    };
  }

  return null;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : {};
  const banner = getBannerCopy(params);

  return (
    <main className="site-shell auth-shell">
      <section className="hero">
        <div className="utility-row">
          <ThemeToggle />
        </div>
        {banner ? <p className={`form-message ${banner.status}`}>{banner.message}</p> : null}
        <PageIntro
          eyebrow="Free to join"
          title="Your forecast. Your record."
        />
        <AuthPanels />
      </section>
      <LegalFooter />
    </main>
  );
}
