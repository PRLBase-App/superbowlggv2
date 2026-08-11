# Affium → Superbowl.gg Feature Map

Every Affium demo concept and where it lands in Superbowl.gg. Superbowl.gg is an
**original** implementation (original code, design, copy) — only the *product
concepts* are reproduced, reimagined for American Football (NFL first).

| Affium (soccer) | Superbowl.gg (American football) | Notes |
|---|---|---|
| Football match | NFL game | Provider-neutral Game model |
| Sport Line (`/sportline`) | Games & Odds (`/games`) + Game Center | Grid + coupon → odds + picks |
| Prediction coupon (1 X 2 +) | Prediction builder (Moneyline / Spread / Total / Player Prop) | Same click-to-build flow |
| Tipster profile (`@demoaccount`) | Predictor profile (`/users/[username]`) | Record, stats, charts, achievements |
| Prediction performance | Predictor Record (win rate, ROI, units, streak) | From settled predictions only |
| Feed Recommended/Following | Prediction feed (Following/Trending/Newest/Top) | Deterministic trending score |
| CAP coins | Coins (virtual only) | Immutable ledger; no cash-out |
| Daily collect ladder (+10…+50) | Daily streak ladder (XP + Coins) | Milestones 1/3/7/14/30/100 |
| Achievements LEVEL/PROGRESS/AWARD | Achievements + XP levels (Rookie→Legend) | Admin-configurable |
| Leaderboard (Avg coef, SPC) | Leaderboard (points, accuracy, ROI, units) | Weekly/monthly/season/all-time + min sample |
| Store (products for coins) | Marketplace (sportsbook offers, promo codes, merch) | Affiliate links, geo compliance |
| Referral (500/500, activation: 5 wins @ ≥1.6) | Referral (r/CODE, activation criteria) | Anti-abuse: no self-referral, dedupe |
| Notifications (prediction settled) | Notification center (settled, followers, achievements…) | Preferences per type |
| Admin panel | Admin (users, games, predictions, marketplace, ads, SEO…) | RBAC + audit log |
| Google/Facebook OAuth | Email/password + optional Google OAuth | Better Auth |
| Socket.io realtime | Polling + SSE for live game updates | Simplest reliable architecture |

## Intentionally different

- **No real-money betting**: Superbowl.gg never takes bets; the wallet is
  virtual currency only, and affiliate offers hand off to partners.
- **No gambling-industry framing**: responsible-gaming + affiliate-disclosure
  pages, ads marked visibly, no "guaranteed win" language.
- **Football-native design**: Superbowl.gg uses its own dark scoreboard/yard-line
  visual system (electric cyan on near-black), not Affium's look.
- **SEO-first architecture**: programmatic NFL/Super Bowl routes, sitemap index,
  structured data, internal linking — Affium's marketing surface is minimal.
