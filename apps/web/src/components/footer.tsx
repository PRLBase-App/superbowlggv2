import Link from "next/link";

const SEO_LINKS = [
  { href: "/nfl", label: "NFL" },
  { href: "/nfl/schedule", label: "NFL Schedule" },
  { href: "/nfl/scores", label: "NFL Scores" },
  { href: "/nfl/standings", label: "NFL Standings" },
  { href: "/nfl/predictions", label: "NFL Predictions" },
  { href: "/nfl/odds", label: "NFL Odds" },
  { href: "/nfl/stats", label: "NFL Stats" },
  { href: "/nfl/teams", label: "Teams" },
  { href: "/nfl/injuries", label: "Injuries" },
  { href: "/super-bowl", label: "Super Bowl" },
  { href: "/super-bowl/history", label: "Super Bowl History" },
  { href: "/super-bowl/winners", label: "Super Bowl Winners" },
];

const LEGAL = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
  { href: "/responsible-gaming", label: "Responsible gaming" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-border bg-brand-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold text-brand-text">
              SUPERBOWL<span className="text-brand-primary">.GG</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-brand-muted">
              American football predictions, analytics and community. Predict NFL games, build your record, beat the crowd.
            </p>
            <p className="mt-4 text-xs text-brand-muted/70">
              Superbowl.gg does not accept sports bets. All coins are virtual. Sportsbook offers are affiliate links to partner sites.
            </p>
          </div>
          <nav aria-label="Footer SEO" className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {SEO_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-brand-muted transition-colors hover:text-brand-primary">
                {l.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Footer legal">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">Company</p>
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="block py-1 text-sm text-brand-muted transition-colors hover:text-brand-primary">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-brand-border pt-4 text-center text-xs text-brand-muted/70">
          © {new Date().getFullYear()} Superbowl.gg. Community predictions are entertainment, not financial advice. 21+ only where applicable.
        </p>
      </div>
    </footer>
  );
}
