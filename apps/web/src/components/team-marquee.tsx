import Image from "next/image";
import Link from "next/link";

type MarqueeTeam = { id: string; slug: string; name: string; abbreviation: string; logoUrl: string | null };

function TeamStrip({ teams, duplicate = false }: { teams: MarqueeTeam[]; duplicate?: boolean }) {
  return (
    <div className="flex items-center gap-3 pr-3" aria-hidden={duplicate || undefined}>
      {teams.map((team) => duplicate ? (
        <div key={`duplicate-${team.id}`} className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-white p-3 shadow-sm">
          {team.logoUrl ? <Image src={team.logoUrl} alt="" width={52} height={52} className="h-11 w-11 object-contain" /> : <span className="font-display text-sm text-brand-muted">{team.abbreviation}</span>}
        </div>
      ) : (
        <Link key={team.id} href={`/nfl/teams/${team.slug}`} className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/40" aria-label={`Open ${team.name} team page`}>
          {team.logoUrl ? <Image src={team.logoUrl} alt={`${team.name} logo`} width={52} height={52} className="h-11 w-11 object-contain" /> : <span className="font-display text-sm text-brand-muted">{team.abbreviation}</span>}
        </Link>
      ))}
    </div>
  );
}

export function TeamMarquee({ teams }: { teams: MarqueeTeam[] }) {
  if (!teams.length) return null;
  return (
    <section aria-label="All NFL teams" className="overflow-hidden py-1">
      <div className="logo-marquee flex"><TeamStrip teams={teams} /><TeamStrip teams={teams} duplicate /></div>
    </section>
  );
}
