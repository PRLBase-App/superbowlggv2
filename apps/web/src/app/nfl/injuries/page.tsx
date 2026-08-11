import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card, Badge } from "@/components/ui";
import { getInjuries, getGames, getSeason } from "@/lib/data";
import { isHistoricalNflSeason, nflSeasonLabel } from "@/lib/season";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeason();
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const historical = season ? isHistoricalNflSeason(season.year) : false;
  return {
    title: `${label} Injuries — Injury Report`,
    description: historical ? `Archived injury observations for the ${season?.year} NFL provider season.` : "NFL injury report: who's out, questionable or doubtful for the upcoming slate.",
  };
}

export const revalidate = 120;

export default async function NflInjuriesPage() {
  const [injuries, upcoming, season] = await Promise.all([getInjuries(), getGames({ status: "SCHEDULED", limit: 4 }), getSeason()]);
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const historical = season ? isHistoricalNflSeason(season.year) : false;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Injuries" }]} />
      <SeoHubShell title={`${label} Injury Report`} description={historical ? "Archived injury observations returned for the configured provider season." : "Current NFL injuries from verified team reporting. Check status before making your predictions."}>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {injuries.map((i) => (
            <Card key={i.id} className="!p-3">
              <div className="flex items-center justify-between">
                <Link href={`/nfl/players/${i.player.slug}`} className="text-sm font-semibold text-brand-text hover:text-brand-primary">
                  {i.player.name}
                </Link>
                <Badge tone={i.status === "OUT" ? "red" : i.status === "QUESTIONABLE" ? "gold" : "slate"}>{i.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-brand-muted">{i.player.team?.abbreviation} · {i.bodyPart || "—"}</p>
            </Card>
          ))}
        </div>
        {upcoming.length ? (
          <p className="mt-6 text-sm text-brand-muted">
            Check how injuries affect the next slate:{" "}
            {upcoming.map((g, i) => (
              <span key={g.id}>
                {i > 0 ? " · " : ""}
                <Link href={`/games/${g.id}`} className="text-brand-primary hover:underline">{g.awayTeam.abbreviation} @ {g.homeTeam.abbreviation}</Link>
              </span>
            ))}
          </p>
        ) : null}
      </SeoHubShell>
    </>
  );
}
