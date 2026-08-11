# Affium Demo Analysis

Analysis of `https://demo.affiumsport.com/` performed with Playwright + Chromium
(authored during Superbowl.gg v2 recon). Credentials used: official demo account
(`demoaccount`, password provided by the project owner).

## Stack

- **Framework:** Create React App (CRA) SPA — `static/js/main.45c21d19.js` (3.4 MB)
- **Routing:** React Router v6 (`path:"/..."` literals in the bundle)
- **UI:** Shopify Polaris components + FontAwesome 5
- **Realtime:** Socket.io (engine.io polling, EIO=4)
- **API base:** `https://demo-api.affiumsport.com/api` (REACT_APP_BASE_API_URL)
- **Auth:** multi-step: username/email → password (OAuth Google + Facebook present)
- **Tracking:** GTM, Hotjar, Facebook Pixel, Google AdSense
- **Locale:** `lang="uk"` (Ukrainian), EN UI toggle
- **Currency:** virtual "CAP" coins (not real money; no sportsbook transactions)

## Discovered Routes (from router + crawl)

| Route | Page | Auth |
|---|---|---|
| `/` | Marketing home: "A Social Platform for Sports Analysts", 1000-coin signup bonus, stats counters, 3-step how-it-works | public |
| `/signin`, `/login` | Two-step login (username → password) | public |
| `/signup` | Registration (email; referral param `?ref=CODE`) | public |
| `/register` | Alias of signup | public |
| `/verifyemail`, `/checkmail` | Email verification flow | public |
| `/resetpassword`, `/setnewpassword` | Password reset | public |
| `/loginchangeusername` | Change username after OAuth | auth |
| `/feed` | Prediction feed (Recommended / Following, filters, sort) | auth |
| `/sportline?key=line` | "Sport Line" — betting-style event grid + prediction coupon (bet slip) | public |
| `/predictions` | All predictions list | public |
| `/predictions/:gameId` | Event/match page (oddly keyed by gameId) | public |
| `/leaderboard` | Leading predictors (All time / filters) | public |
| `/wallet` | CAP coins: balance, collect ladder, coin history, achievements w/ progress | auth |
| `/notification` | Notifications (All / Predictions / Users activity) | auth |
| `/setting`, `/settingaccount` | Settings (General / Profile / Security, language) | auth |
| `/userprofile`, `/profile/:getUsername` | Own + other user profiles, tabs Predictions/Statistics | auth/public |
| `/referral` | Invite system: code + link, 500/500 CAP, activation condition | auth |
| `/achievements` | Achievement hub: categories, LEVEL 1/5, PROGRESS, AWARD | auth |
| `/chart` | Analytics chart (empty shell in demo) | auth |
| `/marketplace` | Store: real products for CAP coins | public |
| `/admin` | Admin (redirects to profile for non-admins) | admin |
| `/privacypolicy`, `/cookie` | Legal pages | public |

## Key UX Patterns

### Wallet (/wallet)
- Balance + "Collected coins", "Earned coins", "Spent coins" counters
- **Daily collect ladder**: Day1 +10, Day2 +15, Day3 +20, Day4 +25, Day5 +30, Day6 +35, Day7 +40, each next day +50
- Achievements inline with `LEVEL 1/5`, `PROGRESS 3286/10000`, `AWARD 250`
- History table with tabs: Collected / Earned / Spent / Achievements / Activity

### Prediction feed (/feed)
- Tabs: Recommended / Following; "Add prediction" CTA
- Filters + "Sort by: Newest"
- Card: league · event datetime · teams · market ("Full-time result") · selection (П1/П2/Х — home/away/draw) · odds · staked coins · possible gain · type (Pre-game) · status (PENDING/WON) · like/comment counts
- Parlay cards: "+1 events / Open prediction"

### Sport Line (/sportline?key=line)
- Tabs: LINE / LIVE / POPULAR LEAGUES / ALL SPORTS
- Grid rows per event with `1 X 2 +` cells (home/draw/away/expanded)
- **Prediction coupon** sidebar: click odds → coupon → submit combined prediction

### Leaderboard (/leaderboard)
- Columns: # · Predictor (avatar + @username) · Predictions · Avg. coef. · SPC (success %) · Sport · CAP coins
- Time-period filter ("All time", weekly/monthly/season equivalents)

### Referral (/referral)
- Code + `signup?ref=CODE` link; referrer gets 500 CAP, friend gets 500 CAP
- Activation: friend registers **and** makes 5 successful predictions with odds ≥ 1.6
- Overview: invited friends, earned coins, pending; 3-step explainer

### Achievements (/achievements)
- Groups: Exclusive / Sports analyst / Collector / Influencer / Reliable partner
- Each: LEVEL 1/5, PROGRESS n/m, AWARD coins; "Claim your reward"; "Completed"

### Marketplace (/marketplace)
- Real products with coin price: Nike jacket 50 000, Planet Fitness 45 000, ESPN+ 40 000, Adidas 40 000, MyProtein 35 000, Netflix 15 000

### Notifications (/notification)
- Tabs All / Predictions / Users activity / Unsuccessful prediction
- "Your prediction [ Team A - Team B | Full-time result - П1 ] is successful/unsuccessful."

## API Endpoints (from network capture)

- `POST /auth/getuserName`, `/auth/login`
- `GET /auth/getHomePageData`, `/auth/getSignUpReward`
- `GET /PredictionOrder/getLatestPrediction?id=`, `getPredictionOrder?pageSize=`, `getPredictionOrderList?pageSize=&pageNumber=`, `getTopPrediction?id=`, `getAnalyticsGraph?analytics=week&id=`
- `GET /coin/getUserCoin`, `getCollcetCoin`, `getCoinHistory?coinType=COLLECT|EARN`, `getAnalyticsUserCoin?id=`
- `GET /admin/getRewardConfig`
- `GET /league/getPopularEvents`, `getPopularLeauge`
- `GET /notification/getNotification`, `getAllNotification?page=&size=`
- `GET /sport/getAllSport?`
- `GET /sportline/getSportEvents?type=line`, `getTournaments?type=line`
- `GET /users/getProfile`, `getTopUsers?timePeriod=ALL_TIME`, `getUserCoin`, `getUserRefCode`, `getUserReferrals`, `getUserRewards`, `getUserRewardsCount`, `getUserCurrentRewards?userId=`, `getAllProduct`
- Socket.io for realtime (EIO=4)
- Additional endpoints from bundle: `/league/createPrediction`, `/sportline/addGameVote`, `/users/followUser`, `/users/unFollowUser`, `/coin/collectCoins`, `/auth/changePassword`, `/users/changeEmail`, `/notification/clearAllNotification`, `/admin/addProduct`, `/admin/updateRewardConfig`, `/giveaway/creategiveaway`, `/users/updateprofile`, `/users/updateEmail`, `/users/updateUserNewPageStatus`, `/users/addReward`, `/auth/varifyEmail`, `/auth/forgotPassword`, `/auth/checkValidationType`, `/auth/updateProfile`

## Demo account observations

- Post-login landing: `/userprofile`; default demo user "Affium Sport @demoaccount", 145 predictions, 1 follower, 0 following
- Demo feed shows WON/PENDING statuses, parlay cards, coin staking
- `/admin` is role-gated (demo user is not admin)
