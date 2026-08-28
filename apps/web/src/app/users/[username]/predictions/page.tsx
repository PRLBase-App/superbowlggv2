import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, EmptyState, SectionTitle } from "@/components/ui";
import { getProfileByUsername } from "@/lib/data";
import { timeAgo } from "@sbgg/core";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "User not found", robots: { index: false, follow: false } };
  return {
    title: `@${profile.username} NFL Predictions & Pick History`,
    description: `${profile.displayName ?? profile.username}'s permanent public NFL prediction history and settled results.`,
    alternates: { canonical: `/users/${profile.username}/predictions` },
  };
}

export const revalidate = 30;

export default async function UserPredictionsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const predictions = profile.user.predictions;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/users/${profile.username}`} className="text-sm text-brand-primary hover:underline">← Back to @{profile.username}</Link>
        <SectionTitle sub="Permanent public pick history">{profile.displayName ?? profile.username}&apos;s predictions</SectionTitle>
      </div>
      {predictions.length === 0 ? (
        <EmptyState title="No public predictions yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {predictions.map((prediction) => (
            <Link key={prediction.id} href={`/predictions/${prediction.id}`} className="card card-hover">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-brand-muted">{prediction.game.awayTeam.abbreviation} @ {prediction.game.homeTeam.abbreviation}</span>
                <Badge tone={prediction.result === "WIN" ? "green" : prediction.result === "LOSS" ? "red" : prediction.result ? "slate" : "blue"}>
                  {prediction.result ?? prediction.status}
                </Badge>
              </div>
              <p className="mt-2 font-semibold text-brand-text">
                {prediction.marketType.replace("_", " ")} · {prediction.selection}{prediction.line != null ? ` ${prediction.line > 0 ? "+" : ""}${prediction.line}` : ""}
              </p>
              <p className="mt-1 text-xs text-brand-muted">{prediction.oddsAtCreation == null ? "Community line · no sportsbook odds" : `Decimal odds ${prediction.oddsAtCreation.toFixed(2)}`} · {timeAgo(prediction.publishedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
