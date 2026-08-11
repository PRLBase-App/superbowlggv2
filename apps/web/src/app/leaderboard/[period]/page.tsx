import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeaderboardBoard, type LeaderboardPeriod } from "@/components/leaderboard-board";

const periodMap: Record<string, { value: LeaderboardPeriod; label: string }> = {
  weekly: { value: "weekly", label: "Weekly" },
  monthly: { value: "monthly", label: "Monthly" },
  season: { value: "season", label: "Season" },
  "all-time": { value: "allTime", label: "All-Time" },
};

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }): Promise<Metadata> {
  const { period } = await params;
  const entry = periodMap[period];
  if (!entry) return { title: "Leaderboard not found", robots: { index: false, follow: false } };
  return {
    title: `${entry.label} NFL Prediction Leaderboard`,
    description: `${entry.label} NFL predictor rankings based on genuine settled picks, accuracy, ROI and virtual units.`,
    alternates: { canonical: `/leaderboard/${period}` },
  };
}

export const dynamic = "force-dynamic";

export default async function LeaderboardPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  const entry = periodMap[period];
  if (!entry) notFound();
  return <LeaderboardBoard period={entry.value} />;
}
