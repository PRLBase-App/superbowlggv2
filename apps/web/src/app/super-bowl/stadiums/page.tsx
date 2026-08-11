import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl Stadiums",
  description: "Every stadium that has hosted the Super Bowl.",
};

export const revalidate = 3600;

export default async function SuperBowlStadiumsPage() {
  const stadiums = new Map<string, { count: number; city: string; last: number }>();
  for (const sb of SUPER_BOWLS) {
    const cur = stadiums.get(sb.venue) ?? { count: 0, city: sb.city, last: sb.number };
    cur.count++;
    cur.last = sb.number;
    stadiums.set(sb.venue, cur);
  }
  const rows = [...stadiums.entries()].sort((a, b) => b[1].count - a[1].count);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Stadiums" }]} />
      <SeoHubShell title="Super Bowl Stadiums" description="The venues that have hosted the Super Bowl, most recent first.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([venue, info]) => (
            <Card key={venue}>
              <p className="font-semibold text-brand-text">{venue}</p>
              <p className="mt-1 text-xs text-brand-muted">{info.city} · hosted {info.count}× · last SB {info.last}</p>
            </Card>
          ))}
        </div>
      </SeoHubShell>
    </>
  );
}
