# POOLS_MODULE_002_OVERVIEW_KPIS_REPORT

## 1. Final verdict

**POOLS_MODULE_002_OVERVIEW_KPIS_CERTIFIED**

## 2. Branch

`pools-module-002-overview-kpis`

## 3. Mission commit

_(filled after commit)_

## 4. Certified base

| | |
| --- | --- |
| Module 001 | `POOLS_MODULE_001_HERO_CERTIFIED` |
| Branch | `pools-module-001-hero` |
| Tip | `4cff101d` |
| Implementation | `c2310473` |
| Architecture | `f1d1fd11` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-pools-m002`

## 6. Architecture freeze

Architecture 000 tip ancestry preserved. Mockup SHA unchanged. No shell cutover.

## 7. Founder mockup integrity

SHA-256 `549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f` — **pass**.

## 8. Module 001 freeze

Hero component sources (`PoolsHeroModule`, Artwork, TrustPanel, `poolsHeroTokens`) **unchanged**.  
Live Hero height re-measured **260px**. Top gap Hero→KPIs **16px**.

## 9. Files changed

- `modules/PoolsOverviewKpisModule.tsx`
- `modules/usePoolsOverviewKpis.ts`
- `modules/poolsOverviewKpisTokens.ts`
- `modules/poolsOverviewKpisTypes.ts`
- `PoolsStudioScreen.tsx` (mount Module 002; supersede legacy `PoolsKpiRow`)
- `__tests__/poolsModule002.overviewKpis.test.ts`
- `__tests__/poolsModule001.hero.test.ts` (unlock assertions only — allow Module 002 mount)
- ownership map + evidence + this report

## 10. Module 002 ownership

Read-only KPI strip after Hero. Composes shared Pools runtime + SmartChef classification + `poolsAprRules`. No wallet write paths.

## 11. KPI definitions

Exact order: TVL · Pools Discovered · Pools Rewarding · Total Rewards — 24H · Highest Sustainable APR · My Claimable.  
See `kpi-definition-map.json`.

## 12. Pool-domain count definition

**SmartChef classification** `counts.discovered` — staking-pool domain only.

## 13. Count reconciliation

Factory AMM pairs / Farms / Home “Pools” KPI are **distinct** and not used for Module 002 Discovered.  
Documented in `pool-count-reconciliation.json`. Home not modified.

## 14. TVL source and policy

`rawPool.totalStaked × stakingTokenPrice`. Partial: `Partial · X of Y valued`. Missing prices never rendered as `$0.00`.

## 15. Pools Discovered source

`/api/pools/classification` SmartChef counts. Unavailable → `—` (not zero). Factual zero allowed when ready.

## 16. Pools Rewarding source

`counts.rewarding` with `% of discovered` when denominator factual. Partial fallback: card lifecycle.

## 17. Total Rewards 24H source

**Unavailable** — no indexed rolling-24H distribution feed. Emission `/day` projections **not** used. Card remains labeled “Total Rewards — 24H” with honest supporting line.

## 18. Sustainable APR policy

Reuses `poolsAprRules` / `sustainableAprDisplay`. Excludes ended pools and forbidden displays (0%, >50%, etc.). Does not invent a second formula.

## 19. My Claimable source

Connected wallet `pendingReward × earningTokenPrice`. Disconnected: Connect wallet to view. Zero only after successful user-data read.

## 20–21. Partial / unavailable

Independent per card. Skeletons for loading. Em-dash + metric-specific supporting copy.

## 22. Freshness

`live` / `partial` / `unavailable` / `loading` on cards; timestamps in accessible detail.

## 23. Desktop geometry

1440 DOM-measured: module **1376×112**, gap **16px**, cards **216×112**, six equal columns — **all pass**.

## 24. Tablet behavior

1024: 3×2 equal columns. No horizontal overflow.

## 25. Mobile geometry

390: content 358, cards **171×112**.  
430: content 398, cards **191×112**.  
2×3 grid. No overflow.

## 26. Accessibility

Section heading, per-card aria labels (name/value/state), decorative icons, polite live region, skeleton `aria-busy`.

## 27. Tests

**26 passed** (Module 002 + Module 001 + Architecture 000).

## 28. Typecheck

Covered via `next build`.

## 29. Build

`yarn next build` — **passed**.

## 30. Evidence

`apps/web/docs/runtime/pools-module-002-overview-kpis/`

## 31. Deviations

1. Module 001 test file unlocked to stop requiring legacy `PoolsKpiRow` / forbidding Module 002 mount (Hero sources untouched).
2. 24H rewards card remains unavailable until an indexed distribution feed exists.
3. Mixed live card states used for partial/unavailable screenshot labels (no production fixtures injected).

## 32. Remaining honest limitations

- No historical 24H reward indexer.
- Classification may still be loading at first paint (honest skeleton).
- Claimable USD depends on earning-token prices.

## 33. Factual blockers

None for Module 002 certification scope.

## 34. Working-tree status

Clean after push.

## 35. Exact next mission

**POOLS_MODULE_003_MY_POSITIONS**
