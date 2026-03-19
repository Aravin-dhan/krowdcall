import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { RequestPasswordResetForm } from "@/components/request-password-reset-form";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { ThemeToggle } from "@/components/theme-toggle";

type ResetPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPage({ searchParams }: ResetPageProps) {
  const params = searchParams ? await searchParams : {};
  const token = params.token?.trim();

  return (
    <main className="site-shell auth-shell">
      <section className="hero">
        <div className="utility-row">
          <Link className="button button-secondary" href="/auth">
            Back to auth
          </Link>
          <ThemeToggle />
        </div>
        <PageIntro
          eyebrow="Password reset"
          title={token ? "Choose a new password." : "Request a password reset link."}
          copy={
            token
              ? "This form consumes the reset link and signs you back into the app."
              : "Enter the account email and we will send a reset link if the account exists."
          }
        />
        <section className="panel auth-panel">
          {token ? <ResetPasswordForm token={token} /> : <RequestPasswordResetForm />}
        </section>
      </section>
    </main>
  );
}
