# CODEX MASTER PROMPT

# BUILD SUPERBOWL.GG

## American Football Prediction, Analytics, Community, Gamification, Affiliate & SEO Platform

You are acting as:

* Principal Software Engineer
* Product Designer
* UX Researcher
* Backend Engineer
* Frontend Engineer
* Data Engineer
* SEO Engineer
* Technical SEO Specialist
* DevOps Engineer
* QA Engineer
* Security Engineer

Your task is to build a COMPLETE, PRODUCTION-READY platform for:

# SUPERBOWL.GG

The main UX/product reference is:

https://demo.affiumsport.com/

The objective is to reproduce the useful PRODUCT CONCEPTS, UX FLOWS, PAGE ARCHITECTURE, GAMIFICATION, COMMUNITY FEATURES, SPORTS PREDICTION EXPERIENCE, MARKETPLACE, AFFILIATE MONETIZATION AND ADMIN EXPERIENCE of the Affium Sport demo — but completely reimplemented for:

# AMERICAN FOOTBALL

Primary focus:

# NFL

Secondary/future architecture:

* NCAA Football / NCAAF
* UFL
* CFL
* other American Football leagues

The final application must have:

* original Superbowl.gg branding
* original code
* original visual system
* original copy
* American Football terminology
* real backend functionality
* real database
* real authentication
* real sports-data integrations
* real odds integrations
* real settlement logic
* real admin functionality
* real gamification
* real SEO architecture
* real SEMrush-powered SEO research

DO NOT create a mockup.

DO NOT create a static prototype.

DO NOT create dead buttons.

DO NOT create fake backend endpoints.

DO NOT fabricate sports results.

DO NOT fabricate sportsbook odds.

DO NOT fabricate user metrics.

DO NOT fabricate testimonials.

DO NOT stop after creating a plan.

Actually implement the application.

---

# CRITICAL REFERENCE CHANGE

Ignore any previous reference to:

affiumsport.com

The product/UX reference that MUST be analyzed is:

https://demo.affiumsport.com/

This is the actual application demo.

Do not base the implementation primarily on Affium's marketing landing page.

Analyze the DEMO APPLICATION.

---

# PHASE 0A

# FULL AFFIUM DEMO RECONNAISSANCE

Before implementing Superbowl.gg, inspect:

https://demo.affiumsport.com/

using an actual browser.

Use:

* Playwright
* Chromium
* browser DevTools where available

The application is JavaScript-based, so DO NOT rely only on curl, raw HTML, text-mode HTTP requests or search-engine snippets.

Render the application.

Interact with it like a normal user.

---

# DEMO AUTHENTICATION

Find out whether the demo provides:

* a public demo login
* prefilled credentials
* a "demo account"
* guest authentication
* automatic demo login

If public credentials are displayed by the official demo, use them.

Otherwise check environment variables:

AFFIUM_DEMO_EMAIL=
AFFIUM_DEMO_PASSWORD=

If credentials are available there, use them.

DO NOT:

* bypass authentication
* brute-force credentials
* exploit authentication
* enumerate private accounts
* exploit APIs
* access areas not intended for demo users

Only inspect functionality normally accessible through the official demo.

---

# AFFIUM DEMO EXPLORATION REQUIREMENT

Do not simply inspect the homepage.

Explore the ENTIRE reachable application.

Click:

* navigation links
* sidebar links
* dropdowns
* profile menus
* tabs
* filters
* tables
* cards
* buttons
* settings
* notification interfaces
* marketplace entries
* leaderboard filters
* user profiles
* prediction cards
* event cards
* mobile navigation

Open modals.

Inspect responsive layouts.

Inspect logged-out and logged-in flows where available.

---

# AFFIUM ROUTE INVENTORY

Discover all routes yourself.

At minimum investigate whether equivalents exist for:

Landing / Home

Sign In

Sign Up

Forgot Password

Dashboard

Prediction Feed

Sport Line

Event Details

Prediction Creation

User Profiles

Own Profile

Other User Profiles

Followers

Following

Notifications

Wallet

Settings

Leaderboard

Achievements

Rewards

Referrals

Daily Streak

Marketplace

Promo Codes

Partner Offers

Marketing

Affiliate Promotions

Admin Dashboard

Admin Users

Admin Predictions

Admin Content

Admin Advertising

Admin Marketplace

Admin Analytics

Admin Settings

Do not assume that this list is complete.

Discover additional functionality yourself.

---

# AFFIUM PAGE DOCUMENTATION

For EVERY meaningful screen document:

1. Route
2. Page name
3. Purpose
4. User intent
5. Desktop structure
6. Mobile structure
7. Header structure
8. Sidebar structure
9. Navigation behavior
10. Cards
11. Lists
12. Tables
13. Forms
14. Tabs
15. Filters
16. Modals
17. Calls to action
18. Empty states
19. Loading states
20. Error states
21. Notifications
22. Gamification elements
23. Prediction UX
24. Sports-data presentation
25. Affiliate placements
26. Advertising placements
27. Marketplace placements
28. User-profile structure
29. Visual hierarchy
30. Interaction patterns

Take screenshots during research if browser tooling permits.

Store research in:

/docs/reference/affium-demo-analysis.md

Create another document:

/docs/reference/affium-route-map.md

Create:

/docs/reference/affium-to-superbowl-feature-map.md

Example:

Affium football match
→ Superbowl football game

Affium soccer prediction
→ NFL game prediction

Affium tipster
→ NFL predictor

Affium Sport Line
→ Games & Odds

Affium match page
→ NFL Game Center

Affium prediction performance
→ Predictor Record

Affium marketplace
→ Partner Offers & Rewards

---

# DO NOT CLONE AFFIUM ASSETS

Never copy:

* Affium source code
* Affium logos
* Affium branding
* proprietary illustrations
* icons unique to Affium
* marketing copy
* copyrighted images

Reimplement the UX concepts independently.

The result should clearly be a different product.

---

# PHASE 0B

# EXISTING SUPERBOWL.GG SEO AUDIT

This phase is CRITICAL.

Before changing the existing superbowl.gg website, inspect the CURRENT production domain:

https://superbowl.gg

The domain may already rank for valuable search terms.

WE MUST NOT ACCIDENTALLY DESTROY EXISTING SEO VALUE.

