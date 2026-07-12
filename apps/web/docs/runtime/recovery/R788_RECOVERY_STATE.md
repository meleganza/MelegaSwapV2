# R788 Recovery State

Captured: 2026-07-12T18:00Z (founder finalization — continuation from R787)

## Repository State

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD (start) | `4737f978` (R787 indexer + data activation) |
| Prior verdict | `R787_MELEGA_DEX_PRODUCTION_BLOCKED` |
| Mission | R788 founder polish — pixel perfection + production data completion |

## Scope

R788 preserves all R780–R787 architecture. Changes are UI/data-truth polish only:

- P0: Trending, protocol activity, trade swaps, pools hero coherence
- P1–P7: Homepage, Trade, Pools, Farms, Liquidity Studio, Build Studio, Collectibles
- P8: 88-capture responsive matrix
- P9: Production certification after deploy

## Unrelated Dirty Files (excluded)

Same as R787 recovery — kerl registry, prior screenshot artifacts, env files, tsbuildinfo.

## R786 Matrix Baseline (32 failures)

| Route | Issue |
|-------|-------|
| farms (8) | brokenImg |
| liquidity-studio (8) | dupUnavailable |
| pools (8) | dupUnavailable |
| collectibles (8) | dupUnavailable |

## R788 Target Fixes

1. Trending: runtime swap fallback + WBNB price as BNB/USD fallback
2. Protocol activity: compact empty; show rows when protocol feed populated
3. Trade: BNB/WBNB pair filter; all swaps fallback; stepped 2–3 candle chart; 45% empty height
4. Pools: Historical Pools hero; ended card layout; KPI dup-unavailable removed
5. Liquidity: 3-col grid; activity spans 2 cols; single unavailable messages
6. Collectibles: BabyMarco local fallback chain
7. Network: BNB-only pages suppress global modal
8. Build Studio: compact import panel
