# MELEGASWAP_V2_RELEASE_READINESS_P0_MARKET_AND_DISCOVERY

**Mission:** Complete P0 user-facing DEX quality blockers for public release.  
**Date:** 2026-08-03  
**Branch:** `melegaswap-v2-release-readiness-p0-market-and-discovery`

## Scope locked (untouched)

- Liquidity Builder contracts / economics
- Smart Swap economics
- Create Token Factory
- Public Farm Factory
- Forbidden: `exchange.ts`, `contracts.ts`, router, wallet, swap, farms/pools MasterChef/NFT/token-list core logic (UI explore surfaces only)

---

## Task 1 — Trending engine

| Requirement | Implementation |
|---|---|
| Complete indexed universe (~266) | Seed ranking from `getCanonicalIndexedAssets()`; removed `candidateAddresses.slice(0, 120)` |
| Top Movers + Trending Bar same source | Unchanged: both consume `TopMoversSnapshotContext` → `useDexTrendingRankings` |
| No sparse fallback | Full-universe seed + credible movers then activity/liquidity backfill to `TRENDING_LIMIT=40`; durable snapshot stores up to 40; ribbon no longer caps at 10 |

**Files:** `useDexTrendingRankings.ts`, `TrendingRibbon.tsx`, `useTrendingDisplayLimit.ts`, `durableTrendingSnapshot.ts`

---

## Task 2 — Explore Farms

| Requirement | Implementation |
|---|---|
| ALL = ALL | `filter === 'All'` (no search) ignores page cap; `visibleFarms = full list`, `hasMore = false` |
| Pagination | Retained for non-All filters via `pageStep` |

**Files:** `buildFarmsExploreFarms.ts`, `farmsModule004.exploreFarms.test.ts`

---

## Task 3 — Explore Pools

| Requirement | Implementation |
|---|---|
| ALL = ALL | Explore builder already returns full filtered inventory (no slice). Certified with 15-card All inventory test |

**Files:** `poolsModule004.explorePools.test.ts` (assertion)

---

## Task 4 — Chain badges

Every Farm / Pool explore card shows explicit chain label + icon:

BNB · Ethereum · Polygon · Base · Avalanche

**Component:** `components/Logo/MelegaExploreChainBadge.tsx`  
**Wired in:** `FarmsExploreFarmCard.tsx`, `PoolsExplorePoolCard.tsx`

---

## Task 5 — Liquidity Builder gating

| Requirement | Implementation |
|---|---|
| Display BETA | Actions pane + card title badge |
| BNB Chain only | Adjacent gold badge |
| Hide on unsupported chains | `LiquidityActionsModule` hides AI pane when `chainId !== 56` |

**Files:** `LiquidityActionsModule.tsx`, `LiquidityBuildingCard.tsx`

---

## Verification

See `verification.json` for tests / `next build` results.

## Verdict

See `VERDICT.txt`
