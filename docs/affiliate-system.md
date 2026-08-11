# Affiliate and marketplace system

Only administrator-created offers with real destinations or fulfillment values can become active. The production seed creates categories but no partners, offers or inventory.

## Affiliate redirect

`/go/{slug}` resolves an active offer, evaluates stored country/region/age rules, records a permitted click with attribution fields, and returns a 302 to the configured partner URL. Invalid restriction JSON and required visitor attributes that cannot be verified fail closed.

The domain service supports idempotent conversion ingestion when a partner supplies an external reference. A partner-specific webhook or CSV importer is not exposed until a real partner contract defines authentication and payload semantics.

## Marketplace redemption

An authenticated redemption runs at serializable isolation: validate active offer and real fulfillment, dedupe by user/offer, reserve inventory, debit the wallet, append the ledger, and create a fulfilled redemption. Promo codes or destination URLs are returned only after success.

Legal pages disclose affiliate relationships and clarify virtual currency. Provider/partner terms and jurisdiction rules must be reviewed before activating an offer.