Before deployment, crawl the current website.

Create:

/docs/seo/current-site-audit.md

Collect every discoverable indexable URL.

For each URL store:

* URL
* status code
* canonical
* title
* meta description
* H1
* H2 headings
* word count
* internal links
* inbound internal links
* structured data
* robots status
* indexability
* OpenGraph data
* Twitter metadata
* image alt text where relevant

Also discover URLs through:

* sitemap.xml
* robots.txt
* internal links
* canonical references

Create:

/data/seo/current-url-inventory.json

and:

/data/seo/current-url-inventory.csv

---

# PHASE 0C

# SEMRUSH EXISTING KEYWORD AUDIT

Environment variable:

SEMRUSH_API_KEY=

The SEMrush API key MUST:

* only be used server-side
* never appear in client JavaScript
* never appear in logs
* never be committed
* never be included in screenshots
* never be displayed in Admin UI

Default SEO market:

United States.

Configuration:

SEMRUSH_DATABASE=us
SEMRUSH_COUNTRY=US

Make this configurable.

---

# EXISTING SUPERBOWL.GG KEYWORDS

Use SEMrush to discover EVERY relevant organic keyword for:

superbowl.gg

Use the current official SEMrush Domain Organic Search endpoint/documentation.

Retrieve enough data to understand:

keyword

current position

previous position when available

ranking URL

search volume

CPC

competition

traffic estimate / share where available

keyword difficulty where available

SERP features where available

intent where available

results count where available

Do not unnecessarily burn API credits.

Implement pagination carefully.

---

# STORE EXISTING KEYWORDS

Create:

/data/seo/semrush-existing-rankings.json

/data/seo/semrush-existing-rankings.csv

/docs/seo/existing-keywords.md

For every existing ranking classify it:

PROTECT

IMPROVE

CONSOLIDATE

REDIRECT

LOW_VALUE

IRRELEVANT

Existing commercially or informationally relevant rankings should generally be PROTECTED.

---

# SEO PROTECTION RULE

Any URL currently ranking for valuable keywords MUST NOT simply disappear.

For each old URL choose one:

KEEP URL

or

301 REDIRECT

Never:

404 valuable ranking pages

change URLs without redirects

mass-delete ranked content

replace useful content with empty application shells

Create:

/data/seo/redirect-map.csv

Columns:

old_url
new_url
reason
existing_keywords
estimated_value

---

# KEYWORD CANNIBALIZATION

Analyze whether multiple existing pages rank for the same intent.

If multiple pages compete unnecessarily:

identify canonical target page

merge where appropriate

301 old URLs where appropriate

preserve useful unique content

Do not blindly consolidate unrelated intent.

---

# PHASE 0D

# SEMRUSH NFL + SUPER BOWL KEYWORD RESEARCH

After protecting existing rankings, perform LARGE-SCALE keyword research.

We want Superbowl.gg to become an authority for:

NFL

Super Bowl

NFL predictions

NFL picks

NFL games

NFL schedule

NFL scores

NFL standings

NFL playoffs

NFL statistics

NFL odds

football predictions

football analytics

football betting information

American football

football players

football teams

football games

and related search intents.

---

# IMPORTANT SEMRUSH API BEHAVIOR

Use current official SEMrush documentation at implementation time.

For existing domain rankings use the supported Domain Organic Research functionality.

For new keyword analysis prefer the current SEMrush v4 Keyword API where supported.

Do not blindly implement deprecated API endpoints from old tutorials.

If SEMrush v4 does not currently expose a required expansion feature, use the currently supported equivalent or carefully use a legacy endpoint only when necessary.

Implement SEMrush through:

packages/seo/semrush/

Create:

SemrushClient

SemrushDomainService

SemrushKeywordService

SemrushCompetitorService

SemrushGapService

SemrushOpportunityService

Do not call SEMrush directly from UI components.

---

# API CREDIT SAFETY

SEMrush API units cost money.

Therefore:

cache results

persist keyword data

avoid duplicate queries

batch where supported

create configurable limits

Environment:

SEMRUSH_MAX_UNITS_PER_RUN=

SEMRUSH_CACHE_DAYS=30

SEMRUSH_RESEARCH_ENABLED=true

Admin must never accidentally trigger unlimited keyword research.

---

# SEED KEYWORDS

Begin keyword expansion with clusters including:

super bowl

superbowl

super bowl predictions

super bowl picks

super bowl odds

super bowl score

super bowl schedule

super bowl history

super bowl winners

super bowl teams

super bowl matchup

super bowl statistics

super bowl records

super bowl MVP

super bowl halftime

super bowl date

when is the super bowl

where is the super bowl

super bowl location

super bowl stadium

super bowl tickets

super bowl commercials

super bowl results

NFL

NFL predictions

NFL picks

NFL picks today

NFL picks this week

NFL predictions today

NFL predictions this week

NFL odds

NFL odds today

NFL scores

NFL scores today

NFL games today

NFL games tonight

NFL schedule

NFL schedule today

NFL schedule this week

NFL standings

NFL playoff picture

NFL playoffs

NFL playoff predictions

NFL power rankings

NFL stats

NFL player stats

NFL team stats

NFL injuries

NFL injury report

NFL depth chart

NFL roster

NFL matchup

NFL matchups today

NFL betting odds

NFL spreads

NFL moneyline

NFL over under

NFL player props

NFL touchdown props

NFL expert picks

NFL community picks

NFL prediction leaderboard

football predictions

American football predictions

Do NOT assume these are automatically good targets.

Use SEMrush data to validate them.

---

# LONG-TAIL DISCOVERY

Find long-tail opportunities around patterns such as:

[TEAM] vs [TEAM]

[TEAM] vs [TEAM] prediction

[TEAM] vs [TEAM] odds

[TEAM] vs [TEAM] picks

[TEAM] vs [TEAM] stats

[TEAM] schedule

[TEAM] standings

[TEAM] predictions

[TEAM] odds

[PLAYER] stats

[PLAYER] passing yards

[PLAYER] rushing yards

[PLAYER] receiving yards

[PLAYER] touchdown odds

[PLAYER] game log

[PLAYER] injury

[PLAYER] fantasy outlook

NFL week [X] predictions

