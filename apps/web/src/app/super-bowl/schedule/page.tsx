import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl Schedule — Date, Kickoff & Venue",
  description: "When and where the next Super Bowl is played.",
};

export const revalidate = 3600;

export default async function SuperBowlSchedulePage() {
  const latest = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Schedule" }]} />
      <SeoHubShell title="Super Bowl Schedule" description={`Super Bowl ${latest.number} (${latest.year}): date, kickoff and venue.`}>
        <Card className="yardlines">
          <p className="text-xs uppercase tracking-wide text-brand-muted">Next Super Bowl</p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-brand-text">Super Bowl {latest.number} — {latest.year}</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Date: <strong className="text-brand-text">{latest.scheduledDate ? new Date(`${latest.scheduledDate}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "To be announced"}</strong>. Venue: <strong className="text-brand-text">{latest.venue}</strong>, {latest.city}.
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            While you wait: <Link href="/games" className="text-brand-primary hover:underline">predict this week&apos;s games</Link> and climb the{" "}
            <Link href="/leaderboard" className="text-brand-primary hover:underline">leaderboard</Link>.
          </p>
        </Card>
      </SeoHubShell>
    </>
  );
}
