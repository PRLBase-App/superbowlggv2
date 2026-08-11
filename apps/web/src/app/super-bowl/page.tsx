import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { SUPER_BOWLS, superBowlChampionships } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl — Predictions, Odds, History & Winners",
  description: "The Super Bowl authority hub: predictions, odds, schedule, complete history, winners, MVPs, records and venues.",
};

export const revalidate = 3600;

export default async function SuperBowlHubPage() {
  const latest = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;
  const champs = superBowlChampionships();

  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Super Bowl Hub",
    about: { "@type": "SportsEvent", name: "Super Bowl" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl" }]} />
      <SeoHubShell
        title="Super Bowl"
        description="Everything Super Bowl: the 2027 matchup, odds and predictions, plus the complete history of winners, MVPs, records, locations and stadiums."
        links={[
          { href: "/super-bowl/predictions", label: "Predictions" },
          { href: "/super-bowl/odds", label: "Odds" },
          { href: "/super-bowl/schedule", label: "Schedule" },
          { href: "/super-bowl/history", label: "History" },
          { href: "/super-bowl/winners", label: "Winners" },
          { href: "/super-bowl/mvp", label: "MVP" },
          { href: "/super-bowl/records", label: "Records" },
          { href: "/super-bowl/locations", label: "Locations" },
          { href: "/super-bowl/stadiums", label: "Stadiums" },
        ]}
      >
        <section className="card yardlines relative overflow-hidden">
          <Badge_tone />
          <h2 className="font-display text-2xl font-semibold text-brand-text">Super Bowl {latest.number} — {latest.year}</h2>
          <p className="mt-2 text-brand-muted">
            {latest.winner === "TBD" ? "The matchup will be decided in the playoffs." : `${latest.winner} vs ${latest.loser}`} · {latest.venue}, {latest.city}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/super-bowl/predictions" className="btn-primary">Super Bowl Predictions</Link>
            <Link href="/super-bowl/odds" className="btn-secondary">Super Bowl Odds</Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="font-display mb-3 text-xl font-semibold">Recent Super Bowls</h2>
            <div className="space-y-2">
              {SUPER_BOWLS.slice(-6, -1).reverse().map((sb) => (
                <Card key={sb.number} className="flex items-center justify-between !p-3 text-sm">
                  <div>
                    <p className="font-semibold text-brand-text">SB {sb.number} ({sb.year})</p>
                    <p className="text-xs text-brand-muted">{sb.winner} def. {sb.loser} {sb.score}</p>
                  </div>
                  <span className="text-xs text-brand-muted">{sb.mvp}</span>
                </Card>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-display mb-3 text-xl font-semibold">Most championships</h2>
            <div className="space-y-2">
              {champs.slice(0, 10).map((c, i) => (
                <Card key={c.team} className="flex items-center justify-between !p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-display w-6 font-bold text-brand-muted">{i + 1}</span>
                    <span className="font-medium text-brand-text">{c.team}</span>
                  </div>
                  <span className="badge bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">{c.count}×</span>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </SeoHubShell>
    </>
  );
}

function Badge_tone() {
  return <span className="badge mb-3 bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/30">Super Bowl {SUPER_BOWLS[SUPER_BOWLS.length - 1]!.year}</span>;
}
