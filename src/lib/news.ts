import { getQuestionBySlug } from "@/lib/db";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

const politicsSources = [
  "The Hindu",
  "The Indian Express",
  "Business Standard",
  "NDTV",
  "Hindustan Times",
  "India Today",
  "The Times of India"
] as const;

const sportsSources = [
  "ESPNcricinfo",
  "Sportstar",
  "Cricbuzz",
  "The Indian Express",
  "The Hindu"
] as const;

const businessSources = [
  "Business Standard",
  "Moneycontrol",
  "The Economic Times",
  "Mint",
  "The Hindu BusinessLine"
] as const;

function getSourceAllowlist(category: string, title: string) {
  const value = `${category} ${title}`.toLowerCase();

  if (
    value.includes("election") ||
    value.includes("assembly") ||
    value.includes("bjp") ||
    value.includes("congress") ||
    value.includes("tmc") ||
    value.includes("dmk") ||
    value.includes("aiadmk") ||
    value.includes("ldf") ||
    value.includes("udf")
  ) {
    return politicsSources;
  }

  if (value.includes("cricket") || value.includes("ipl") || value.includes("t20")) {
    return sportsSources;
  }

  if (
    value.includes("budget") ||
    value.includes("stock") ||
    value.includes("gdp") ||
    value.includes("inflation")
  ) {
    return businessSources;
  }

  return politicsSources;
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function normalizeSource(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractSource(block: string, title: string) {
  const sourceMatch = block.match(/<source[^>]*>(.*?)<\/source>/);
  const sourceFromTag = normalizeSource(decodeXml(sourceMatch?.[1] ?? ""));

  if (sourceFromTag) {
    return sourceFromTag;
  }

  const titleParts = title.split(" - ");
  return normalizeSource(titleParts[titleParts.length - 1] ?? "");
}

function stripSourceFromTitle(title: string, source: string) {
  if (!source) {
    return title;
  }

  const suffix = ` - ${source}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title;
}

function stripQuestionSyntax(title: string) {
  return title
    .replace(/^will\s+/i, "")
    .replace(/\?$/, "")
    .replace(/\bResolve\b/gi, "")
    .trim();
}

function extractKeywords(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 2 &&
        !["will", "with", "from", "that", "this", "have", "into", "than", "about", "election"].includes(token)
    );
}

function buildRelevanceScore(title: string, keywords: string[], publishedAt: string | null) {
  const normalizedTitle = title.toLowerCase();
  const overlap = keywords.reduce((score, keyword) => {
    return normalizedTitle.includes(keyword) ? score + 1 : score;
  }, 0);

  const publishedTime = publishedAt ? new Date(publishedAt).getTime() : 0;
  const agePenalty = publishedTime ? Math.min(Math.floor((Date.now() - publishedTime) / 86400000), 365) : 365;

  return overlap * 20 - agePenalty;
}

function isRecentEnough(publishedAt: string | null) {
  if (!publishedAt) {
    return true;
  }

  const publishedTime = new Date(publishedAt).getTime();

  if (Number.isNaN(publishedTime)) {
    return false;
  }

  return Date.now() - publishedTime <= 365 * 24 * 60 * 60 * 1000;
}

function parseNewsFeed(xml: string, allowedSources: readonly string[], keywords: string[]) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  const results: Array<NewsItem & { score: number }> = [];

  for (const item of items) {
    const block = item[1];
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = block.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);

    const rawTitle = decodeXml(titleMatch?.[1] ?? titleMatch?.[2] ?? "");
    const link = decodeXml(linkMatch?.[1] ?? "");
    const source = extractSource(block, rawTitle);
    const title = stripSourceFromTitle(rawTitle, source);
    const publishedAt = pubDateMatch?.[1] ?? null;

    if (!title || !link || !source) {
      continue;
    }

    if (!allowedSources.includes(source as (typeof allowedSources)[number])) {
      continue;
    }

    if (!isRecentEnough(publishedAt)) {
      continue;
    }

    results.push({
      title,
      link,
      source,
      publishedAt,
      score: buildRelevanceScore(title, keywords, publishedAt)
    });
  }

  return results
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (
        new Date(right.publishedAt ?? 0).getTime() -
        new Date(left.publishedAt ?? 0).getTime()
      );
    })
    .slice(0, 6)
    .map(({ score: _score, ...item }) => item);
}

export async function getCuratedNewsForQuestion(slug: string) {
  const question = await getQuestionBySlug(slug);

  if (!question || question.status === "draft") {
    return [];
  }

  const allowedSources = getSourceAllowlist(question.category, question.title);
  const query = `${stripQuestionSyntax(question.title)} ${question.category} India`;
  const keywords = extractKeywords(`${question.title} ${question.category}`);
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=en-IN&gl=IN&ceid=IN:en`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      signal: controller.signal
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return parseNewsFeed(xml, allowedSources, keywords);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
