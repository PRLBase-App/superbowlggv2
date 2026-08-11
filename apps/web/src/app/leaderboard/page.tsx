import type { Metadata } from "next";
import { LeaderboardBoard } from "@/components/leaderboard-board";

export const metadata: Metadata = {
  title: "NFL Prediction Leaderboard",
  description: "Top NFL predictors by points, accuracy, ROI and units across weekly, monthly, season and all-time rankings.",
  alternates: { canonical: "/leaderboard/all-time" },
};

export const revalidate = 60;

export default function LeaderboardPage() {
  return <LeaderboardBoard period="allTime" />;
}
