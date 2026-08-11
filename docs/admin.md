# Admin

`/admin` is protected by database-backed roles and active account status. Core sections cover users, games/provider sync, predictions, marketplace, affiliate reporting, ads, gamification, content/settings, analytics, SEO and audit logs.

## Mutable operations

- suspend/unsuspend users and change roles with super-admin safeguards
- audited coin adjustments with idempotent request IDs
- change game state and manually void a prediction with a required reason
- create marketplace offers and activate only those with real fulfillment
- edit settings/gamification values
- enqueue bounded provider sync jobs without duplicating pending/running work

All mutations validate a typed payload and append `AdminAuditLog` with actor, target, request ID and available request IP. Legacy admin paths return permanent redirects to their consolidated sections.

Affiliate partner/offer authoring, ad creative authoring and partner conversion ingestion remain database/domain capabilities rather than generic unsafe forms; they should be enabled only after real contracts and payload requirements exist.
