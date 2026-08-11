export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatOdds(price: number): string {
  // American odds display (e.g. -110, +150)
  if (price >= 2) return `+${Math.round((price - 1) * 100)}`;
  return `${Math.round(-100 / (price - 1))}`;
}

export function decimalToAmerican(price: number): string {
  if (price <= 1) return `${price}`;
  if (price >= 2) return `+${Math.round((price - 1) * 100)}`;
  return `${Math.round(-100 / (price - 1))}`;
}

export function pct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatUnits(value: number): string {
  return value.toFixed(value % 1 === 0 ? 0 : 2);
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function kickoffDisplay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function gameStatusLabel(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "LIVE":
      return "Live";
    case "FINAL":
      return "Final";
    case "POSTPONED":
      return "Postponed";
    case "CANCELLED":
      return "Cancelled";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status;
  }
}

/** Deterministic trending score — recency + engagement + reputation. */
export function trendingScore(opts: {
  publishedAt: Date;
  views: number;
  likes: number;
  followers: number;
  confidenceWeight?: number;
}): number {
  const ageHours = Math.max((Date.now() - opts.publishedAt.getTime()) / 3_600_000, 0.05);
  const engagement = opts.views * 0.3 + opts.likes * 3 + opts.followers * 0.5;
  const recencyBoost = 1 / Math.pow(ageHours + 2, 1.2);
  return Math.round(engagement * recencyBoost * 1000) / 1000;
}