NFL week [X] picks

NFL week [X] odds

NFL week [X] schedule

NFL week [X] scores

Super Bowl [YEAR]

Super Bowl [YEAR] predictions

Super Bowl [YEAR] odds

Super Bowl [YEAR] teams

Super Bowl [YEAR] score

Super Bowl [YEAR] winner

Super Bowl history

Super Bowl winners by year

Super Bowl MVP list

Super Bowl records

Super Bowl locations

Super Bowl stadiums

---

# KEYWORD METRICS

For candidate keywords retrieve where possible:

search volume

keyword difficulty

intent

CPC

competitive density

SERP features

search trend

result count

existing Superbowl.gg position

existing Superbowl.gg ranking URL

competitor rankings where supported

---

# KEYWORD OPPORTUNITY SCORE

Implement an internal opportunity score.

Example conceptual formula:

OpportunityScore =

SearchDemand
× Relevance
× RankingFeasibility
× ProductFit
× FreshnessPotential
× InternalLinkPotential

divided by:

CompetitionFactor

Do NOT use this exact formula blindly.

Design a sensible normalized scoring model.

Store the logic in:

packages/seo/opportunity-score.ts

Document methodology.

---

# KEYWORD PRIORITY BUCKETS

Classify keywords into:

P0 — Protect existing valuable rankings

P1 — High opportunity / immediate

P2 — High strategic relevance

P3 — Programmatic long-tail

P4 — Editorial / informational

P5 — Experimental

---

# SEARCH INTENT CLASSIFICATION

Classify each keyword:

NAVIGATIONAL

INFORMATIONAL

COMMERCIAL

TRANSACTIONAL

LIVE_EVENT

STATISTICAL

PREDICTION

HISTORICAL

TEAM

PLAYER

GAME

SCHEDULE

SCORE

ODDS

Never target multiple fundamentally different intents with one thin page.

---

# KEYWORD-TO-URL MAP

Create:

/data/seo/keyword-map.csv

Fields:

keyword
cluster
search_volume
difficulty
intent
current_position
current_url
target_url
priority
page_type
status

Every important keyword should have ONE primary target URL.

This prevents keyword cannibalization.

---

# COMPETITOR SEO RESEARCH

Use SEMrush competitor functionality where API access allows.

Identify domains ranking for Superbowl.gg target terms.

Do NOT copy their content.

Analyze:

which topics they cover

content depth

page types

internal linking

SERP intent

keyword gaps

structured page architecture

The objective is to find gaps, not plagiarize.

---

# SEO CONTENT ARCHITECTURE

Build scalable SEO sections.

Examples:

/nfl

/nfl/games

/nfl/schedule

/nfl/scores

/nfl/standings

/nfl/predictions

/nfl/picks

/nfl/odds

/nfl/injuries

/nfl/stats

/nfl/players

/nfl/teams

/nfl/playoffs

/nfl/playoff-picture

/nfl/power-rankings

/nfl/week/[week]

/nfl/week/[week]/predictions

/nfl/week/[week]/odds

/nfl/week/[week]/schedule

/nfl/teams/[teamSlug]

/nfl/teams/[teamSlug]/schedule

/nfl/teams/[teamSlug]/stats

/nfl/teams/[teamSlug]/predictions

/nfl/players/[playerSlug]

/nfl/players/[playerSlug]/stats

/nfl/players/[playerSlug]/game-log

/nfl/games/[gameSlug]

/nfl/games/[gameSlug]/predictions

/nfl/games/[gameSlug]/odds

---

# SUPER BOWL SEO HUB

Create a major authority hub:

/super-bowl

Possible supporting routes where genuine useful content/data exists:

/super-bowl/predictions

/super-bowl/odds

/super-bowl/schedule

/super-bowl/history

/super-bowl/winners

/super-bowl/mvp

/super-bowl/records

/super-bowl/locations

/super-bowl/stadiums

/super-bowl/[year]

Do not create pages simply because a keyword exists.

Every indexable page must provide genuine value.

---

# PROGRAMMATIC SEO RULE

Programmatic pages are allowed ONLY when they contain useful unique data.

Do not produce thousands of nearly identical pages with changed team names.

Each programmatic page should use structured real data including relevant combinations of:

game information

team information

historical statistics

current statistics

prediction community data

odds

injuries

standings

player information

recent form

head-to-head data where available

schedule

community predictions

historical results

contextual internal links

If insufficient unique content/data exists:

NOINDEX the page or do not generate it.

---

# NO SEO SPAM

Never:

keyword stuff

generate hidden text

generate doorway pages

create fake articles

create AI spam pages

repeat the same paragraphs across thousands of routes

inject irrelevant "Super Bowl" terms into unrelated pages

fake author profiles

fake reviews

fake expert claims

fake sportsbook offers

SEO must result from genuinely useful content.

---

# SEO MONITORING SYSTEM

Build an internal SEO admin section:

/admin/seo

Subpages:

/admin/seo/overview

/admin/seo/rankings

/admin/seo/keywords

/admin/seo/opportunities

/admin/seo/pages

/admin/seo/redirects

/admin/seo/technical

/admin/seo/semrush

Display:

existing ranking keywords

ranking movement

ranking URLs

keywords by cluster

keyword opportunities

pages without target keywords

keyword cannibalization

broken redirects

404s

missing metadata

missing canonicals

indexation rules

sitemap status

---

# SEO RESEARCH COMMAND

Create a safe internal CLI command such as:

pnpm seo:research

The command should:

1. Load current existing Superbowl.gg rankings.
2. Load cached results.
3. Refresh stale data.
4. Research configured seed keywords.
5. Generate related opportunities.
6. Score keywords.
7. Produce keyword map.
8. Generate reports.
9. NEVER automatically publish pages.

Separate:

RESEARCH

from:

CONTENT/PAGE DEPLOYMENT.

---

# SEO REPORT OUTPUT

Generate:

/docs/seo/strategy.md

/docs/seo/existing-keywords.md

/docs/seo/keyword-opportunities.md

/docs/seo/content-plan.md

/docs/seo/internal-linking.md

/docs/seo/technical-seo.md

/data/seo/keyword-map.csv

/data/seo/redirect-map.csv

/data/seo/semrush-existing-rankings.csv

