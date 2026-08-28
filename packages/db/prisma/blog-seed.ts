export interface EditorialSeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  sourceLinks: { title: string; url: string }[];
}

export const editorialAuthor = {
  slug: "superbowl-gg-editorial",
  name: "Superbowl.gg Editorial",
  type: "ORGANIZATION",
  role: "NFL research and data desk",
  bio: "The Superbowl.gg editorial desk combines official NFL information, clearly attributed reporting and provider-backed data. Articles separate verified facts from interpretation, identify their sources and never present community predictions as guaranteed outcomes.",
  websiteUrl: "https://superbowl.gg/blog",
};

export const editorialSeedArticles: EditorialSeedArticle[] = [
  {
    slug: "2026-nfl-season-guide-schedule-playoffs-super-bowl-lxi",
    title: "2026 NFL Season Guide: Schedule, Playoffs and Super Bowl LXI",
    excerpt: "The verified dates, schedule format and postseason path for the 2026 NFL season, from August roster decisions to Super Bowl LXI in February 2027.",
    category: "Season Guide",
    tags: ["2026 NFL season", "NFL schedule", "Super Bowl LXI", "NFL playoffs"],
    featured: true,
    seoTitle: "2026 NFL Season Guide: Schedule, Playoffs & Super Bowl LXI",
    seoDescription: "A source-backed guide to the 2026 NFL schedule, key dates, playoff rounds and Super Bowl LXI at SoFi Stadium on February 14, 2027.",
    publishedAt: "2026-08-11T12:00:00.000Z",
    sourceLinks: [
      { title: "NFL Football Operations — 2026–2027 important dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
      { title: "NFL Football Operations — how the NFL schedule is made", url: "https://operations.nfl.com/calendar-events/nfl-schedule/making-the-schedule" },
      { title: "NFL.com — official 2026 schedule", url: "https://www.nfl.com/schedules/2026/by-team" },
    ],
    body: `The 2026 NFL season starts long before the first regular-season snap. Training camps, preseason games, the roster reduction and the first league-wide injury reports all shape the information available before Week 1. This guide keeps those stages separate and follows the official convention: this is the **2026 NFL season**, even though its postseason ends with Super Bowl LXI in February 2027.

## The format: 32 teams, 272 games and one bye per club

The NFL has 32 teams split between the AFC and NFC. Each conference contains four four-team divisions. Every club plays 17 regular-season games across an 18-week schedule and receives one bye week. That creates 272 regular-season matchups before the postseason.

The opponent formula is more structured than it may appear. A team plays its three division opponents twice, one full division from its own conference, one full division from the other conference, two same-conference opponents based on the previous season's standings and one interconference opponent determined by the rotating formula. Dates and broadcast windows are then assigned around travel, stadium availability, rest, competitive balance and television requirements.

That distinction matters when reading strength-of-schedule claims. The opponents are determined by formula; the order, travel sequence and amount of rest are products of the final schedule.

## Important dates before Week 1

The Pro Football Hall of Fame Game opened the 2026 preseason on August 6. The three main preseason weekends run from August 13 through August 29. Preseason results do not count toward regular-season standings, and Superbowl.gg keeps them separate from the current-season statistical leaderboards.

The next major deadline is August 30, when clubs must reduce their active rosters to 53 players. Waiver claims connected to that reduction are processed the following day, after which clubs may establish practice squads under the league's rules. Those transactions can change depth charts immediately, so a July projection should not be treated as a final Week 1 roster.

Official regular-season injury-report procedures begin during September 6–12. Practice participation and game-status designations arrive on schedules determined by the day of each game. A current injury page should therefore distinguish confirmed club reports from older camp updates or speculation.

## Kickoff Weekend is September 9–14

The regular season begins with a rare Wednesday opener on September 9. New England visits Seattle in a rematch of Super Bowl LX, giving the Seahawks an immediate start to their title defense. On September 10, San Francisco and the Los Angeles Rams play at the Melbourne Cricket Ground in the NFL's first regular-season game in Australia.

The remainder of Kickoff Weekend is scheduled for Sunday, September 13 and Monday, September 14. The complete [Superbowl.gg game center](/games) uses the synchronized schedule, so later flex decisions and provider corrections can be reflected without silently rewriting an article.

## A genuinely international regular season

The league's official 2026 schedule contains nine international games. In addition to Melbourne, the listed host cities include Rio de Janeiro, London, Paris, Madrid, Munich and Mexico City. Travel distance, time-zone adaptation and the location of a team's bye can become relevant context, but none of those factors automatically determines a result.

For analysis, the correct approach is to compare the same information for both clubs: days of rest, location of the previous game, kickoff body-clock time and the sequence after returning home. A single “international game” label is too broad to function as a prediction by itself.

## Weeks 16–18 can still change

Not every late-season kickoff is fixed in August. The official schedule identifies flexible windows in Weeks 16 and 17, while Week 18 dates, times and networks are selected after Week 17. That flexibility helps the league place games with playoff consequences into appropriate broadcast windows.

For that reason, calendar exports and old screenshots should not be treated as permanent sources. The live [NFL schedule](/nfl/schedule) is the better destination for an exact kickoff once the season reaches December.

Week 18 is scheduled for January 9–10, 2027. At that point, division titles, the three wild-card places in each conference and the two first-round byes will be settled through record and the league's published tiebreaking procedures.

## The road through the 2027 postseason

The official 2026–2027 football calendar lists the postseason rounds as follows:

- Wild Card Weekend: January 16–18, 2027
- Divisional Playoffs: January 23–24, 2027
- AFC and NFC Championship Games: January 31, 2027
- Super Bowl LXI: February 14, 2027

Super Bowl LXI will be played at SoFi Stadium in Inglewood, California. Its participants are not known before the conference championship games, and Superbowl.gg will not invent a matchup, score or point spread in advance. Current markets belong on the [Super Bowl odds page](/super-bowl/odds) only after a configured provider supplies a verifiable timestamped market.

## How to use this guide during the season

Use this page for the stable structure and official calendar. Use live pages for information that changes: [scores](/nfl/scores), [standings](/nfl/standings), [injuries](/nfl/injuries), [statistics](/nfl/stats) and [the playoff picture](/nfl/playoffs). That separation keeps an evergreen guide useful without pretending that an August snapshot is current in December.

The central principle is simple: schedule facts come from the league and synchronized providers; predictions remain labeled opinions. When an official time, roster status or market changes, the live dataset should change with it.`,
  },
  {
    slug: "nfl-spread-vs-moneyline-explained",
    title: "NFL Spread vs. Moneyline: How the Markets Work",
    excerpt: "A practical explanation of moneylines, point spreads, totals, prices and pushes—plus why a market is not the same thing as a prediction.",
    category: "Odds Education",
    tags: ["NFL spread", "moneyline", "NFL odds", "point spread"],
    featured: true,
    seoTitle: "NFL Spread vs Moneyline: Point Spreads and Odds Explained",
    seoDescription: "Learn the difference between NFL moneylines, point spreads and totals, including prices, pushes and timestamped odds snapshots.",
    publishedAt: "2026-08-11T12:05:00.000Z",
    sourceLinks: [
      { title: "The Odds API — market and odds documentation", url: "https://the-odds-api.com/liveapi/guides/v4/" },
      { title: "American Gaming Association — responsible play resources", url: "https://www.americangaming.org/responsibility/responsible-play/" },
      { title: "Superbowl.gg — responsible gaming policy", url: "https://superbowl.gg/responsible-gaming" },
    ],
    body: `NFL odds pages often place several numbers beside the same game. Those numbers describe different markets, not competing ways to display one prediction. Understanding the distinction between a moneyline, a point spread, a total and the price attached to each selection is the first step toward reading an odds screen accurately.

Superbowl.gg records community predictions with virtual units. It does not accept wagers. Odds shown on the site must come from a configured provider and include enough context to identify the game, market, bookmaker and capture time.

## Moneyline: which team wins?

A moneyline is the simplest result market. The selection is the team that wins the game, without adding or subtracting points from the final score. The Odds API calls this head-to-head, or h2h, in its data model.

The price still matters. Two teams can be offered at different prices because the market does not view their chances as equal. In American odds, a negative number identifies the amount conventionally associated with returning 100 units of profit, while a positive number identifies the profit conventionally associated with risking 100 units. Decimal odds express the total return per unit, including the original unit.

For example, American odds near -110 correspond to decimal odds of roughly 1.91 before provider rounding. That conversion does not create an advantage; it only changes the display format.

## Point spread: result measured against a line

A point spread gives one team a virtual handicap and the other a virtual head start. If Seattle is -3.5 against New England, a Seattle spread selection needs Seattle to win by at least four points. A New England +3.5 selection can succeed if New England wins outright or loses by no more than three.

The half point prevents a tie against the spread. A whole-number spread can produce a push. If a favorite is -3 and wins by exactly three, neither side beats the line. Rules vary by operator, but a standard two-way market generally returns the stake on a push. On Superbowl.gg, supported virtual predictions can be settled as PUSH when the captured line and final score are equal.

The line and the price are separate fields. One bookmaker might offer -3 at one price while another offers -3.5 at another. Comparing only the price while ignoring the point creates a false comparison.

## Total: how many combined points?

A total, often called the over/under, is based on the combined score. If the total is 47.5, an over selection needs at least 48 combined points and an under selection needs 47 or fewer. A total of 47 can push when the teams combine for exactly 47.

Totals do not require choosing the winning team. A game can be close and high-scoring, one-sided and low-scoring, or any other combination. Weather, pace, field position and defensive touchdowns can all affect the total without changing which team was favored.

## Price is not probability without adjustment

Odds can be converted into an implied probability, but the raw percentages across all outcomes usually add to more than 100 percent. The difference is commonly called margin, hold or vig. It is one reason a displayed price should not be presented as a neutral scientific forecast.

To compare a two-outcome market, analysts can first convert both prices to implied probabilities and then normalize them so their total equals 100 percent. Even that produces a market-derived estimate, not certainty. The number can move and the game can still produce an upset.

## Why the capture time matters

“The spread” is incomplete without a timestamp and source. An opening line, a Tuesday line and a closing line can all be different. A prediction made at -2.5 should not later be graded using -3.5 simply because the market moved.

Superbowl.gg's data model therefore stores the line, price, bookmaker reference, provider and capture time with a prediction when a supported market exists. The settlement process uses the recorded selection rather than silently replacing it with a newer number.

## A compact comparison

| Market | Main question | Can it push? | Key fields |
| --- | --- | --- | --- |
| Moneyline | Who wins the game? | Usually no | Team and price |
| Spread | Does a team beat the handicap? | Yes, on whole points | Team, line and price |
| Total | Is the combined score above or below the line? | Yes, on whole points | Over/under, line and price |

## Markets describe expectations, not guarantees

A favorite can lose. An underdog can win. A correct moneyline opinion can coexist with an incorrect spread opinion because the questions are different. Historical trends do not remove that uncertainty, and a line move after publication does not retroactively make an earlier prediction dishonest if the original snapshot is preserved.

That is why responsible analysis should show its assumptions, source and time. The [current NFL odds page](/nfl/odds) displays real provider markets when available; the [prediction guide](/how-it-works) explains how virtual community picks are recorded. Neither is a promise of profit, and no outcome should be framed as risk-free.`,
  },
  {
    slug: "why-nfl-super-bowl-odds-move",
    title: "Why NFL and Super Bowl Odds Move",
    excerpt: "Injuries, new information, bookmaker prices and market activity can all change a line. Here is how to read movement without inventing a story around it.",
    category: "Odds Education",
    tags: ["Super Bowl odds", "line movement", "NFL betting lines", "odds history"],
    featured: false,
    seoTitle: "Why NFL Odds Move: Super Bowl Lines and Market Movement",
    seoDescription: "Understand why NFL spreads, totals and moneylines change—and why source, bookmaker and timestamp matter when analyzing line movement.",
    publishedAt: "2026-08-11T12:10:00.000Z",
    sourceLinks: [
      { title: "The Odds API — historical odds snapshots", url: "https://the-odds-api.com/liveapi/guides/v4/" },
      { title: "NFL Football Operations — 2026–2027 injury-report dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
      { title: "American Gaming Association — responsible play", url: "https://www.americangaming.org/responsibility/responsible-play/" },
    ],
    body: `An NFL line is a time-stamped market value, not a permanent label attached to a matchup. The same bookmaker can publish one spread when a market opens and a different spread later in the week. Different bookmakers can also disagree at the same moment. Any useful line-movement analysis must preserve those differences instead of collapsing them into one unexplained number.

## New information changes expectations

Player availability is the clearest example. Quarterback, offensive line, pass-rush and secondary news can change how a market evaluates both the side and total. But responsible analysis should wait for attributable information. A social-media rumor and an official club injury designation are not equivalent sources.

For the 2026 regular season, the NFL's calendar specifies practice-report and game-status deadlines based on the day of the game. It also requires an update when a player's condition changes after the initial game-status report. Those official windows help explain why movement can cluster around certain times of the week.

Weather information can evolve in a similar way. A forecast several days before kickoff contains more uncertainty than observed conditions near game time. Wind can matter to deep passing and kicking, while rain may affect footing and ball security. “Bad weather” alone is not a complete quantitative argument.

## The line and price can move independently

Suppose a favorite opens -3 at a particular price. A bookmaker can first change the price while leaving the spread at -3. If pressure continues, it can move the line to -3.5 and reset the price. An analyst who reports only “the spread moved half a point” misses the earlier price movement.

Moneylines and totals have the same issue. The visible number is one coordinate in a larger market:

- market type: moneyline, spread or total
- selected outcome
- point or total, when applicable
- price
- bookmaker
- provider capture time

Without those fields, two screenshots cannot be compared reliably.

## Bookmakers do not have to move together

Sportsbooks manage their own prices, customers and risk. One book can move before another; another may use a different half point or a different price at the same spread. An average can be helpful, but it can also hide the range across books.

This is why Superbowl.gg stores bookmaker-level snapshots rather than claiming a single universal “Vegas line.” The [NFL odds page](/nfl/odds) should be read as a collection of current provider observations. If the configured provider has no market, the site displays no invented substitute.

## Opening, current and closing lines answer different questions

An opening line describes the market when it was first made available at the source being tracked. A current line describes a later snapshot. A closing line is normally the final widely available price before the event begins, but its exact definition still depends on the source and capture time.

Historical analysis needs to identify which one it uses. Comparing an opening spread from one archive with a closing price from another can create false movement. The Odds API's historical products model past data as timestamped snapshots and return the closest snapshot at or before a requested time. That is a much clearer concept than treating a historical line as timeless.

## Movement is evidence of change, not proof of cause

It is tempting to look at an injury headline and state that it caused every market move. Sometimes the timing supports that inference; sometimes the market had already changed or several events occurred together. A careful article should use language such as “the move followed” or “the timing is consistent with,” unless a market maker or other direct source confirms causation.

The same caution applies to labels such as sharp money or public money. Without a sourced handle or ticket dataset, those phrases are guesses. Price movement alone does not reveal who placed wagers or why a bookmaker changed its number.

## Super Bowl markets have an especially long lifecycle

Super Bowl futures can exist before the regular season, while the final matchup line exists only after the conference championships determine the participants. Those are different markets. A July championship future for one team cannot be compared directly with a February game moneyline.

When the matchup is known, the spread can move through two weeks of player, practice and market information. A credible archive records when each observation occurred. The [Super Bowl odds hub](/super-bowl/odds) therefore separates current provider data from [historical results](/super-bowl/history).

## A practical checklist for reading a move

Before drawing a conclusion, ask:

1. Is this the same bookmaker and market?
2. Are both the point and price recorded?
3. What are the exact capture times?
4. Did official injury, roster or weather information arrive between snapshots?
5. Is the claimed cause sourced or merely inferred?
6. Has the game already started, turning the comparison into a live-market question?

Line movement can add context to an NFL matchup, but it does not eliminate uncertainty. It should be documented with the same discipline as a score or injury status: source first, timestamp second, interpretation clearly labeled.`,
  },
  {
    slug: "nfl-playoff-seeding-tiebreakers-explained",
    title: "NFL Playoff Seeding and Tiebreakers Explained",
    excerpt: "How 14 teams qualify, why division champions receive the top four seeds, who gets the bye and how the NFL separates tied records.",
    category: "Playoffs",
    tags: ["NFL playoffs", "NFL tiebreakers", "playoff seeding", "wild card"],
    featured: false,
    seoTitle: "NFL Playoff Seeding & Tiebreakers Explained for 2026",
    seoDescription: "A clear guide to the 14-team NFL playoff format, wild-card seeds, first-round byes and official division and conference tiebreakers.",
    publishedAt: "2026-08-11T12:15:00.000Z",
    sourceLinks: [
      { title: "NFL.com — official tiebreaking procedures", url: "https://www.nfl.com/news/nfl-tiebreaking-procedures" },
      { title: "NFL Football Operations — collective bargaining agreement overview", url: "https://operations.nfl.com/programs-initiatives/player-development-partnership/collective-bargaining-agreement" },
      { title: "NFL Football Operations — 2026–2027 postseason dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
    ],
    body: `The NFL playoff race is not one league-wide table. The AFC and NFC each produce their own seven-team field, and the order reflects division championships before wild-card records. Understanding that structure prevents a common mistake: assuming the seven best records in a conference are always seeded one through seven.

## Four division champions and three wild cards per conference

Each conference contains four divisions. The winner of every division qualifies for the postseason, producing four division champions in the AFC and four in the NFC. Three additional non-division winners with the best qualifying records become wild cards in each conference.

That creates 14 playoff teams overall: seven AFC teams and seven NFC teams.

The four division champions receive seeds 1–4. The three wild cards receive seeds 5–7. As a result, a wild-card club can have a better record than a division champion and still be seeded lower for the opening round under the current structure.

## Only the No. 1 seed receives a first-round bye

The top seed in each conference does not play on Wild Card Weekend. The other six teams play three games:

- No. 2 hosts No. 7
- No. 3 hosts No. 6
- No. 4 hosts No. 5

The winners join the No. 1 seed in the Divisional Playoffs. The NFL bracket is not a fixed March-style path where teams ignore later results. The top remaining seed hosts the lowest remaining seed in the divisional round.

For the 2026 season, Wild Card Weekend is scheduled for January 16–18, 2027. The divisional round follows January 23–24, the conference championships are January 31 and Super Bowl LXI is February 14.

## Winning percentage includes ties

The standings compare won-lost-tied percentages. An NFL tie counts as half a win and half a loss for this calculation. If clubs finish with the same percentage, the league applies a published sequence of tiebreakers until the order is resolved.

There are separate procedures for a tie inside one division and for wild-card selection between clubs from different divisions. There are also separate paths for two-team and multi-team ties.

## Two clubs tied inside a division

The official sequence begins with:

1. Head-to-head record between the clubs
2. Division record
3. Record in common games
4. Conference record
5. Strength of victory
6. Strength of schedule

If the tie survives, the procedure continues through combined rankings in points scored and allowed, net points, net touchdowns and eventually a coin toss. The later steps are rare, but they are part of the published rules.

Strength of victory and strength of schedule are not the same measure. Strength of victory considers the records of teams a club defeated. Strength of schedule considers the records of all opponents.

## Wild-card tiebreakers

For two clubs from different divisions competing for a wild-card position, head-to-head applies if they played each other. The next major tests include conference record and record in common games when the minimum common-game requirement is met, followed by strength of victory and strength of schedule.

When multiple clubs from the same division are part of a wild-card tie, the league first uses the division procedure to reduce that division to one representative. This prevents one division from entering several teams into the same cross-division comparison at once.

## Multi-team ties can restart

The multi-team procedure is not simply applied once from top to bottom. When one or more clubs are eliminated and two remain, the league can restart at Step 1 of the applicable two-club format. When one club wins a multi-team tiebreaker, the remaining clubs can also revert to the start of the relevant process for the next position.

This restart rule is why a manually constructed playoff table can disagree with an official bracket even when it contains the correct records. The order of the procedure matters.

## What standings pages should show

A useful [NFL standings page](/nfl/standings) should present record, division and conference context without claiming that a September order is a final playoff seed. Early in the season, many clubs are tied and some tiebreaker inputs have not accumulated enough games to apply cleanly.

The [playoff picture](/nfl/playoffs) becomes more informative as teams complete common, division and conference matchups. Clinch labels should come from verified outcomes, not a manually invented scenario.

## Why the No. 1 seed matters

The only bye removes one elimination game and guarantees a divisional-round home game. It is therefore materially different from finishing second. Division titles also matter because seeds 2–4 host on Wild Card Weekend even when a wild-card opponent owns a stronger record.

None of this determines who will win. Seeding describes qualification, home field and opponent assignment. Predictions belong in a separate analysis, and any playoff projection should state the current records and tiebreak assumptions used.`,
  },
  {
    slug: "2026-nfl-week-1-matchup-guide",
    title: "2026 NFL Week 1 Matchup Guide: What to Track Before Kickoff",
    excerpt: "The official opening-week showcase games and the roster, travel, injury and market information that should be checked before making a prediction.",
    category: "Matchup Guide",
    tags: ["NFL Week 1", "2026 NFL schedule", "NFL matchups", "NFL predictions"],
    featured: true,
    seoTitle: "2026 NFL Week 1 Matchup Guide and Key Games",
    seoDescription: "Preview the key games on the official 2026 NFL Week 1 schedule and learn which verified factors matter before kickoff.",
    publishedAt: "2026-08-11T12:20:00.000Z",
    sourceLinks: [
      { title: "NFL.com — complete 2026 Week 1 schedule", url: "https://www.nfl.com/news/2026-nfl-schedule-release-complete-slate-of-week-1-games" },
      { title: "NFL.com — 2026 schedule release", url: "https://www.nfl.com/nfl-schedule-release/" },
      { title: "NFL Football Operations — 2026–2027 important dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
    ],
    body: `Week 1 creates the widest gap between attention and reliable current-season evidence. Depth charts are still settling, preseason usage is selective and no club has a 2026 regular-season statistical sample. A useful preview should identify what is known, what will change before kickoff and what remains opinion.

The NFL has published the complete opening-week slate. Four showcase windows illustrate how different the preparation questions can be.

## Wednesday, September 9: New England at Seattle

Seattle opens its championship defense at Lumen Field against the team it defeated in Super Bowl LX. The Seahawks beat the Patriots 29–13 in February, so the opener is an immediate rematch rather than a generic interconference game.

The previous result is relevant context, not a score prediction. Both rosters have passed through free agency, the draft and an entire summer. Before kickoff, compare the final 53-player rosters, offensive line combinations, backfield roles and official game-status reports. Do not assume every Super Bowl matchup or personnel advantage remains unchanged seven months later.

The Wednesday date also changes the reporting calendar. The NFL's 2026 dates specify earlier practice and game-status reporting for a Wednesday game. A preview written on a normal Sunday-game timetable could miss the final designation window.

## Thursday, September 10: San Francisco vs. Los Angeles Rams in Melbourne

The 49ers and Rams meet at the Melbourne Cricket Ground in the NFL's first regular-season game in Australia. It is also a division game, which means the result contributes immediately to the NFC West standings and any later division-record tiebreaker.

Travel is the obvious storyline, but it needs precision. Both clubs are traveling, and the relevant questions include arrival schedule, practice location, body-clock kickoff time and the sequence of games after the return. The neutral-site label does not by itself favor one side.

The [live game page](/games) should be used for the verified kickoff and provider markets. If a spread moves during the week, compare the same bookmaker, point, price and timestamp rather than attributing every move to travel.

## Sunday night, September 13: Dallas at the New York Giants

Dallas and New York open with a division game at MetLife Stadium. Division familiarity can reduce the value of broad season narratives because coaches and players have recent film against the same opponent, but turnover on either roster can change the matchup.

For this game, watch the line of scrimmage and early-down efficiency rather than relying only on total yardage. Negative plays, pressure allowed without blitzing, third-and-long frequency and field position can explain a result more clearly than a raw yard total assembled while trailing.

Because the game is on Sunday, its standard injury-report sequence differs from the Wednesday and Thursday openers. Status labels should be checked again after Friday and for any required updates before inactives are announced.

## Monday night, September 14: Denver at Kansas City

The Broncos visit the Chiefs in the Monday night opener. A Monday game offers an additional day after the main Sunday slate, but the official report deadlines also shift. The market may react during the weekend to practice information or status changes.

Division games can eventually affect head-to-head and division-record tiebreakers. In Week 1, however, it is too early to describe any result as deciding the AFC West. It is one of six division games each club plays.

## The roster checkpoint comes first

Clubs reduce to 53 players on August 30. Waivers and practice-squad formation follow. Until that process is complete, a preview should avoid treating a camp depth chart as a final active roster.

Key questions include:

- Which offensive line combination is healthy and expected to start?
- Which players return kicks or handle short-yardage roles?
- Are rookies working with the first team or only projected to do so?
- Has a player moved to reserve status?
- Which changes are confirmed by the club or league transaction record?

## Preseason performance needs context

Preseason football can reveal alignment, role and availability, but playing time varies dramatically. A team can win without using its regular-season quarterback or primary scheme. Treating preseason point differential as a direct regular-season forecast ignores who played and what the coaching staff was trying to evaluate.

The more useful observations are role-based: who lined up with starters, who handled pass protection, who played special teams and whether an injury changed participation. Even those observations should be updated after roster cuts.

## Do not publish a line that does not exist

Superbowl.gg only shows an odds market after a configured provider returns one for the verified game. If a bookmaker has not posted a supported Week 1 market, the correct value is unavailable—not an estimate created for an article.

When a community prediction is published, its captured line and price remain part of the record. The final result is settled against that snapshot after the provider confirms the score. Readers can inspect current games in the [game center](/games), compare [NFL odds](/nfl/odds) and keep opinion separate from the official [schedule](/nfl/schedule).

## The Week 1 rule: update before you conclude

The opening slate is now official, but the final rosters, injury designations and market snapshots are not frozen on August 11. The responsible workflow is to build a hypothesis, list the evidence it requires and update it when the official information arrives. That produces a useful preview without pretending the uncertainty has disappeared.`,
  },
  {
    slug: "nfl-stats-that-matter-weekly-analysis",
    title: "Weekly NFL Stat Trends: Five Signals We Track Beyond Total Yards",
    excerpt: "Turnovers, down-to-down efficiency, pressure, explosiveness and situation explain more than a single box-score yardage total.",
    category: "Stats Lab",
    tags: ["NFL stats", "NFL analytics", "EPA", "Next Gen Stats"],
    featured: false,
    seoTitle: "Five NFL Stats That Matter Beyond Total Yards",
    seoDescription: "A practical NFL analytics guide to turnovers, efficiency, pressure, explosive plays and situational context for weekly matchup analysis.",
    publishedAt: "2026-08-11T12:25:00.000Z",
    sourceLinks: [
      { title: "nflverse — open NFL data and analytics tools", url: "https://github.com/nflverse" },
      { title: "nflfastR — play-by-play models and data", url: "https://github.com/nflverse/nflfastR" },
      { title: "NFL Next Gen Stats — glossary", url: "https://nextgenstats.nfl.com/glossary" },
    ],
    body: `Total yards are descriptive, but they are not a complete explanation of an NFL game. A team trailing by three scores can accumulate passing yards against softer coverage. A winning team can protect a short field and finish with fewer yards. Weekly analysis becomes more useful when it combines the box score with play context.

Superbowl.gg's 2026 leaderboards remain empty until genuine 2026 regular-season games produce data. Preseason production and previous-season totals are not relabeled as current. Once the sample begins, these are five signal groups worth tracking.

## 1. Turnovers—and the opportunities behind them

Turnover margin changes possessions and field position, so it often has an immediate relationship with the final score. But turnovers can also be volatile. A tipped pass, a dropped interception and a fumble that bounces out of bounds can create very different box-score outcomes from similar underlying danger.

A good review records the actual interceptions and fumbles lost, then asks how they occurred. Was the quarterback pressured? Did the receiver deflect the ball? Did a defender drop another possible interception? Was the offense repeatedly placed in obvious passing situations?

For forward-looking analysis, the process behind a turnover is usually more reusable than assuming the same margin will repeat every week.

## 2. Down-to-down efficiency

Play-by-play models such as those available through nflfastR estimate Expected Points Added, or EPA, by comparing the value of the game state before and after a play. Success rate then asks how often an offense produces a positive result under the selected definition.

These measures add context that total yards omit. A five-yard gain on third-and-four is different from a five-yard gain on third-and-12. A one-yard touchdown is valuable even though it barely changes the yardage column.

No single model is official truth. nflfastR itself documents its model fields and data limitations. An article should name the dataset, season range, filters and whether kneel-downs, spikes or garbage-time plays were removed.

## 3. Pressure and time to throw

Sacks are important but incomplete. A defense can hurry a passer into an incompletion without recording a sack, while a quarterback can create a sack by holding the ball after the initial protection works.

NFL Next Gen Stats defines Time to Throw as the elapsed time from snap to throw on pass attempts, excluding sacks. Its passing metrics also include intended air yards, completion probability and completion percentage above expectation. Together, those fields can help distinguish quick-game design, aggressive depth and quarterback execution.

When proprietary tracking data is unavailable, public analysis should say so. Pressure rate from one provider should not be silently compared with a differently defined rate from another.

## 4. Explosive plays and air-yard profile

Two offenses can finish with the same yardage through different paths. One may sustain long drives; another may create a few gains of 30 or more yards. Explosive plays change scoring probability and can hide inconsistent early-down performance.

Intended air yards help describe how far downfield a quarterback is targeting, while completed air yards show the depth of successful passes. Receiver separation, yards after catch and protection all influence the final result. A high average can also come from a small number of attempts, so volume belongs beside the rate.

For rushing analysis, distinguish yards before contact, yards after contact and the defensive box when the source provides them. A generic yards-per-carry number can be distorted by one long run or quarterback scrambles.

## 5. Situation: third down, red zone, field position and game state

Third-down conversion rate is visible and useful, but the average distance matters. An offense facing third-and-two is not solving the same problem as one repeatedly facing third-and-nine. Early-down penalties, sacks and unsuccessful runs can create the difference.

Red-zone touchdown rate, starting field position and time remaining add similar context. Time of possession by itself does not award points; it can reflect an efficient offense or a team running plays while behind. The sequence of possessions matters more than declaring that the team with the ball longer “controlled” every game.

## Sample size is part of the statistic

Week 1 rates are based on one opponent and a small number of plays. By Week 4, the sample is larger but still shaped by opponent quality and game scripts. A responsible trend report shows attempts or plays beside percentages and avoids presenting a one-week split as a permanent identity.

It should also compare like with like. Regular-season 2026 data belongs against the same stage of another season or against a clearly labeled prior-season baseline—not an unlabeled mixture of preseason and playoff games.

## How Superbowl.gg applies the framework

The [NFL stats page](/nfl/stats) publishes provider-backed player totals after actual games. Individual [game pages](/games) can show team and player box-score fields tied to the verified matchup. Editorial analysis can add play-level context when the cited source supports it.

The hierarchy is deliberate:

1. Verify the game, teams, score and sample.
2. Report the observed statistic and definition.
3. Explain the game context.
4. Label the interpretation.
5. Keep any prediction separate from the verified result.

That approach does not produce a guaranteed pick. It produces an analysis another reader can inspect, challenge and update when the next game adds evidence.`,
  },
  {
    slug: "nfl-injury-report-practice-game-status-explained",
    title: "NFL Injury Reports Explained: Practice Status vs. Game Status",
    excerpt: "Did not participate, limited, full, questionable, doubtful and out describe different things. Here is how the official reporting sequence works.",
    category: "Injuries",
    tags: ["NFL injury report", "questionable", "practice report", "NFL injuries"],
    featured: false,
    seoTitle: "NFL Injury Report Statuses Explained: DNP, Limited, Questionable",
    seoDescription: "Understand NFL practice participation, game-status labels, reporting deadlines and why limited practice does not automatically mean a player is out.",
    publishedAt: "2026-08-11T12:30:00.000Z",
    sourceLinks: [
      { title: "NFL Football Operations — 2026–2027 reporting calendar", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
      { title: "NFL Personnel (Injury) Report Policy", url: "https://operations.nfl.com/media/2683/2017-nfl-injury-report-policy.pdf" },
      { title: "Superbowl.gg — current NFL injuries", url: "https://superbowl.gg/nfl/injuries" },
    ],
    body: `An NFL practice report and an NFL game-status report answer different questions. Combining their labels into one generic “injury status” can make a player appear more or less available than the club actually reported.

The league's 2026–2027 calendar continues to require both reports during the regular season and postseason. Deadlines vary with the day of the game, and clubs must update a status when a player's condition changes after the initial game-status report.

## Practice participation describes that day's work

The practice report uses participation categories:

- **Did Not Participate (DNP):** the player did not participate in practice.
- **Limited Participation:** the player took fewer repetitions than a normal member of the position group or was otherwise limited under the policy.
- **Full Participation:** the player completed the normal workload despite being listed for an injury or condition.

These labels describe practice, not a guaranteed game outcome. A veteran can be limited and still play. A player can practice fully and later experience a setback. The body part or reason attached to the listing adds necessary context.

Rest can also appear on a practice report. The policy distinguishes a non-injury-related rest designation from an injury that affects availability. A rest day should not be converted into a game-status label that the club did not issue.

## Game status addresses expected availability

The game-status report uses categories such as:

- **Out:** the player will not play.
- **Doubtful:** the player is unlikely to play.
- **Questionable:** it is uncertain whether the player will play.

A player who appeared on a practice report may be omitted from the final game-status report when the club is certain he will play under the policy. That omission is meaningful; it should not be replaced by the last practice label on a current injury page.

The active/inactive list released near kickoff is the final operational answer for that game. “Questionable” on Friday and inactive on Sunday are not conflicting facts; they are updates at different times.

## Reporting days depend on kickoff day

For a standard Sunday game, practice reports are normally filed Wednesday, Thursday and Friday, with the game-status report on Friday. The 2026 calendar specifies different sequences for games played Wednesday, Thursday, Friday, Saturday and Monday.

That matters immediately in 2026 because Kickoff Weekend includes Wednesday, Thursday, Sunday and Monday games. A preview cannot apply the Sunday reporting cadence to the New England–Seattle opener or the Melbourne game one day later.

On days when a team practices, the calendar says an estimated practice report is not acceptable. Estimated participation is used in defined circumstances when a walkthrough or no practice occurs; it should remain labeled as an estimate.

## Reserve-list status is a separate layer

Injured Reserve, Physically Unable to Perform and other reserve categories concern roster eligibility, not just a one-game designation. A player designated for return can practice under the applicable rules before being activated. Seeing practice activity does not automatically mean the player is on the active game roster.

A clear injury page therefore separates:

1. roster status
2. daily practice participation
3. final game status
4. active/inactive status near kickoff

Collapsing them into one badge loses information.

## How injury news affects analysis

Availability is only the first question. Role and replacement quality determine the football impact. An absent starting tackle can change protection help and route timing; a missing corner can change coverage assignments; a limited running back can redistribute touches without removing the entire rushing plan.

Responsible matchup analysis identifies the confirmed status, the likely replacement based on sourced depth-chart evidence and the specific matchup mechanism. It does not assign a made-up point value to every injury.

Odds can move near report deadlines, but timing alone does not prove causation. To discuss a move, preserve the bookmaker, line, price and capture time, then state whether the injury information arrived between those snapshots.

## What Superbowl.gg displays

The [NFL injuries page](/nfl/injuries) is backed by synchronized records and timestamps. It should not fill an empty current-season feed with a prior year's statuses. Player pages can preserve historical context, while game pages connect an injury record to a specific matchup when the provider supplies that relationship.

Before relying on any card, check the reported and updated times. An old “questionable” label after the inactive list is released is stale even if it was accurate when first published.

## A reader's checklist

- Is this a practice label, game-status label or roster status?
- Which day and game schedule does it apply to?
- Is participation actual or estimated?
- Has the club issued an update?
- Is the player active at kickoff?
- Is the claimed football impact sourced or interpreted?

Injury reports reduce uncertainty; they do not remove it. Keeping each stage and timestamp visible is the most accurate way to use them.`,
  },
  {
    slug: "super-bowl-results-point-spread-history",
    title: "Super Bowl Results and Point Spreads: How to Read the History",
    excerpt: "Recent championship scores beside archived consensus spreads, with an important warning about sources, timestamps and small-sample trends.",
    category: "Super Bowl History",
    tags: ["Super Bowl spread", "Super Bowl results", "Super Bowl line", "Super Bowl history"],
    featured: false,
    seoTitle: "Super Bowl Point Spread History and Recent Results",
    seoDescription: "Review recent Super Bowl results and archived point spreads, including Super Bowl LX, with source and timestamp caveats explained.",
    publishedAt: "2026-08-11T12:35:00.000Z",
    sourceLinks: [
      { title: "Covers — Super Bowl point spread archive", url: "https://www.covers.com/sportsoddshistory/nfl-super-bowl/" },
      { title: "NFL.com — Super Bowl champions and scores", url: "https://www.nfl.com/news/super-bowl-champions-09000d5d826acbde" },
      { title: "The Odds API — historical snapshot methodology", url: "https://the-odds-api.com/liveapi/guides/v4/" },
      { title: "American Gaming Association — responsible play", url: "https://www.americangaming.org/responsibility/responsible-play/" },
    ],
    body: `A historical Super Bowl line is useful only when its definition is clear. Different archives can record different books, times or consensus methods. One page may list an opener; another may list a closing consensus. A half-point disagreement does not automatically mean either source fabricated data—it may mean they captured different markets.

The table below uses one consistent archive for the spread and total, then pairs those values with the recorded final score. Lines are shown from the favorite's perspective. They are historical observations, not current recommendations.

## Recent Super Bowl results and archived lines

| Super Bowl | Favorite and spread | Underdog | Total | Final score | Spread result |
| --- | --- | --- | ---: | --- | --- |
| LX (2026) | Seattle -4.5 | New England | 45.5 | Seattle 29–13 | Favorite covered; under |
| LIX (2025) | Kansas City -1.5 | Philadelphia | 48.5 | Philadelphia 40–22 | Underdog covered; over |
| LVIII (2024) | San Francisco -2 | Kansas City | 47 | Kansas City 25–22 | Underdog covered; total push |
| LVII (2023) | Philadelphia -1 | Kansas City | 51 | Kansas City 38–35 | Underdog covered; over |
| LVI (2022) | Los Angeles Rams -4.5 | Cincinnati | 48.5 | Los Angeles 23–20 | Underdog covered; under |
| LV (2021) | Kansas City -3 | Tampa Bay | 55.5 | Tampa Bay 31–9 | Underdog covered; under |

The year in parentheses is the calendar year in which the Super Bowl was played. Super Bowl LX concluded the 2025 NFL season in February 2026. Super Bowl LXI will conclude the 2026 NFL season on February 14, 2027.

## Straight-up and against-the-spread are different results

Straight-up asks who won the game. Against the spread asks whether the selected side beat the archived handicap. In Super Bowl LVI, the Rams won 23–20 but did not cover a 4.5-point favorite line. Cincinnati lost the championship and still produced the underdog side of the spread result.

Super Bowl LVIII illustrates a total push. Kansas City and San Francisco combined for 47 points against the archive's total of 47. A different source that recorded 47.5 would classify the same final score as under. That is exactly why the source and number must remain attached.

## A closing line is not one universal number

Bookmakers can offer different spreads and prices at the same time. A consensus archive chooses a methodology for representing them. Historical API products instead preserve timestamped bookmaker snapshots and return observations relative to a requested time.

For reproducible analysis, store:

- event and teams
- bookmaker
- market type
- outcome
- point or total
- price
- exact capture time

Without those fields, “the closing line” is a useful shorthand but not a complete dataset.

## What the recent sample does not prove

The table contains six games. It shows that the underdog covered each of the five championships from LV through LIX, while Seattle covered as the favorite in LX. It does not prove that blindly selecting the underdog has a future advantage.

The participants, prices and matchup conditions are different every year. Selecting a trend after seeing the results also creates selection bias. A responsible historical article describes the sample; it does not turn a short run into a guaranteed system.

The same warning applies to totals. Three recent unders, two overs and one push can describe what happened without establishing what will happen in Super Bowl LXI.

## Why Super Bowl LXI has no matchup line yet

As of August 11, 2026, the 2026 regular season has not started and the conference champions are unknown. A final Super Bowl game spread cannot exist for unidentified participants. Futures markets on teams to win the championship are a different product and should not be mislabeled as the game line.

After the AFC and NFC Championship Games on January 31, 2027 determine the matchup, configured providers can publish moneyline, spread and total markets. The [Super Bowl odds page](/super-bowl/odds) will display provider-backed data when available; it will not create placeholder prices.

## Use history as context

Historical spreads help answer specific questions: what did a documented market expect, how did the final margin compare and how much did sources differ? They are also useful for testing a clearly defined model when the analyst avoids looking ahead at results.

They cannot remove uncertainty from a future game. Read them alongside the official [Super Bowl history](/super-bowl/history), current team data and an explicit methodology. If a line lacks a bookmaker or timestamp, treat it as an archive reference rather than a precision measurement.`,
  },
  {
    slug: "nfl-byes-rest-advantage-explained",
    title: "Byes, Rest and Travel: What the Schedule Actually Gives a Team",
    excerpt: "How bye weeks, extra rest days and travel distance are measured in NFL analysis — and why each is weaker evidence than commonly assumed.",
    category: "Stats Lab",
    tags: ["NFL bye week", "rest advantage", "NFL travel", "schedule analysis"],
    featured: false,
    seoTitle: "NFL Byes, Rest and Travel Advantage: Measured Honestly",
    seoDescription: "How analysts measure bye-week and rest edges in the NFL, what the research actually shows, and why travel claims need context.",
    publishedAt: "2026-08-21T12:00:00.000Z",
    sourceLinks: [
      { title: "NFL Football Operations — how the NFL schedule is made", url: "https://operations.nfl.com/calendar-events/nfl-schedule/making-the-schedule" },
      { title: "NFL.com — official 2026 schedule", url: "https://www.nfl.com/schedules/2026/by-team" },
      { title: "NFL Football Operations — 2026–2027 important dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
    ],
    body: `Rest and travel are the most quoted — and most misused — context factors in NFL analysis. "They're coming off a bye" and "that's a long trip west" are treated as predictions when they are only conditions. This article explains how each factor is measured, what a fair comparison looks like, and where the evidence is weaker than the confidence of the commentary.

## Byes: what the bye actually changes

Each NFL club plays 17 games across 18 weeks, so every team gets one bye. The bye's measurable effects are straightforward: an extra week of physical recovery, additional preparation time for the next opponent, and a change in the rhythm of a season. What the bye does not change is talent, coaching or a team's underlying efficiency profile.

The commonly cited "bye advantage" comes from historical win-rate differences for bye teams, especially against opponents who also played the previous week. Two cautions apply before quoting those numbers. First, the samples are drawn from seasons with different bye placements and rest structures, so the aggregate blends different situations. Second, bye advantage is not symmetric: a bye before a road game against a strong opponent is a different situation from a bye before a home game against a struggling one, and the raw historical rate does not separate those cases.

A defensible way to use bye information is as a modifier on matchup analysis, not as a standalone signal. If your model already accounts for team strength, location and injuries, the remaining bye effect is a small adjustment — not a reason to override the rest of the evaluation.

## Rest days: measure the differential, not the total

Rest analysis should compare the two teams, because both clubs played last week. The meaningful quantity is the rest differential: Team A had seven days between games while Team B had ten, or one club comes off a Thursday game into a Sunday opponent that played Monday. The differential frames who is comparatively fresher; the absolute number does not.

The 2026 schedule creates several extreme cases worth tracking. Short-week sequences after international games — the league plays in Melbourne, Rio, London, Paris, Madrid, Munich and Mexico City this season — combine travel, time-zone change and compressed recovery. Those games are exactly where a naive "road team is tired" claim fails: the home team in an international game often travels too, and kickoff body-clock time matters as much as distance.

## Travel: distance is easy, context is hard

Travel distance is the easiest number to compute and the least informative on its own. What matters is the combination of distance, direction (west-to-east travel is harder on body clocks), time-zone shift, days of adaptation and whether the team stayed on the road for consecutive games. A three-time-zone trip with a normal Sunday kickoff after a full week is a different burden from a Thursday game following the same flight.

The schedule's international stretch makes this concrete. A club flying to Munich in November faces a nine-hour shift; its opponent may arrive from a different timezone entirely. Analysts who quote only "Team X travels 4,500 miles" are reporting trivia. The measurable claim is: kickoff occurs at an unusual body-clock time for both teams, and each club's prior-week location determines who adapted more.

## How to keep these factors honest

Three practices separate careful analysis from narrative. First, always compare: rest differential, travel asymmetry and bye placement for both clubs, never one side alone. Second, separate confirmed facts from interpretation — the schedule and injury report are facts; "they'll be flat after the trip" is a hypothesis. Third, respect sample limits: a handful of international games per season is a small dataset, and conclusions drawn from it should be held loosely.

None of this makes byes, rest and travel irrelevant. It makes them context — inputs that adjust a matchup evaluation by a modest amount, rather than the headline of a prediction. When you read a claim that a bye or a flight will decide a game, check whether the analysis compared both teams and whether the effect size cited survives contact with a full-season sample. The [Superbowl.gg game center](/games) keeps schedule, rest and location data current with consistent definitions and timestamps, so those comparisons take seconds, not hours.`,
  },
  {
    slug: "nfl-injury-reports-what-doubtful-and-questionable-mean",
    title: "NFL Injury Reports Explained: DNP, Limited, Questionable and Doubtful",
    excerpt: "How the league's injury-report system works, what each designation actually tells you, and how to read reports without overreacting.",
    category: "Injuries",
    tags: ["NFL injury report", "questionable designation", "DNP", "injury analysis"],
    featured: false,
    seoTitle: "NFL Injury Report Designations: DNP, Limited, Questionable, Doubtful",
    seoDescription: "What NFL injury report practice designations and game statuses mean, when they are published, and how to interpret them responsibly.",
    publishedAt: "2026-08-21T12:30:00.000Z",
    sourceLinks: [
      { title: "NFL Football Operations — injury report procedures", url: "https://operations.nfl.com/for-fans/football-safety/injury-report-policy" },
      { title: "NFL.com — official 2026 schedule", url: "https://www.nfl.com/schedules/2026/by-team" },
      { title: "NFL Football Operations — 2026–2027 important dates", url: "https://operations.nfl.com/calendar-events/nfl-important-dates" },
    ],
    body: `Injury reports are the NFL's most misunderstood public document. They are compliance filings, not medical assessments — and reading them well means understanding what the league requires clubs to disclose, when, and what each label does and does not tell you.

## What clubs must report and when

Once the regular season begins, clubs submit practice participation reports on a schedule set by the league based on when each team plays. A club playing Sunday reports Wednesday through Friday; a Thursday team's windows compress earlier in the week. Each report classifies every player with a reportable injury as Did Not Participate (DNP), Limited Participation, or Full Participation, together with the injury itself and, later in the week, a game-status label.

The game-status labels are the ones most quoted: Questionable means the player is uncertain to play; Doubtful means unlikely (roughly a 25% historical play rate); Out means ruled out. Critical nuance: these labels describe the reporting club's assessment at the time of the report, not a medical prognosis, and clubs update them as the week progresses. A Friday Questionable can become a Sunday scratch or a full workload.

## What a designation does and does not tell you

A DNP on Wednesday is a data point about one practice. Players sit for load management, illness, personal reasons and veteran rest alongside genuine injuries. A Limited tag can mean a player is trending toward playing, is being eased back, or is being managed through a chronic issue they will play with all season. None of these distinctions is visible in the designation itself.

The informative signal is the trajectory across the week. A player who goes Limited-Limited-Full and carries no game-status label is a different situation from DNP-DNP-DNP with a Doubtful tag, even though both appear on the same report template. Single-day snapshots — especially screenshots circulating on social media — strip away exactly the context that makes the report meaningful.

## Reading reports without overreacting

Three habits keep injury analysis grounded. First, always check the practice day: a Friday report supersedes Wednesday's, and the final status report before kickoff is the only one that binds. Second, weight by role: a Questionable backup guard changes less than a Questionable starting quarterback, and depth-chart context is as important as the tag. Third, remember that opponents' reports matter too — a pass rusher's availability changes what an offensive line's bumps actually mean.

For modeling purposes, the report is an input to a distribution, not a verdict on the game. Historical play rates by designation (Questionable players have historically played in a majority of cases; Doubtful rarely) are useful priors, but they are league-wide averages that vary by position, injury type and even individual club reporting tendencies.

## Translate availability into a football effect

The final step is separating a player's chance of being active from the effect of that player on the matchup. Those are different questions. An active starter may have a restricted snap count, while a well-prepared reserve can preserve most of the original game plan. Start with role and likely replacement: identify the snaps, assignments and personnel packages that would change if the player sits. Then ask whether the opponent is equipped to attack that specific change.

This approach prevents double counting. If a quarterback's absence is already reflected in an efficiency projection, adding a second broad "injury downgrade" for the offense exaggerates the same information. It also makes uncertainty visible. Analysts can publish a base case, an active-but-limited case and an inactive case instead of pretending one forecast covers all three. When the final inactive list arrives before kickoff, update the relevant branch and leave unrelated assumptions alone. A transparent range is more useful than a confident headline built from an early-week label.

## Where the 2026 season adds context

Official regular-season injury-report procedures begin with Kickoff Weekend on September 9–14, and the league's 18-week schedule means byes, short weeks and international trips all interact with availability in ways a single report cannot capture. The live [Superbowl.gg game center](/games) carries the current schedule so a report can always be read against the right practice calendar, and our [injury report guide](/blog/nfl-injury-report-practice-game-status-explained) covers how designations map to weekly analysis in more depth.

Treat the injury report as what it is: a standardized disclosure that tells you who practiced, how much, and what the club currently expects. Everything beyond that — how an absence reshapes a matchup, which backup changes the plan, whether a Limited star is truly trending toward playing — is analysis, and it should be labeled as such.`,
  },
];
