import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, Newspaper, ShieldCheck, Trophy, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { getAffiliateOffers, getGames, getLeaderboard, getMarketplaceOffers, getNews, getPredictionFeed, getSeason, getStandings, getTeams } from "@/lib/data";
import { Badge, Card, EmptyState, SectionTitle, TeamBadge } from "@/components/ui";
import { NewsCard } from "@/components/news-card";
import { TeamMarquee } from "@/components/team-marquee";
import { gameStatusLabel, kickoffDisplay } from "@sbgg/core";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";
import { currentNflSeasonYear, gameWeekLabel, gameWeekTitle } from "@/lib/season";
import { getPublishedArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/article-card";

export const metadata: Metadata = {
  title: "NFL Predictions, News, Stats & Super Bowl Odds",
  description: "Follow the 2026 NFL season with real schedules, scores, stats and attributed news, then publish community predictions on the road to Super Bowl LXI in 2027.",
};

export const revalidate = 60;

const FAQ = [
  {
    question: "What NFL season does this site currently cover?",
    answer: "The active product covers the 2026 NFL season, which begins in 2026 and concludes with Super Bowl LXI in February 2027. Older seasons may appear only in clearly labeled historical sections.",
  },
  {
    question: "Does Superbowl.gg accept real-money bets?",
    answer: "No. The platform records community predictions with virtual coins, confidence levels and transparent results. Sportsbook links, when present, lead to independent partners and are marked as affiliate offers.",
  },
  {
    question: "Where do schedules, scores and player statistics come from?",
    answer: "Current NFL schedules and statistical updates are synchronized from nflverse. Odds come from a configured odds provider, while NFL headlines come from ESPN's syndicated feed and always link to the original report.",
  },
  {
    question: "When will 2026 player leaderboards appear?",
    answer: "Regular-season leaderboards populate after genuine 2026 games produce player statistics. Before Week 1, the stats page explains that no current regular-season sample exists instead of showing an older season as current.",
  },
];

export default async function HomePage() {
  const currentYear = currentNflSeasonYear();
  const [user, games, liveGames, trending, leaderboard, offers, affiliateOffers, standings, season, teams, news, editorial] = await Promise.all([
    getSessionUser(),
    getGames({ status: "SCHEDULED", limit: 8 }),
    getGames({ status: "LIVE", limit: 4 }),
    getPredictionFeed({ filter: "trending", limit: 6 }),
    getLeaderboard("allTime", 5),
    getMarketplaceOffers(),
    getAffiliateOffers(),
    getStandings(),
    getSeason(),
    getTeams(),
    getNews(5),
    getPublishedArticles({ limit: 3 }),
  ]);

  const today = new Date().toDateString();
  const todayGames = games.filter((game) => game.scheduledAt.toDateString() === today);
  const showGames = liveGames.length ? liveGames : todayGames.length ? todayGames : games;
  const nextSuperBowl = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };

  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="reveal-up relative overflow-hidden rounded-[28px] bg-brand-nav text-white shadow-[0_24px_70px_rgba(19,21,32,0.22)]">
        <Image src="https://r2.thesportsdb.com/images/media/league/fanart/mle56m1631264965.jpg" alt="NFL field and league shield" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center opacity-55 lg:object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#131520] via-[#131520]/95 to-[#131520]/25" />
        <div className="relative grid min-h-[520px] items-center lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-14 sm:px-10 lg:px-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#9dd3ff] backdrop-blur">
              <ShieldCheck className="h-4 w-4" /> {currentYear} NFL season · Super Bowl LXI 2027
            </span>
            {user ? <p className="mt-5 text-sm text-white/60">Welcome back, {user.name?.split(" ")[0] ?? user.username}.</p> : null}
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.04] text-white sm:text-6xl">
              Follow the season.<br />Share your read.<br /><span className="text-[#65b7ff]">Prove your football IQ.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Real NFL schedules, attributed news, provider-sourced statistics and community predictions come together in one season-long football platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/predict" className="btn-primary">Make a quick pick <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/predictions" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16">
                View community predictions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div>
        <div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-muted">Explore all 32 teams</p><Link href="/nfl/teams" className="text-sm font-semibold text-brand-primary hover:underline">Browse the complete team directory</Link></div>
        <TeamMarquee teams={teams} />
      </div>

      <section>
        <SectionTitle sub="Fresh, attributed reporting with direct links to the original publisher">
          <Link href="/nfl/news" className="text-brand-text hover:text-brand-primary">Latest NFL News</Link>
        </SectionTitle>
        {news.length ? (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <NewsCard item={news[0]!} featured />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{news.slice(1, 3).map((item) => <NewsCard key={item.id} item={item} />)}</div>
          </div>
        ) : <EmptyState title="NFL news is synchronizing" body="Real ESPN headlines will appear after the first successful RSS update." />}
        <div className="mt-4 text-right"><Link href="/nfl/news" className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline">Read the full NFL news board <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary"><BookOpenCheck className="h-4 w-4" /> Superbowl.gg Editorial</p><h2 className="mt-2 font-display text-2xl font-semibold text-brand-text sm:text-3xl"><Link href="/blog" className="hover:text-brand-primary">Original NFL analysis</Link></h2><p className="mt-1 text-sm text-brand-muted">Source-backed guides and research written for this site—not syndicated headlines.</p></div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline">Open the full research library <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {editorial.articles.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{editorial.articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <EmptyState title="Editorial library is preparing" body="Original articles will appear after the production content migration completes." />}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SectionTitle sub="Real matchups and provider updates">{liveGames.length ? "Games in progress" : todayGames.length ? "Today's NFL games" : "Next on the 2026 schedule"}</SectionTitle>
          {showGames.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{showGames.slice(0, 6).map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className="card card-hover group !p-0">
              <div className="flex items-center justify-between border-b border-brand-border px-4 py-3"><Badge tone={game.status === "LIVE" ? "red" : game.seasonType === "PRE" ? "indigo" : "blue"}>{gameStatusLabel(game.status)}</Badge><span className="text-xs font-semibold text-brand-muted">{gameWeekTitle(game.seasonType, game.week)}</span></div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between"><TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} logoUrl={game.awayTeam.logoUrl} name={game.awayTeam.shortName} size="sm" /><span className="scoreboard-num text-lg">{game.status === "LIVE" || game.status === "FINAL" ? game.awayScore : "—"}</span></div>
                <div className="flex items-center justify-between"><TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} logoUrl={game.homeTeam.logoUrl} name={game.homeTeam.shortName} size="sm" /><span className="scoreboard-num text-lg">{game.status === "LIVE" || game.status === "FINAL" ? game.homeScore : "—"}</span></div>
                <p className="border-t border-brand-border pt-3 text-xs text-brand-muted">{kickoffDisplay(game.scheduledAt)}</p>
              </div>
            </Link>
          ))}</div> : <EmptyState title="The 2026 schedule is synchronizing" body="No historical game is substituted while current provider data is unavailable." />}
        </div>
        <aside className="card h-fit overflow-hidden !p-0 lg:sticky lg:top-28">
          <div className="bg-[#0d393a] p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">Prediction coupon</p><h2 className="mt-2 font-display text-2xl font-semibold">Build your next pick</h2><p className="mt-2 text-sm leading-6 text-white/65">Choose a real scheduled game, select an available market and publish your reasoning before kickoff.</p></div>
          <div className="space-y-4 p-5">{["Select a verified matchup", "Choose moneyline, spread or total", "Set confidence and explain your read"].map((step, index) => <div key={step} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-xs font-bold text-brand-primary">{index + 1}</span><p className="text-sm font-medium text-brand-text">{step}</p></div>)}<Link href="/predict" className="btn-primary mt-2 w-full">Open the pick board</Link><p className="text-center text-[11px] text-brand-muted">Virtual coins only. Superbowl.gg does not accept wagers.</p></div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle sub="Community analysis ranked by engagement and recency"><Link href="/predictions" className="text-brand-text hover:text-brand-primary">Trending predictions</Link></SectionTitle>
          <div className="space-y-3">{trending.slice(0, 4).map((prediction) => (
            <Link key={prediction.id} href={`/predictions/${prediction.id}`} className="card card-hover flex items-center justify-between gap-4">
              <div><p className="text-sm font-bold text-brand-text">@{prediction.user.profile?.username ?? "predictor"}</p><p className="mt-1 text-xs text-brand-muted">{prediction.game.awayTeam.abbreviation} at {prediction.game.homeTeam.abbreviation} · {gameWeekLabel(prediction.game.seasonType, prediction.game.week)}</p><p className="mt-2 text-sm font-semibold text-brand-primary">{prediction.marketType}: {prediction.selection}{prediction.line != null ? ` (${prediction.line})` : ""}</p></div>
              <div className="text-right"><Badge tone="blue">{prediction.confidence}</Badge><p className="mt-2 text-xs text-brand-muted">Odds {prediction.oddsAtCreation}</p></div>
            </Link>
          ))}{!trending.length ? <EmptyState title="No 2026 predictions yet" body="The feed opens as soon as current-season games are available." action={{ href: "/predict", label: "Open the pick board" }} /> : null}</div>
        </div>
        <div>
          <SectionTitle sub="Transparent records from settled community predictions"><Link href="/leaderboard" className="text-brand-text hover:text-brand-primary">Top predictors</Link></SectionTitle>
          <div className="space-y-2">{leaderboard.map((row, index) => (
            <Link key={row.user.id} href={`/users/${row.user.profile?.username ?? row.user.email}`} className="card card-hover flex items-center justify-between">
              <div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg font-bold ${index === 0 ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-primary/10 text-brand-primary"}`}>{index + 1}</span><div><p className="text-sm font-bold text-brand-text">{row.user.profile?.displayName ?? row.user.name}</p><p className="text-xs text-brand-muted">@{row.user.profile?.username ?? "predictor"}</p></div></div>
              <div className="text-right"><p className="scoreboard-num font-bold text-brand-text">{Math.round(row.accuracy * 100)}%</p><p className="text-xs text-brand-muted">{row.settled} settled</p></div>
            </Link>
          ))}{!leaderboard.length ? <EmptyState title="The leaderboard awaits its first qualifiers" body="Minimum sample rules prevent misleading rankings." /> : null}</div>
        </div>
      </section>

      <section>
        <SectionTitle sub="Current-season records only"><Link href="/nfl/standings" className="text-brand-text hover:text-brand-primary">{currentYear} NFL standings snapshot</Link></SectionTitle>
        {standings.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{standings.slice(0, 8).map((standing) => (
          <Card key={standing.id} hover><TeamBadge abbr={standing.team.abbreviation} color={standing.team.primaryColor} logoUrl={standing.team.logoUrl} size="sm" name={standing.team.shortName} link={`/nfl/teams/${standing.team.slug}`} /><div className="mt-3 flex items-center justify-between text-sm"><span className="font-bold text-brand-text">{standing.wins}-{standing.losses}{standing.ties ? `-${standing.ties}` : ""}</span><span className="rounded-full bg-brand-success/10 px-2 py-1 text-xs font-bold text-brand-success">{standing.streak}</span></div></Card>
        ))}</div> : <EmptyState title="2026 standings begin at 0-0" body={season ? "Standings will update after completed regular-season games." : "The current season is being synchronized from nflverse."} />}
      </section>

      <section className="relative overflow-hidden rounded-[28px] bg-[#0d393a] text-white shadow-xl">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 sm:p-10"><Badge tone="gold">Super Bowl {nextSuperBowl.number} · {nextSuperBowl.year}</Badge><h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">The road to Super Bowl LXI runs through the entire 2026 season.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Follow every division race and playoff step toward {nextSuperBowl.venue} in {nextSuperBowl.city}. Matchup participants remain undetermined until the conference championships, and betting lines appear only when a configured provider publishes a verifiable market.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/super-bowl" className="btn-primary">Explore the Super Bowl LXI hub</Link><Link href="/super-bowl/history" className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Review championship history</Link></div></div>
          <div className="relative min-h-64"><Image src="https://r2.thesportsdb.com/images/media/league/fanart/il1x7f1631264828.jpg" alt="NFL stadium under the lights" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-[#0d393a] to-transparent" /></div>
        </div>
      </section>

      <section className="grid gap-8 rounded-[28px] border border-brand-border bg-brand-surface p-7 shadow-sm lg:grid-cols-2 lg:p-10">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">A season-long football platform</p><h2 className="mt-3 font-display text-3xl font-bold text-brand-text">One useful home for the 2026 NFL season</h2><div className="mt-5 space-y-4 text-[15px] leading-7 text-brand-muted"><p>Football coverage becomes fragmented quickly. One site has the schedule, another has a headline, a third shows an odds snapshot, and community opinions disappear into fast-moving social feeds. This platform connects those pieces around the games themselves, so every prediction has a real matchup, kickoff time and settlement source behind it.</p><p>The current experience follows the official NFL convention: the season that starts in August and September 2026 is the 2026 NFL season. Its postseason concludes in early 2027, culminating with Super Bowl LXI. Historical results still matter for context, but they are labeled as archives and never presented as if they were current standings or current player production.</p><p>Every public prediction creates a track record. Wins, losses, pushes, odds at publication and sample size remain visible, which makes the leaderboard more meaningful than a collection of unsupported hot takes. Minimum sample thresholds also prevent one lucky result from outranking a predictor with a sustained record.</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">{[
          { icon: Newspaper, title: "Attributed NFL news", body: "Read current headlines and summaries from the syndicated ESPN feed, then continue directly to the original reporting." },
          { icon: BarChart3, title: "Season-correct statistics", body: "Player leaders aggregate genuine 2026 game data. Empty preseason tables stay empty until real regular-season production exists." },
          { icon: Zap, title: "Provider-backed game center", body: "Schedules, kickoff times, scores and team identities synchronize from real data sources rather than generated fixtures." },
          { icon: Trophy, title: "Transparent competition", body: "Community standings use settled outcomes, published odds and minimum samples so rankings can be inspected and understood." },
        ].map((feature) => <Card key={feature.title} className="!p-5"><feature.icon className="h-6 w-6 text-brand-primary" /><h3 className="mt-4 font-display text-lg font-semibold normal-case text-brand-text">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-brand-muted">{feature.body}</p></Card>)}</div>
      </section>

      <section>
        <SectionTitle sub="A real workflow from kickoff selection to an accountable record">How community predictions work</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">{[
          { number: "01", title: "Choose a scheduled game", body: "Open the 2026 game line and select a matchup that exists in the synchronized NFL schedule. Markets are available only when the required game and odds data exist." },
          { number: "02", title: "Publish a clear position", body: "Choose a supported market, record the line and odds available at that moment, set your confidence and explain the football reasoning behind the selection." },
          { number: "03", title: "Build a verifiable record", body: "After a provider-confirmed final score arrives, the settlement worker grades supported selections. The result then contributes to profiles, rewards and qualifying leaderboards." },
        ].map((step) => <Card key={step.number} className="relative overflow-hidden !p-6"><span className="font-display text-5xl font-bold text-brand-primary/10">{step.number}</span><h3 className="-mt-3 font-display text-xl font-semibold normal-case text-brand-text">{step.title}</h3><p className="mt-3 text-sm leading-7 text-brand-muted">{step.body}</p></Card>)}</div>
      </section>

      {(offers.length || affiliateOffers.length) ? <section><SectionTitle sub="Clearly marked partner and marketplace inventory">Rewards and partner offers</SectionTitle><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{offers.slice(0, 3).map((offer) => <Link key={offer.id} href={`/marketplace/${offer.slug}`} className="card card-hover"><Badge tone="gold">Virtual coin reward</Badge><p className="mt-3 font-bold text-brand-text">{offer.title}</p><p className="mt-1 text-sm leading-6 text-brand-muted">{offer.description}</p></Link>)}{affiliateOffers.slice(0, 3).map((offer) => <Link key={offer.id} href={`/go/${offer.slug}`} className="card card-hover"><Badge tone="blue">Sponsored partner</Badge><p className="mt-3 font-bold text-brand-text">{offer.title}</p><p className="mt-1 text-sm leading-6 text-brand-muted">{offer.description}</p></Link>)}</div></section> : null}

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Useful answers</p><h2 className="mt-3 font-display text-3xl font-bold text-brand-text">About the season, data and predictions</h2><p className="mt-4 text-sm leading-7 text-brand-muted">These answers explain how current-year coverage works and where the platform draws a firm line between community opinion and verified sports data.</p></div>
        <div className="space-y-3">{FAQ.map((item) => <details key={item.question} className="group rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm"><summary className="cursor-pointer list-none font-display text-lg font-semibold normal-case text-brand-text"><span className="flex items-center justify-between gap-4">{item.question}<span className="text-brand-primary transition group-open:rotate-45">+</span></span></summary><p className="mt-3 text-sm leading-7 text-brand-muted">{item.answer}</p></details>)}</div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-brand-border pt-6 text-xs text-brand-muted"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-success" /> No fabricated schedules or statistics</span><span>Sports data attribution: nflverse</span><span>News attribution: ESPN RSS</span></div>
    </div>
  );
}