/data/seo/semrush-opportunities.csv

At the end of implementation summarize:

Top 50 existing keywords

Top 100 new opportunities

Top keyword clusters

Pages that must be preserved

Recommended new pages

Potential cannibalization

Redirect requirements

---

# SEO PRIORITY

Existing rankings are more important than aesthetic URL preferences.

If an ugly existing URL ranks well:

keep it

OR

301 redirect it only if the migration is clearly justified.

Do not sacrifice SEO for prettier routing.

---

# PHASE 1

# PRODUCT DEFINITION

Superbowl.gg should become a full-featured American Football:

prediction platform

analytics platform

social network

tipster platform

gamification platform

leaderboard platform

sports data portal

affiliate monetization platform

SEO content platform

Users should be able to:

browse NFL games

browse schedules

view scores

view standings

inspect game statistics

inspect team statistics

inspect player statistics

view injuries

view bookmaker odds

publish predictions

follow predictors

build a public prediction history

earn XP

earn virtual Coins

maintain streaks

unlock achievements

compete in leaderboards

browse marketplace offers

receive notifications

share picks

discover trending predictions

---

# IMPORTANT

Superbowl.gg does NOT accept sportsbook bets itself.

When affiliate sportsbook offers exist:

the user leaves Superbowl.gg and completes any transaction on the partner website.

The Superbowl.gg wallet is:

VIRTUAL CURRENCY ONLY.

Coins may NOT be withdrawn for cash.

---

# PRODUCT POSITIONING

The product should feel like a combination of:

sports analytics

NFL community

prediction network

tipster leaderboard

live game center

odds comparison site

gamification app

American football portal

It should NOT look like a generic SaaS dashboard.

---

# PRIMARY NAVIGATION

Desktop:

SUPERBOWL

Games

Predictions

Leaderboard

Stats

Marketplace

Search

Notifications

Coins

Profile

Logged out:

Sign In

Join Free

Mobile bottom navigation:

Home

Games

Predict

Leaderboard

Profile

---

# CORE ROUTES

Implement at minimum:

/

/games

/games/[gameId]

/predictions

/predictions/[predictionId]

/leaderboard

/leaderboard/weekly

/leaderboard/monthly

/leaderboard/season

/leaderboard/all-time

/users/[username]

/users/[username]/predictions

/users/[username]/followers

/users/[username]/following

/marketplace

/marketplace/[offerSlug]

/achievements

/rewards

/referrals

/notifications

/wallet

/settings

/how-it-works

/affiliate-disclosure

/responsible-gaming

/privacy

/terms

PLUS all useful SEO routes defined above.

---

# AUTH

/auth/sign-in

/auth/sign-up

/auth/forgot-password

/auth/reset-password

/auth/verify-email

---

# ADMIN

/admin

/admin/users

/admin/games

/admin/predictions

/admin/moderation

/admin/sports-data

/admin/providers

/admin/bookmakers

/admin/affiliate-partners

/admin/affiliate-offers

/admin/affiliate-clicks

/admin/conversions

/admin/ads

/admin/marketplace

/admin/rewards

/admin/gamification

/admin/achievements

/admin/notifications

/admin/content

/admin/analytics

/admin/seo

/admin/audit-log

/admin/settings

---

# HOME PAGE

Do not make the homepage primarily a SaaS landing page.

It should immediately provide NFL value.

Suggested hierarchy:

SUPERBOWL.GG

Predict football.
Build your record.
Beat the crowd.

[Explore Games]
[Make a Prediction]

Then:

LIVE / TODAY'S GAMES

Then:

TRENDING PREDICTIONS

Then:

COMMUNITY CONSENSUS

Then:

TOP PREDICTORS

Then:

NFL STANDINGS / WEEK CONTEXT

Then:

LEADERBOARD

Then:

TRENDING NFL CONTENT

Then:

PARTNER OFFERS

Then:

FOOTER / SEO navigation

For anonymous users use discovery content.

For authenticated users personalize the homepage.

---

# DESIGN SYSTEM

Design Superbowl.gg independently.

Target:

modern

premium

dark

sports-native

data-centric

high-energy

clean

slightly futuristic

Suggested:

deep near-black / navy background

slightly lighter cards

electric blue / cyan primary accent

white primary text

muted slate secondary text

green for positive results

red only for losses/errors

Avoid excessive gradients.

Avoid generic AI dashboard styling.

Subtle visual language may use:

yard lines

field markings

playbook paths

scoreboard typography

football geometry

Do not make it cheesy.

---

# BRAND CONFIGURATION

Create centralized branding.

BrandSettings:

brandName

brandShortName

domain

logoUrl

faviconUrl

primaryColor

secondaryColor

backgroundColor

surfaceColor

textColor

mutedTextColor

borderColor

supportEmail

socialLinks

legalCompanyName

Default:

brandName = Superbowl

domain = superbowl.gg

Do not hardcode the name across 100 components.

---

# SPORTS DATA

Create provider abstraction.

SportsProvider:

getLeagues()

getTeams()

getSchedule()

getGames()

getGame()

getStandings()

getPlayers()

getPlayer()

getTeamStats()

getPlayerStats()

getInjuries()

getGameStats()

getPlayByPlay()

Use a professional sports-data provider.

Preferred initial implementation:

SportsDataIO

Keep architecture provider-independent.

---

# ODDS

Create:

OddsProvider

Support:

Moneyline

Spread

Total

Player props where available

passing yards

passing touchdowns

interceptions

rushing yards

receiving yards

receptions

touchdowns

Use:

The Odds API

or another configured professional odds provider.

Never expose provider API keys client-side.

---

# SPORTS MODEL

League

Season

Week

Team

Player

Game

Venue

Standing

TeamGameStats

PlayerGameStats

Injury

ProviderEntityMapping

Never use external API IDs as primary internal database IDs.

---

# GAME MODEL

Game:

id

leagueId

seasonId

week

seasonType

homeTeamId

awayTeamId

scheduledAt

status

homeScore

awayScore

quarter

clock

venue

broadcast

createdAt

updatedAt

providerMetadata

---

# GAME CENTER

/games/[gameId]

Display:

Away Team

Home Team

score

kickoff

stadium

game status

quarter

clock

