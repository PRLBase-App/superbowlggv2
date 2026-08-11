import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const NFL_LINKS = [
  { href: "/nfl", label: "2026 NFL hub" },
  { href: "/nfl/news", label: "Latest NFL reporting" },
  { href: "/nfl/schedule", label: "Full season schedule" },
  { href: "/nfl/scores", label: "Game scores" },
  { href: "/nfl/standings", label: "AFC and NFC standings" },
  { href: "/nfl/stats", label: "Player stat leaders" },
  { href: "/nfl/teams", label: "All 32 team pages" },
];

const COMMUNITY_LINKS = [
  { href: "/games", label: "Upcoming game center" },
  { href: "/predictions", label: "Community prediction feed" },
  { href: "/leaderboard", label: "Predictor rankings" },
  { href: "/how-it-works", label: "Prediction guide" },
  { href: "/super-bowl", label: "Super Bowl LXI guide" },
];

const LEGAL = [
  { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
  { href: "/responsible-gaming", label: "Responsible gaming" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-brand-nav text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Superbowl.gg home">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
                <Image src="/logo.svg" alt="" width={44} height={44} className="h-full w-full object-contain" />
              </span>
              <span className="text-[21px] font-black leading-none tracking-[-0.055em] text-white">
                superbowl<span className="text-[#4f7dff]">.gg</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
              A community platform for NFL predictions, real schedules, provider-sourced statistics and the road to Super Bowl LXI in 2027.
            </p>
            <a href="https://x.com/superbowldotgg" target="_blank" rel="me noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/14" aria-label="Follow Superbowl.gg on X">
              <XLogo /> Follow @superbowldotgg <ExternalLink className="h-3.5 w-3.5 text-white/50" />
            </a>
          </div>
          <nav aria-label="NFL resources">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/45">NFL resources</p>
            {NFL_LINKS.map((link) => <Link key={link.href} href={link.href} className="block py-1.5 text-sm text-white/65 transition hover:text-white">{link.label}</Link>)}
          </nav>
          <nav aria-label="Community resources">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Community</p>
            {COMMUNITY_LINKS.map((link) => <Link key={link.href} href={link.href} className="block py-1.5 text-sm text-white/65 transition hover:text-white">{link.label}</Link>)}
          </nav>
          <nav aria-label="Policies">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Policies</p>
            {LEGAL.map((link) => <Link key={link.href} href={link.href} className="block py-1.5 text-sm text-white/65 transition hover:text-white">{link.label}</Link>)}
          </nav>
        </div>

        <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-white/45 lg:grid-cols-2">
          <p>
            Sports data is provided by <a href="https://github.com/nflverse/nflverse-data" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white">nflverse</a> and other identified providers. ESPN headlines are displayed from ESPN&apos;s syndicated NFL RSS feed and link to the original reporting.
          </p>
          <p className="lg:text-right">
            Superbowl.gg is not affiliated with, endorsed by or sponsored by the NFL, its teams or ESPN. Team marks identify their respective organizations. No real-money wagers are accepted.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">© {new Date().getFullYear()} Superbowl.gg. Community predictions are entertainment. 21+ where applicable.</p>
      </div>
    </footer>
  );
}
