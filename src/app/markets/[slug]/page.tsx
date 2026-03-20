import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveMarketView } from "@/components/live-market-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserWalletSummary,
  getQuestionBySlug,
  getQuestionForecast
} from "@/lib/db";
import { buildPublicMarketActivity } from "@/lib/data";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);

  if (!question || question.status === "draft") {
    return { title: "Market not found" };
  }

  const APP_URL = process.env.APP_URL ?? "https://cruxd.in";
  const url = `${APP_URL}/markets/${slug}`;
  const description = `${question.category} · ${question.description.slice(0, 120)}`;

  return {
    title: question.title,
    description,
    openGraph: {
      type: "website",
      url,
      title: question.title,
      description,
      siteName: "Cruxd"
    },
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description
    }
  };
}

type MarketPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    side?: string;
    submitted?: string;
    error?: string;
  }>;
};

export default async function MarketPage({ params, searchParams }: MarketPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sideParam = (resolvedSearchParams?.side ?? "") === "disagree" ? "disagree" : "agree";
  const submitted = resolvedSearchParams?.submitted === "1";
  const error = resolvedSearchParams?.error === "coins" ? "Not enough available coins for that size." : "";
  const [question, user] = await Promise.all([getQuestionBySlug(slug), getCurrentUser()]);

  if (!question || question.status === "draft") {
    notFound();
  }

  const [userForecast, wallet, activity] = await Promise.all([
    user ? getQuestionForecast(question.id, user.id) : Promise.resolve(null),
    user ? getUserWalletSummary(user.id) : Promise.resolve(null),
    buildPublicMarketActivity(question.slug)
  ]);

  if (!activity) {
    notFound();
  }

  return (
    <main className="site-shell landing-shell market-page-shell">
      <div className="stack">
        <div className="utility-row">
          <Link className="button button-secondary" href={user ? "/app" : "/"}>
            Back
          </Link>
          <ThemeToggle />
        </div>
        <LiveMarketView
          defaultSide={sideParam}
          initialMarketStats={{
            questionId: activity.marketStats.questionId,
            forecasterCount: Number(activity.marketStats.forecasterCount ?? 0),
            avgProbability:
              activity.marketStats.avgProbability !== null
                ? Number(activity.marketStats.avgProbability)
                : null,
            totalStake: Number(activity.marketStats.totalStake ?? 0)
          }}
          initialQuestion={activity.question}
          initialTicks={activity.ticks}
          initialDisputes={activity.disputes}
          initialEvents={activity.events}
          initialError={error}
          initialSubmitted={submitted}
          userForecast={userForecast ?? null}
          userSignedIn={Boolean(user)}
          wallet={wallet}
        />
      </div>
    </main>
  );
}