Tabs:

Overview

Predictions

Odds

Stats

Players

Overview:

community consensus

injury report

recent form

standings context

popular predictors

game information

---

# COMMUNITY PREDICTIONS

Prediction types:

MONEYLINE

SPREAD

TOTAL

PLAYER_PROP

Prediction:

id

userId

gameId

marketType

marketKey

selection

line

oddsAtCreation

sportsbookReference

confidence

analysis

virtualUnits

status

result

publishedAt

lockedAt

settledAt

---

# PREDICTION CREATION

Flow:

Choose Game

→ Choose Market

→ Choose Outcome

→ Choose Confidence

→ Optional Analysis

→ Preview

→ Publish

When published store an immutable snapshot of:

market

selection

line

odds

provider

timestamp

Once game starts:

LOCK prediction.

Users may NOT remove losing picks.

Prediction history is permanent except legitimate administrative voids.

---

# AUTOMATIC SETTLEMENT

Worker automatically settles predictions.

Possible states:

PENDING

WIN

LOSS

PUSH

VOID

Settlement must be:

idempotent

auditable

transactional

Store:

settlementReason

settlementSource

settlementVersion

settledAt

---

# PERFORMANCE STATISTICS

Track:

predictions

wins

losses

pushes

win rate

units

ROI

average odds

current streak

longest streak

weekly stats

monthly stats

season stats

all-time stats

Performance must come from genuine settled predictions.

---

# PUBLIC PROFILE

Display:

avatar

username

display name

bio

joined date

followers

following

level

XP

achievements

streak

rank

Stats:

Win Rate

ROI

Units

Predictions

Charts:

cumulative units

accuracy over time

prediction activity

Tabs:

Predictions

Stats

Achievements

---

# FOLLOW SYSTEM

UserFollow:

followerId

followingId

createdAt

Allow notification preference:

notifyOnFollowedPrediction

---

# PREDICTION FEED

Filters:

Following

Trending

Newest

Top

NFL

NCAAF when enabled

Market

Game

Confidence

Prediction cards:

avatar

username

record

game

selection

odds

line

confidence

analysis

published timestamp

settlement result

social engagement

---

# TRENDING

Implement deterministic scoring.

Signals may include:

recency

views

likes

comments

predictor reputation

followers

engagement velocity

Do not randomly sort.

---

# LEADERBOARDS

Periods:

Weekly

Monthly

Season

All Time

Metrics:

Points

Accuracy

ROI

Units

Streak

Use minimum sample sizes.

Example defaults:

Weekly:
5 settled predictions

Monthly:
15

Season:
30

Admin configurable.

---

# GAMIFICATION

Centralized event-driven gamification engine.

Events:

USER_REGISTERED

EMAIL_VERIFIED

PROFILE_COMPLETED

PREDICTION_CREATED

PREDICTION_WON

DAILY_LOGIN

STREAK_INCREMENTED

FOLLOW_RECEIVED

REFERRAL_SIGNUP

REFERRAL_ACTIVATED

ACHIEVEMENT_UNLOCKED

---

# XP

Example defaults:

Account created: 50

Profile complete: 50

Prediction: 10

Correct prediction: 25

Daily activity: 5

7-day streak: 100

Referral activated: 200

Admin configurable.

---

# LEVELS

Example:

Rookie

Prospect

Starter

Veteran

All-Pro

Elite

Legend

XP thresholds configurable.

---

# COINS

Virtual currency only.

Implement immutable ledger.

Wallet

WalletTransaction

Transaction types:

REWARD

ACHIEVEMENT

STREAK

REFERRAL

MARKETPLACE_PURCHASE

ADMIN_ADJUSTMENT

Every balance modification creates a ledger transaction.

---

# DAILY STREAKS

Track:

currentStreak

longestStreak

lastActivityDate

Example milestones:

1

3

7

14

30

100

Use user timezone where possible.

---

# ACHIEVEMENTS

Examples:

First Pick

Hot Hand

On Fire

Perfect Week

NFL Expert

Community Favorite

Veteran

Achievements configurable in Admin.

Models:

Achievement

UserAchievement

---

# REFERRALS

Each user receives referral code.

Example:

superbowl.gg/r/JOEL123

Track:

click

signup

email verification

activation

Prevent:

self referral

duplicate rewards

fake repeated activations

---

# NOTIFICATIONS

Types:

NEW_FOLLOWER

FOLLOWED_USER_PREDICTION

PREDICTION_SETTLED

ACHIEVEMENT_UNLOCKED

STREAK_REWARD

REFERRAL_REWARD

MARKETPLACE_PURCHASE

SYSTEM

Support:

unread badge

mark read

mark all read

notification preferences

---

# MARKETPLACE

Categories:

Sportsbook Offers

Partner Deals

Promo Codes

Digital Rewards

Merchandise Offers

MarketplaceOffer:

title

slug

description

image

partner

category

coinPrice

promoCode

destinationUrl

affiliateLinkId

startAt

endAt

inventory

geoRestrictions

ageRestrictions

status

---

# AFFILIATE SYSTEM

Create internal affiliate redirect system:

/go/[slug]

Create:

AffiliatePartner

AffiliateOffer

AffiliatePlacement

AffiliateClick

AffiliateConversion

Track:

campaign

user

session

country

device

referrer

UTM

placement

timestamp

Conversions support:

webhook

CSV import

manual import

---

# GEO COMPLIANCE

Offers may have:

allowedCountries

blockedCountries

allowedRegions

blockedRegions

minimumAge

Do not display restricted sportsbook CTAs where not permitted.

Community predictions should remain available independently.

---

# AD SYSTEM

Create:

AdCampaign

AdCreative

AdPlacement

AdImpression

AdClick

Possible placements:

HOME

GAME_PAGE

PREDICTION_FEED

LEADERBOARD

MARKETPLACE

Targeting:

country

region

league

device

schedule

---

# ADMIN PANEL

Admin must be a real operational system.

Roles:

USER

MODERATOR

EDITOR

ADMIN

SUPER_ADMIN

Dashboard:

Registered Users

DAU

WAU

MAU

Predictions

Active Games

Affiliate Clicks

Conversions

Affiliate Revenue

Ad Impressions

Marketplace Redemptions

