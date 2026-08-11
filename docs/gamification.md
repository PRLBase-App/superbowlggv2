# Gamification

Coins are virtual, have no cash value and cannot be withdrawn.

## Systems

- XP levels: Rookie through Legend, seeded as configuration.
- Coin ledger: every credit/debit has type, reason, reference and balance-after.
- Daily streak: one claim per UTC day with idempotent milestone rewards.
- Achievements: criteria are evaluated from persisted user activity and rewards are deduplicated.
- Prediction rewards: depend on settled result and immutable creation odds.
- Referrals: `/r/{code}` records one click per browser/code attribution window; verified sign-up is attributed after onboarding; activation requires five settled wins at odds >= 1.6.

Reward services use transactions and stable reference keys so a retry cannot pay the same event twice. Administrators can change configuration and make audited wallet adjustments, but cannot create a negative balance.
