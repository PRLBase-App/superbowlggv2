import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { TeamBadge } from "@/components/ui";
import { getTeams } from "@/lib/data";

export const metadata: Metadata = {
  title: "NFL Teams — Every Team Page",
  description: "All 32 NFL teams with schedules, stats, predictions and odds.",
};

export const revalidate = 3600;

export default async function NflTeamsPage() {
  const teams = await getTeams();
  const grouped: Record<string, typeof teams> = {};
  for (const t of teams) (grouped[`${t.conference} ${t.division}`] ??= []).push(t);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Teams" }]} />
      <SeoHubShell title="NFL Teams" description="All 32 NFL teams — schedules, standings context, players and community predictions.">
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(grouped).map(([key, rows]) => (
            <section key={key}>
              <h2 className="font-display mb-3 text-lg font-semibold text-brand-text">{key}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {rows.map((t) => (
                  <Link key={t.id} href={`/nfl/teams/${t.slug}`} className="card card-hover flex items-center gap-3">
                    <TeamBadge abbr={t.abbreviation} color={t.primaryColor} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{t.name}</p>
                      <p className="text-xs text-brand-muted">{t.stadium}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </SeoHubShell>
    </>
  );
}
