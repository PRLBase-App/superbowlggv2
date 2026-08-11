import { prisma } from "@sbgg/db";
import { sitemapBaseUrl, sitemapUrlSet, type SitemapEntry } from "@/lib/sitemap-xml";

export const dynamic = "force-dynamic";

const publicPages: { path: string; frequency: SitemapEntry["changefreq"]; priority: number }[] = [
  { path: "/", frequency: "hourly", priority: 1 },
  { path: "/games", frequency: "hourly", priority: 0.9 },
  { path: "/predictions", frequency: "hourly", priority: 0.9 },
  { path: "/leaderboard/all-time", frequency: "daily", priority: 0.8 },
  { path: "/leaderboard/weekly", frequency: "daily", priority: 0.7 },
  { path: "/leaderboard/monthly", frequency: "daily", priority: 0.7 },
  { path: "/leaderboard/season", frequency: "daily", priority: 0.7 },
  { path: "/marketplace", frequency: "daily", priority: 0.5 },
  { path: "/achievements", frequency: "monthly", priority: 0.4 },
  { path: "/how-it-works", frequency: "monthly", priority: 0.4 },
  { path: "/blog", frequency: "daily", priority: 0.9 },
  { path: "/nfl", frequency: "hourly", priority: 0.9 },
  { path: "/nfl/news", frequency: "hourly", priority: 0.9 },
  { path: "/nfl/schedule", frequency: "hourly", priority: 0.8 },
  { path: "/nfl/scores", frequency: "hourly", priority: 0.8 },
  { path: "/nfl/standings", frequency: "daily", priority: 0.8 },
  { path: "/nfl/predictions", frequency: "hourly", priority: 0.9 },
  { path: "/nfl/odds", frequency: "hourly", priority: 0.8 },
  { path: "/nfl/stats", frequency: "daily", priority: 0.7 },
  { path: "/nfl/teams", frequency: "weekly", priority: 0.7 },
  { path: "/nfl/players", frequency: "weekly", priority: 0.6 },
  { path: "/nfl/injuries", frequency: "daily", priority: 0.7 },
  { path: "/nfl/playoffs", frequency: "daily", priority: 0.7 },
  { path: "/nfl/power-rankings", frequency: "weekly", priority: 0.6 },
  { path: "/affiliate-disclosure", frequency: "monthly", priority: 0.3 },
  { path: "/responsible-gaming", frequency: "monthly", priority: 0.3 },
  { path: "/privacy", frequency: "monthly", priority: 0.2 },
  { path: "/terms", frequency: "monthly", priority: 0.2 },
];

export async function GET() {
  const season = await prisma.season.findFirst({ where: { league: { slug: "NFL" } }, orderBy: [{ isCurrent: "desc" }, { year: "desc" }], select: { currentWeek: true } });
  const maxWeek = Math.min(22, Math.max(1, season?.currentWeek ?? 1));
  const weekEntries: SitemapEntry[] = Array.from({ length: maxWeek }, (_, index) => index + 1).flatMap((week) => [
    { loc: `${sitemapBaseUrl}/nfl/week/${week}`, changefreq: "daily", priority: 0.7 },
    { loc: `${sitemapBaseUrl}/nfl/week/${week}/predictions`, changefreq: "daily", priority: 0.7 },
  ]);
  return sitemapUrlSet([
    ...publicPages.map((page) => ({ loc: `${sitemapBaseUrl}${page.path}`, changefreq: page.frequency, priority: page.priority })),
    ...weekEntries,
  ]);
}