SEO Organic Keywords

SEO Estimated Traffic

SEO Opportunities

Use genuine DB/API data.

---

# ADMIN USERS

Search and filter.

Display:

profile

account

status

performance

predictions

wallet

referrals

achievements

moderation history

Actions:

suspend

unsuspend

change role

wallet adjustment

Every sensitive action creates AdminAuditLog.

---

# ADMIN SPORTS DATA

Display:

provider

status

last sync

failed sync

error

games synced

odds synced

cache status

Provide real:

SYNC NOW

functionality.

---

# ADMIN GAMIFICATION

Configure:

XP rewards

Coin rewards

levels

streak milestones

leaderboard thresholds

referral criteria

achievements

without deployment.

---

# ADMIN SEO

This section is REQUIRED.

Dashboard cards:

Organic Keywords

Top 3 Rankings

Top 10 Rankings

Top 100 Rankings

Estimated Organic Traffic

Protected Keywords

New Opportunities

Ranking Gains

Ranking Losses

Pages With SEO Problems

Keyword Cannibalization

Display historical snapshots from stored SEMrush data.

---

# AUTHENTICATION

Implement production-ready authentication:

email/password

email verification

forgot password

reset password

secure sessions

logout

Optional:

Google OAuth

Never store plaintext passwords.

---

# DATABASE

PostgreSQL.

Use Prisma or another mature typed ORM.

Production migrations required.

Do not rely exclusively on `db push`.

---

# DATABASE MODELS

At minimum:

User

Account

Session

VerificationToken

Profile

UserFollow

UserFavoriteTeam

League

Season

Team

Player

Game

Standing

GameTeamStats

PlayerGameStats

Injury

ProviderEntityMapping

Bookmaker

OddsSnapshot

Market

MarketOutcome

Prediction

PredictionSettlement

Wallet

WalletTransaction

GamificationEvent

UserXP

Level

Achievement

UserAchievement

DailyStreak

Referral

ReferralEvent

Notification

NotificationPreference

AffiliatePartner

AffiliateOffer

AffiliatePlacement

AffiliateClick

AffiliateConversion

AdCampaign

AdCreative

AdPlacement

AdImpression

AdClick

MarketplaceCategory

MarketplaceOffer

MarketplaceRedemption

Jurisdiction

AnalyticsEvent

ContentPage

FeatureFlag

AdminAuditLog

IntegrationSyncLog

SeoKeyword

SeoKeywordSnapshot

SeoPage

SeoPageKeyword

SeoCompetitor

SeoOpportunity

SeoRedirect

SeoResearchRun

---

# ODDS HISTORY

Never overwrite old odds.

OddsSnapshot:

gameId

bookmakerId

marketKey

outcome

price

line

capturedAt

This enables:

odds movement

pick verification

historical comparisons

---

# WORKERS

Create background workers:

SYNC_SCHEDULE

SYNC_TEAMS

SYNC_PLAYERS

SYNC_STANDINGS

SYNC_INJURIES

SYNC_ODDS

SYNC_LIVE_GAMES

SETTLE_PREDICTIONS

PROCESS_GAMIFICATION

SEND_NOTIFICATIONS

SEO_REFRESH_EXISTING_RANKINGS

SEO_RESEARCH_KEYWORDS

SEO_TECHNICAL_AUDIT

Jobs must:

retry safely

be idempotent

log errors

---

# REAL-TIME GAME DATA

Game Center should update live information through:

polling

SSE

or WebSockets

Choose the simplest reliable architecture.

Do not overengineer.

---

# SEARCH

Global search across:

Games

Teams

Players

Users

Predictions

Group results by type.

---

# SEO TECHNICAL REQUIREMENTS

Implement:

SSR / server rendering where appropriate

semantic HTML

canonical URLs

dynamic metadata

OpenGraph

Twitter cards

robots.txt

XML sitemaps

breadcrumbs

structured data

pagination

correct HTTP status codes

301 redirects

clean URL structure

---

# SITEMAPS

Do not put millions of URLs in one sitemap.

Create sitemap index.

Possible:

sitemap-pages.xml

sitemap-games.xml

sitemap-teams.xml

sitemap-players.xml

sitemap-predictions.xml

sitemap-super-bowl.xml

Only include canonical indexable URLs.

---

# STRUCTURED DATA

Use appropriate schema.org structures where applicable.

Potential structures:

SportsEvent

SportsTeam

Person

BreadcrumbList

Organization

WebSite

Article where genuine editorial content exists

FAQPage only when actually appropriate and supported

Never create fake review schema.

Never create misleading structured data.

---

# INTERNAL LINKING ENGINE

SEO success requires strong internal linking.

Examples:

Game page
→ home team
→ away team
→ week
→ predictions
→ odds
→ players

Team
→ upcoming games
→ recent results
→ relevant players
→ standings
→ team predictions

Player
→ team
→ games
→ relevant statistics

Week page
→ every game
→ predictions
→ schedule
→ scores

Super Bowl page
→ year
→ teams
→ history
→ winner
→ MVP
→ related games

Create contextual links server-side.

Avoid enormous spammy footer link blocks.

---

# DYNAMIC META TITLES

Generate useful titles.

Examples conceptually:

Chiefs vs Bills Predictions, Odds & Picks | Superbowl.gg

NFL Week 12 Predictions & Picks | Superbowl.gg

NFL Schedule Today | Superbowl.gg

NFL Standings | Superbowl.gg

Super Bowl Predictions, Odds & Analysis | Superbowl.gg

Do not blindly repeat keywords.

Titles should reflect actual page content.

---

# CONTENT QUALITY

Automated text may assist with summaries, but factual information must be derived from real structured data.

Never publish invented:

injuries

scores

records

odds

historical facts

statistics

player information

If AI-generated summaries are implemented, store:

provider

model

generatedAt

sourceDataVersion

Hide AI summaries completely if provider isn't configured.

---

# SOCIAL SHARING

Generate dynamic OG images for:

games

predictions

profiles

leaderboards

Example:

JOEL predicts

KC -3.5

Confidence 4/5

Record 38–21

Superbowl.gg

---

# RESPONSIVE DESIGN

Test:

375

390

430

768

1024

1280

1440+

No unexpected horizontal scrolling.

