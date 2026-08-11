import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl Locations & Host Cities",
  description: "Every city that has hosted the Super Bowl.",
};

export const revalidate = 3600;

export default async function SuperBowlLocationsPage() {
  const cities = new Map<string, number>();
  for (const sb of SUPER_BOWLS) cities.set(sb.city, (cities.get(sb.city) ?? 0) + 1);
  const rows = [...cities.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Locations" }]} />
      <SeoHubShell title="Super Bowl Locations" description="Host cities for every Super Bowl.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([city, count]) => (
            <Card key={city} className="flex items-center justify-between">
              <span className="font-medium text-brand-text">{city}</span>
              <span className="badge bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/30">{count}×</span>
            </Card>
          ))}
        </div>
        <p className="text-sm text-brand-muted">Stadium details on the <a className="text-brand-primary hover:underline" href="/super-bowl/stadiums">stadiums page</a>.</p>
      </SeoHubShell>
    </>
  );
}
