# Recovery Report — Final Polish Wave 01

## Outcome

Continued from crashed worktree. Completed remaining Activate/Top Movers/freeze/validation work without restarting the mission.

## Measured post-recovery capture (`http://127.0.0.1:3492`)

| Check | Result |
|---|---|
| Featured cards | 4 (`data-featured-slug`) |
| Market activity unavailable | **absent** |
| Top Movers ribbon items | 1 (MARCO factual −1.1% from tier-metrics) |
| Ecosystem mount | present |
| Liquidity Insights | present |
| Horizontal overflows | **0** across 1920/1600/1440/1366/1024/430/390 |
| Home nav (incl. settle) | ~4.5s |
| Liquidity nav | ~4.1s |

## Activate wallet (measured)

Root cause at crash: fail-closed Activate with disabled/no-op button + modal z-index 100 under TOP MOVERS (999).

Repairs:

1. Modal z-index → **1200** (above shell chrome).
2. Wizard reduced to **Setup / Strategy / Review** (Review+Activate merged).
3. Final step: disconnected → `ConnectWalletButton`; connected → `eth_requestAccounts` then honest gate result.
4. Never fabricates `ACTIVE` when LB contracts unbound (`LB_DEPLOYED_ADDRESSES` null).

## Top Movers

- Events API limit raised to 500.
- Loading no longer shows unavailable copy.
- Tier eligibility includes `SYNCING` when factual activity/change exist.
- Production tier-metrics: `marco-wbnb` READY, change −1.118%, 42 trades → ribbon consumes it.
