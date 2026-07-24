# Founder defect reproduction — Pools mobile / live data

**Baseline:** `MELEGA_DEX_V1_CERTIFIED` @ `f69088af`  
**Worktree:** `MelegaSwapV2-pools-repair`  
**Branch:** `dex-v1-pools-mobile-live-data-repair`

## Reproduction (pre-fix)

At 390×844 and 430×932 against production shell:

1. `/pools` mounted `PoolsStudioGlobalStyle` which set  
   `nav[aria-label='Main navigation'] { position: sticky; bottom: 0 }`.
2. Shared `MelegaBottomNavigation` defaults to `position: fixed`. Sticky demotion left the nav in document flow **after** `<main>`, so it was off-screen at page top — user trapped on Pools.
3. `/liquidity-studio` had no such override — bottom nav visible (control).

## Root cause — bottom navigation

**File:** `apps/web/src/views/PoolsStudio/PoolsStudioGlobalStyle.tsx`  
**Cause:** Pools-only chrome override for screenshot cloning (R711/R712) demoted fixed bottom nav to sticky.

## Trending / MARCO price

- Shared `GlobalTrendingBar` → `TrendingRibbon` → `useDexTrendingRankings`.
- No source literal `0.00036` in app code; live formatting via `formatTrendingTickerPrice` can produce `$0.000xxx` when a real price is &lt; 0.01.
- When ranking signals empty, ribbon could still imply “Trending” — repaired to **Live on Melega DEX** when empty.

## Pool data

- Page previously centered on SmartChef/staking producers (`usePoolsWithVault`).
- Canonical Melega Factory `0xb7E5848e…` enumeration already exists via `/api/indexer/pairs` (`factory-allPairs-enumeration`).
- Repair wires factory discovery into Pools KPI + explorer cards without inventing a second indexer.
