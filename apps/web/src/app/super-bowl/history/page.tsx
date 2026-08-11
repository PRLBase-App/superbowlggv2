import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl History — Every Game Since 1967",
  description: "Complete Super Bowl history: every game, score, MVP and venue from Super Bowl I to today.",
};

export const revalidate = 3600;

export default async function SuperBowlHistoryPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "History" }]} />
      <SeoHubShell title="Super Bowl History" description="Every Super Bowl from I (1967) to the present: winners, scores, MVPs and venues.">
        <div className="overflow-hidden rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="table-head px-4 py-2.5">SB</th>
                <th className="table-head px-4 py-2.5">Year</th>
                <th className="table-head px-4 py-2.5">Winner</th>
                <th className="table-head px-4 py-2.5">Score</th>
                <th className="table-head px-4 py-2.5">Loser</th>
                <th className="table-head hidden px-4 py-2.5 lg:table-cell">MVP</th>
                <th className="table-head hidden px-4 py-2.5 xl:table-cell">Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {[...SUPER_BOWLS].reverse().map((sb) => (
                <tr key={sb.number} className="hover:bg-brand-surface">
                  <td className="px-4 py-2 font-display font-bold text-brand-primary">{sb.number}</td>
                  <td className="px-4 py-2 text-brand-muted">{sb.year}</td>
                  <td className="px-4 py-2 font-semibold text-brand-text">{sb.winner}</td>
                  <td className="scoreboard-num px-4 py-2 text-brand-text">{sb.score}</td>
                  <td className="px-4 py-2 text-brand-muted">{sb.loser}</td>
                  <td className="hidden px-4 py-2 text-brand-muted lg:table-cell">{sb.mvp}</td>
                  <td className="hidden px-4 py-2 text-brand-muted xl:table-cell">{sb.venue}, {sb.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SeoHubShell>
    </>
  );
}