Game/odds tables need usable mobile representations.

---

# ACCESSIBILITY

Implement:

keyboard navigation

focus states

semantic controls

accessible labels

proper contrast

aria attributes where required

Do not use clickable divs instead of buttons.

---

# PERFORMANCE

Aim for excellent Core Web Vitals.

Use:

server rendering

caching

image optimization

pagination

lazy loading

route-level code splitting

Avoid sending huge sports datasets to browsers.

---

# CACHING

Sports data:

cache according to volatility.

Live game:
seconds

Upcoming game:
minutes

Standings:
minutes/hours

Team metadata:
days

Historical completed games:
long duration

SEMrush:

typically much longer cache

Do not spend API credits repeatedly on unchanged keyword data.

---

# ENVIRONMENT VARIABLES

Create:

.env.example

At minimum:

DATABASE_URL=

REDIS_URL=

APP_URL=https://superbowl.gg

AUTH_SECRET=

EMAIL_FROM=

RESEND_API_KEY=

SPORTSDATAIO_API_KEY=

SPORTSDATAIO_BASE_URL=

THE_ODDS_API_KEY=

THE_ODDS_API_BASE_URL=

SEMRUSH_API_KEY=

SEMRUSH_DATABASE=us

SEMRUSH_COUNTRY=US

SEMRUSH_RESEARCH_ENABLED=true

SEMRUSH_MAX_UNITS_PER_RUN=

SEMRUSH_CACHE_DAYS=30

AFFIUM_DEMO_EMAIL=

AFFIUM_DEMO_PASSWORD=

ADMIN_EMAIL=

STORAGE_ENDPOINT=

STORAGE_REGION=

STORAGE_BUCKET=

STORAGE_ACCESS_KEY_ID=

STORAGE_SECRET_ACCESS_KEY=

GEOIP_PROVIDER=

GEOIP_API_KEY=

AI_PROVIDER=

AI_API_KEY=

NEXT_PUBLIC_APP_NAME=Superbowl

NEXT_PUBLIC_APP_URL=https://superbowl.gg

Never expose:

SEMRUSH_API_KEY

SPORTSDATAIO_API_KEY

THE_ODDS_API_KEY

AUTH_SECRET

in NEXT_PUBLIC variables.

---

# RECOMMENDED STACK

Use current stable versions at implementation time.

Recommended:

Next.js

React

TypeScript strict

Tailwind

shadcn/ui or equivalent primitives

PostgreSQL

Prisma

Redis

Zod

TanStack Query when helpful

Recharts

Playwright

Vitest

Do not intentionally use obsolete library versions.

---

# REPOSITORY ORGANIZATION

Suggested:

apps/

web/

worker/

packages/

db/

auth/

sports/

odds/

seo/

analytics/

gamification/

affiliate/

core/

ui/

config/

docs/

data/

Do not overengineer if a simpler structure provides better maintainability.

---

# TESTING

UNIT:

moneyline settlement

spread settlement

totals settlement

push settlement

player prop settlement

XP

streak

wallet

leaderboards

affiliate geo checks

SEO opportunity scoring

redirect logic

keyword mapping

INTEGRATION:

registration

login

prediction

settlement

follow

wallet reward

referral

marketplace

affiliate redirect

admin controls

SEMrush cache

SEO research run

E2E PLAYWRIGHT:

signup

login

Games

Game Center

publish prediction

profile

follow user

leaderboard

wallet

marketplace

admin

SEO dashboard

mobile navigation

---

# PRODUCTION DATA

Development/test fixtures are allowed ONLY outside production.

Production must not show:

fake games

fake odds

fake profiles presented as real users

fake rankings

fake affiliate conversions

fake analytics

fake marketplace deals

fake SEMrush numbers

---

# MIGRATION SEO TEST

Before final deployment create an automated migration test.

For every protected old URL:

ensure either:

HTTP 200 equivalent useful page

OR

HTTP 301 to correct replacement

Never:

302 permanent migrations

404 important ranking URL

redirect chains

redirect loops

---

# PREDEPLOY SEO COMPARISON

Generate:

/docs/seo/predeploy-comparison.md

Include:

Current indexed URLs

New indexed URLs

Preserved URLs

Redirected URLs

Removed URLs

Protected keywords

Potential risk keywords

Canonical changes

Title changes

Content changes

No deployment should intentionally delete valuable ranking pages without explanation.

---

# OBSERVABILITY

Structured logs.

Include:

requestId

jobId

sync provider

settlement events

affiliate errors

SEO research runs

admin actions

Never log secrets.

---

# SECURITY

Implement:

secure password hashing

CSRF defense where relevant

rate limiting

authorization

RBAC

input validation

safe redirect handling

secure sessions

audit logs

upload validation

Never expose API keys.

---

# LEGAL / BRAND SAFETY

Do not scrape or copy:

NFL logos

team logos

NFL photography

broadcast footage

Affium assets

Use licensed assets only where provider licensing explicitly allows them.

Otherwise create neutral team representations using:

abbreviations

colors where allowed

generic geometric badges

Keep branding configurable.

---

# RESPONSIBLE GAMING

Because affiliate sportsbook links may exist:

create:

/responsible-gaming

/affiliate-disclosure

Clearly distinguish:

community predictions

from:

sponsored sportsbook offers.

Mark ads/affiliate placements visibly.

Never use misleading terms such as:

guaranteed win

easy money

guaranteed profit

risk-free betting

---

# DOCUMENTATION

Create:

README.md

/docs/architecture.md

/docs/database.md

/docs/auth.md

/docs/sports-data.md

/docs/odds.md

/docs/predictions.md

/docs/gamification.md

/docs/affiliate-system.md

/docs/admin.md

/docs/deployment.md

/docs/environment-variables.md

/docs/testing.md

/docs/reference/affium-demo-analysis.md

/docs/reference/affium-route-map.md

/docs/reference/affium-to-superbowl-feature-map.md

/docs/seo/current-site-audit.md

/docs/seo/existing-keywords.md

/docs/seo/keyword-opportunities.md

/docs/seo/strategy.md

/docs/seo/content-plan.md

/docs/seo/internal-linking.md

/docs/seo/technical-seo.md

/docs/seo/predeploy-comparison.md

---

