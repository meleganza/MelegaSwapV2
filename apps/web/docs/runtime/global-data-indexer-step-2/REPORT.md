# MELEGASWAP_V2_GLOBAL_DATA_INDEXER_COMPLETION_STEP_2

## Verdict

`MELEGASWAP_V2_GLOBAL_DATA_INDEXER_STEP_2_COMPLETE`

## Summary

Continued global data integrity repair after Home Top Farms TVL propagation (Step 1).

### Shared selectors

- Added `lib/data-truth/yieldMetricHelpers.ts`
- One formula per metric for farm liquidity/TVL/APR/reward/chain and pool TVL/APR/fees/volume/chain
- Consumed by Home (`useHomeTradeData`, `useGetTopPoolsByApr`), FarmsStudio (`formatFarmsRuntime`, `buildFarmsExploreFarms`), PoolsStudio (`formatPoolsRuntime`, `buildPoolsExplorePools`)

### PART 1 — Home Top Pools

- Rank by TVL → APR without requiring APR eligibility
- TVL = `totalStaked × trusted stake price` (MARCO price hint when needed)
- Rows expose pair, logos (stake + earn), chain badge, TVL, volume, fees, rewards, APR
- Volume stays Unavailable for SmartChef (not certified); fees show `0%` when category known

### PART 2 — Top Farms validation

- `useGetTopFarmsByApr` still attaches `liquidity`
- Farms page preview cards and Explore TVL use `resolveFarmLiquidityUsd`
- Home uses the same helpers

### PART 3 — Multichain

- Every Home/Explore farm & pool row carries `chainId` + `MelegaExploreChainBadge`
- No BNB-only metric fallback in shared helpers (hints are token-symbol based)

### PART 4 — Project directory

- Project cards already expose logo / price / 24h / liquidity / volume / holders with Unavailable when missing
- Project Page V2 economy farm/pool cards use `METRIC_STATUS` / `APR_UNAVAILABLE_LABEL` honestly (registry alone does not certify USD)

### PART 5 — New Listings

- Multichain rows with chain badge, logo, symbol, `listedAt` / `listingTimestamp`, sort by publishedAt

### PART 6 — Consistency

- Shared helpers replace duplicated stake×price / liquidity×quote formulas across Home / Farms / Pools

## Forbidden surfaces

Untouched: Smart Swap, AMM, contracts, Treasury, fee logic.
