# Affium Route Map

Complete route inventory of `demo.affiumsport.com` (discovered by rendering the
SPA with Playwright and by reading the react-router path table in the main
bundle). Status: public / auth / admin.

| # | Route | Page | Status |
|---|-------|------|--------|
| 1 | `/` | Marketing home | public |
| 2 | `/signin` | Login step 1 (email/username) | public |
| 3 | `/login` | Login step 2 (password) | public |
| 4 | `/signup` | Sign up (supports `?ref=` referral) | public |
| 5 | `/register` | Sign up alias | public |
| 6 | `/verifyemail` | Verify email | public |
| 7 | `/checkmail` | Check-mail info page | public |
| 8 | `/resetpassword` | Request reset | public |
| 9 | `/setnewpassword` | Set new password | public |
| 10 | `/loginchangeusername` | Username fix after OAuth signup | auth |
| 11 | `/oauth-redirect` | OAuth callback | public |
| 12 | `/feed` | Prediction feed (Recommended/Following) | auth |
| 13 | `/sportline` | Sport Line (event grid + coupon) | public |
| 14 | `/predictions` | All predictions | public |
| 15 | `/predictions/:gameId` | Event / match detail | public |
| 16 | `/leaderboard` | Leaderboard | public |
| 17 | `/wallet` | CAP coins wallet | auth |
| 18 | `/notification` | Notifications | auth |
| 19 | `/setting` | Settings (general) | auth |
| 20 | `/settingaccount` | Settings (account) | auth |
| 21 | `/userprofile` | Own profile | auth |
| 22 | `/profile/:getUsername` | Public user profile | public |
| 23 | `/referral` | Referral program | auth |
| 24 | `/achievements` | Achievements hub | auth |
| 25 | `/chart` | Analytics chart | auth |
| 26 | `/marketplace` | Store (real products for coins) | public |
| 27 | `/admin` | Admin dashboard | admin |
| 28 | `/privacypolicy` | Privacy policy | public |
| 29 | `/cookie` | Cookie policy | public |
| 30 | `*` | 404 fallback | public |

## Notable non-route endpoints

- `/engine.io` — socket.io transport (realtime)
- `sitemap.xml` + `sitemaps/ua_sitemap_events_index.xml` — SEO sitemaps
- robots.txt allows `/predictions`, `/sportline`, `/leaderboard`, `/marketplace`