# IMPLEMENTATION ORDER

Execute in this order:

1. Browser-inspect demo.affiumsport.com.

2. Discover every useful Affium route.

3. Document Affium UX.

4. Crawl existing superbowl.gg.

5. Inventory existing URLs.

6. Query SEMrush for current superbowl.gg organic rankings.

7. Identify ranking URLs that must be protected.

8. Research NFL/Super Bowl keywords.

9. Generate keyword clusters.

10. Create keyword-to-URL map.

11. Generate redirect plan.

12. Design Superbowl information architecture.

13. Initialize application.

14. Configure database.

15. Implement auth.

16. Implement original Superbowl design system.

17. Implement navigation.

18. Implement sports provider abstraction.

19. Integrate real NFL data.

20. Integrate real odds.

21. Build Games pages.

22. Build SEO NFL pages.

23. Build Super Bowl SEO hub.

24. Build prediction engine.

25. Build settlement worker.

26. Build profiles.

27. Build follow system.

28. Build prediction feed.

29. Build leaderboards.

30. Build XP.

31. Build levels.

32. Build Coins.

33. Build streaks.

34. Build achievements.

35. Build referrals.

36. Build notifications.

37. Build marketplace.

38. Build affiliate tracking.

39. Build advertising.

40. Build Admin.

41. Build Admin SEO.

42. Implement structured metadata.

43. Implement structured data.

44. Implement sitemap index.

45. Implement internal linking.

46. Implement redirects.

47. Implement analytics.

48. Implement legal/compliance pages.

49. Implement tests.

50. Run TypeScript.

51. Run lint.

52. Run unit tests.

53. Run integration tests.

54. Run Playwright.

55. Browser test every major route.

56. Test mobile.

57. Check browser console.

58. Crawl finished app.

59. Compare with old SEO inventory.

60. Fix SEO regressions.

61. Update documentation.

DO NOT spend the entire run only writing documentation.

IMPLEMENT THE PRODUCT.

---

# CODEBASE FINAL AUDIT

Search entire repository for:

TODO

FIXME

MOCK

DUMMY

PLACEHOLDER

COMING SOON

LOREM IPSUM

FAKE

Review every occurrence.

Remove unfinished production functionality.

Search for:

SEMRUSH API key

sports provider keys

database credentials

auth secrets

Ensure no secrets are committed.

---

# FINAL BROWSER QA

Test as:

Anonymous User

Registered User

Admin

Test every important screen.

Test:

sign up

login

password recovery

Games

Game Center

Odds

Prediction creation

Prediction feed

Profile

Follow

Leaderboard

XP

Coins

Streak

Achievements

Referral

Notifications

Marketplace

Affiliate links

Admin

SEO Admin

Mobile navigation

---

# SEO FINAL QA

Verify:

robots.txt

sitemap

canonicals

metadata

structured data

redirects

404s

indexability

server-rendered content

internal links

pagination

duplicate pages

duplicate titles

duplicate H1s

keyword cannibalization

protected URLs

---

# ACCEPTANCE CRITERIA

The project is not complete until:

Affium demo has been analyzed with a real browser.

Affium's relevant functionality has been mapped.

Existing Superbowl.gg URLs have been audited.

Existing Superbowl.gg SEMrush keywords have been downloaded.

Valuable current rankings have a preservation strategy.

New NFL/Super Bowl keyword research has been performed.

Keyword-to-page mapping exists.

Redirect mapping exists.

Real authentication works.

Real NFL data works.

Real odds integration works.

Game Center works.

Prediction publishing works.

Predictions lock correctly.

Settlement works.

Profiles work.

Public prediction histories work.

Following works.

Leaderboards work.

Gamification works.

XP works.

Levels work.

Coins ledger works.

Achievements work.

Streak works.

Referral tracking works.

Notifications work.

Marketplace works.

Affiliate tracking works.

Admin works.

SEO Admin works.

SEO routes work.

Structured metadata works.

Sitemaps work.

Responsive design works.

No production mocks exist.

No important buttons are dead.

No important pages are placeholders.

Lint passes.

TypeScript passes.

Tests pass.

---

# FINAL RESPONSE TO ME

When everything possible has been implemented, provide:

## 1. AFFIUM ANALYSIS

List every Affium Demo page discovered.

Explain which concepts were reproduced.

Explain which were intentionally changed.

## 2. IMPLEMENTED SUPERBOWL ROUTES

List every implemented route.

## 3. PRODUCT FEATURES

Explain every major feature.

## 4. SPORTS INTEGRATIONS

List providers and APIs.

## 5. DATABASE

Summarize schema.

## 6. BACKGROUND WORKERS

Explain scheduled jobs.

## 7. ADMIN

List administration capabilities.

## 8. SEMRUSH SEO ANALYSIS

Report:

existing organic keywords

important protected keywords

current ranking URLs

top keyword opportunities

NFL keyword clusters

Super Bowl keyword clusters

long-tail opportunities

keyword gaps

## 9. SEO MIGRATION

Show:

URLs preserved

URLs redirected

URLs removed

reasons

## 10. TOP SEO OPPORTUNITIES

Give me the top 50 highest-priority new keyword targets including:

keyword

volume

difficulty

intent

target URL

reason

## 11. ENVIRONMENT VARIABLES

List everything I still need to configure.

## 12. THIRD-PARTY SERVICES

List subscriptions/API credentials still required.

## 13. TEST RESULTS

Provide:

TypeScript result

lint result

unit test result

integration result

Playwright result

## 14. UNAVAILABLE FEATURES

Clearly identify anything that could not operate because credentials or external provider access were unavailable.

Do not falsely claim a feature was completed if it was not.

---

# ABSOLUTE FINAL INSTRUCTION

Do not return only an analysis.

Do not return only screenshots.

Do not return only a design.

Do not return only a TODO list.

Do not build merely a landing page.

Do not build a frontend with fake data.

Do not sacrifice existing Superbowl.gg SEO rankings.

First understand:

demo.affiumsport.com

and:

the existing superbowl.gg SEO footprint.

Then build:

# SUPERBOWL.GG

as a production-ready American Football prediction, analytics, community, gamification, affiliate and SEO platform designed to grow substantial organic search traffic around NFL and Super Bowl topics.
