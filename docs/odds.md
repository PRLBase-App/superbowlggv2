# Odds

The Odds API is the production odds source. The adapter currently requests NFL head-to-head, spreads and totals across returned bookmakers. For the nearest game within 48 hours it requests supported player props at most once per day.

## Provenance

Each market outcome keeps its provider key, bookmaker, latest line/price and timestamp. A new `OddsSnapshot` is appended only when a newer line or price changes. Prediction publishing accepts only an internal outcome ID; the server selects the newest matching snapshot and rejects missing, future-dated or older-than-12-hours odds.

## Budgeting

Core markets run every 8 hours. Props are bounded to four markets for one near-term event daily and are optional: their failure does not invalidate a successful core-odds sync. Quota response headers are recorded by the adapter when present.

Set `THE_ODDS_API_KEY`. Missing credentials or upstream errors never fall back to invented lines.
