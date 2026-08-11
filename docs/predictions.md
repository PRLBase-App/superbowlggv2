# Predictions

Users publish informational NFL predictions; Superbowl.gg does not accept real-money wagers.

## Creation

- the client submits a game ID, internal market-outcome ID, confidence, analysis, virtual units and UUID request ID
- the server derives market type, home/away or over/under selection, player identity, bookmaker and odds snapshot
- only supported, provider-verifiable, scheduled-game markets with fresh odds are accepted
- duplicate client request IDs return the existing prediction

## Lock and settlement

Pending predictions lock when kickoff passes or the game becomes live/final. Final-score markets settle from official game scores. Supported player props settle only when official per-game player statistics exist; absence of data keeps the item pending for a later sync rather than guessing.

The shared pure engine covers moneyline, spreads, totals and player props, including pushes, missing lines and invalid selections. A settlement record stores result, reason, source, version and timestamp. Rewards, achievements and notifications use idempotency keys.

## Public performance

Profiles, feeds and leaderboards calculate record, accuracy, ROI, units and points only from settled data. Leaderboards enforce minimum samples: weekly 5, monthly 15, season 30 and all-time 15.
