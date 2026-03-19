export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatRelativeClose(value: string) {
  const closeAt = new Date(value).getTime();
  const diffMs = closeAt - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours <= 0) {
    return "Closing now";
  }

  if (diffHours < 24) {
    return `Closes in ${diffHours}h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Closes in ${diffDays}d`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getYesPrice(probability: number | null | undefined) {
  const safeProbability = clamp(Math.round(probability ?? 50), 1, 99);
  return safeProbability;
}

export function getNoPrice(probability: number | null | undefined) {
  return 100 - getYesPrice(probability);
}

export function getEntryPrice(
  side: "agree" | "disagree",
  probability: number | null | undefined
) {
  return side === "agree" ? getYesPrice(probability) : getNoPrice(probability);
}

export function getPayoutMultiplier(price: number) {
  return (100 / clamp(price, 1, 99)).toFixed(2);
}

export function formatSignedDelta(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `${value}`;
  }

  return "0";
}

export function formatCoins(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
