# Superbowl.gg Function Matrix v1

Version: 1.0 — 2026-08-28

| Action | Role | UI entry | API / navigation | Data source | Side effect | Visible failure state | Coverage |
|---|---|---|---|---|---|---|---|
| Browse games and game center | Guest | Header, home, pick board | `/games`, `/games/[gameId]` | NFL provider + PostgreSQL | None | Empty/unavailable state | sitemap + dynamic build smoke |
| Browse provider predictions | Guest | Prediction feed/profile/game | `/predictions`, detail routes | `Prediction`, immutable `OddsSnapshot` | View only | Not found / empty state | prediction-flow unit tests |
| Compose provider pick | Guest/User | Pick Board, Game Center | `GET /api/games/[gameId]/prediction-options` | Fresh provider snapshots | User: creates prediction; guest: validated return path | closed/stale/network/current-option states | grouping, freshness, kickoff, idempotency tests |
| Compose Community Line | Guest/User | Advanced / Community Line | `POST /api/predictions` | Verified team players + allowlisted stat catalog | Creates one odds-free prediction | line cap/half-step/player/kickoff errors | catalog and settlement tests |
| Settle predictions | Worker | Scheduled worker | `SETTLE_PREDICTIONS` | final score / official player stats | settlement, reward, achievement and notification once | missing Community stat becomes documented `VOID` | recovery and Community settlement tests |
| Follow/unfollow | User | Public profile | `POST /api/follow` | `UserFollow` | first follow creates one deduped notification | inline network/API error + busy state | unique constraint and route authorization review |
| Edit profile/security | User | Own profile, Settings | `/settings`, settings APIs, Better Auth | Profile, favorites, auth account | profile/favorite/password update; email only after verification | combined/partial save result; no false success | schema/typecheck + auth flow review |
| Notification open/read | User | Header, notifications | `POST /api/notifications` then validated relative link | Notification | own notification marked read | inline failure; navigation waits for mark | ownership filter + return-path unit tests |
| Mark all read | User | Notifications | `POST /api/notifications` | Notification | marks only own unread rows | inline network/API error + busy state | authorization review |
| Daily streak | User | Wallet, collect | `/api/wallet/collect` | DailyStreak | daily idempotent XP/coins | collect error state | gamification tests; next-day label fixed |
| Browse Rewards Store | Guest/User | Header, home, wallet | `/marketplace` | active curated inventory | None | empty state | build smoke |
| Redeem reward | User | Reward detail | `POST /api/marketplace/redeem` | wallet, inventory, redemption | serializable debit/decrement/fulfillment | sold-out/funds/network + busy state | transaction constraints and duplicate recovery |
| Reopen My Rewards | User | Rewards Store | `/marketplace#my-rewards` | all own redemptions + offer fulfillment | None | empty state | server query + persistent-code render |
| Offer a reward | Guest/User | Rewards Store | `mailto:support@superbowl.gg` | Email client | External support inquiry | mail client-dependent | link smoke |
| Create/manage reward | Admin | Admin Rewards Store | admin marketplace/action APIs | MarketplaceOffer | draft/create/activate/pause/archive with audit log | inline API/network + busy state | strict schemas + admin authorization |
| Change app settings | Admin | Admin Settings/Gamification | `POST /api/admin/action` | AppSetting | upsert + audit log with UUID request ID | busy, partial count and per-key errors | schema/typecheck |
| Moderate users/predictions | Admin/Super Admin | Admin pages | `POST /api/admin/action` | User, Prediction, AuditLog | role/status/wallet/void changes | API conflict/permission errors | authorization guards + immutable audit log |
| Sign out | User | Account menu | Better Auth sign-out API | Session | invalidates session | inline network error + double-click guard | client behavior + auth integration |

Public CTAs use relative, validated return paths. All mutation routes re-check session/role ownership server-side; UI visibility alone is never authorization.
