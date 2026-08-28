import type { Metadata } from "next";
import Link from "next/link";
import { PickBoard } from "@/components/pick-board";
import { EmptyState, SectionTitle } from "@/components/ui";
import { getPickBoardGames } from "@/lib/prediction-data";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Make an NFL Prediction",
  description: "Choose a verified upcoming NFL matchup and publish a virtual prediction before kickoff.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function PredictPage({ searchParams }: { searchParams: Promise<{ game?: string; outcome?: string }> }) {
  const [{ game, outcome }, games, user] = await Promise.all([searchParams, getPickBoardGames(), getSessionUser()]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle sub="Provider-verified markets · picks lock at kickoff">Pick board</SectionTitle>
        <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-xs text-brand-muted">
          Virtual units have no cash value. Superbowl.gg does not accept wagers.
        </div>
      </div>
      {games.length ? (
        <PickBoard games={games} authenticated={Boolean(user)} initialGameId={game} initialOutcomeId={outcome} />
      ) : (
        <EmptyState title="The next pick board is loading" body="Upcoming games appear here as soon as the schedule and fresh provider odds are available." action={{ href: "/games", label: "Browse the schedule" }} />
      )}
      <p className="text-center text-sm text-brand-muted">Looking for the full schedule? <Link href="/games" className="font-semibold text-brand-primary hover:underline">Browse all games</Link>.</p>
    </div>
  );
}
