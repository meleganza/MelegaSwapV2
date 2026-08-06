# MELEGASWAP_V2_GLOBAL_DATA_INDEXER_FINALIZATION

## Verdict

**MELEGASWAP_V2_GLOBAL_DATA_INDEXER_FINALIZED**

## Summary

Single Global Data Truth Layer (`lib/data-truth`) is now the shared read facade for market + yield observations across Home, Projects, Project Page, Liquidity, Farms, Pools, Portfolio, and Audit.

### Delivered

1. **SSOT facade** — `lib/data-truth/index.ts`, `globalDataTruthLayer.ts`, `useGlobalDataTruth.ts`, `truthDisplay.ts`, `yieldTruthRanking.ts`
2. **Shared ranking** — Home Top Farms/Pools use `compareYieldTruthDesc` (TVL → APR → volume → activity)
3. **Projects** — uses `useTopMoversSnapshot` (no duplicate `useDexTrendingRankings`); KPI holders use `truthDash`
4. **Project Page** — `useProjectLiveMarket` builds from Featured/canonical SSOT via `buildProjectTruthMarketFromFeatured`; economy counts from shared inventory
5. **Honesty** — uncertified metrics render as `—` (no invented zeros; no "Source not configured" / "Waiting for explorer")
6. **Audit** — tagged with `data-data-truth-pipeline=melega-global-data-truth-v1`
7. **Cache** — Featured + volume continue via `useCanonicalMarketSnapshot` (SWR dedupe)

### Forbidden surfaces untouched

Smart Swap engine, Router, AMM, Contracts, Treasury, Fee logic, Wallet execution, Payment Router.

### Gates

- Mission tests: pass
- `next build`: pass
- Browser acceptance: Home / Projects / Project Page / Liquidity / Farms / Pools / Portfolio / Audit — pass
