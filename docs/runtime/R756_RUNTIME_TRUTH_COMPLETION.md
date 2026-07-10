# R756 — Runtime Truth Completion

**Verdict:** `PASS`  
**Mission:** Every DEX metric is `READY`, `LOADING`, or `UNAVAILABLE` with an explicit reason. No em dash placeholders, no fake indexing labels, no fabricated whale/smart-money feeds.

**Frozen (not modified):** Smart Router, Wrapper, KERL, Treasury Runtime.

---

## Validation Matrix

| Surface | Status | Notes |
|---------|--------|-------|
| Trade holders | READY / UNAVAILABLE | `useHolderCount(chainId, tokenAddress)` — chain-aware; testnet MARCO via `BSC_TESTNET_ADDRESSES` |
| Trade chart price / 24H | READY / UNAVAILABLE | `TradePriceChart` uses `useActiveChainId()` for avatars; missing price/change shows `Unavailable` |
| Trade pair stats (vol, liq, trades) | READY / UNAVAILABLE | Subgraph + CoinGecko fallback with `reasonCode` sublines |
| Recent swaps | READY / LOADING / UNAVAILABLE | Subgraph via `useProtocolTransactionsIndexer`; explicit empty reason + diagnostic |
| Home Live Activity | READY / LOADING / UNAVAILABLE | `LiveActivityFeed` — real subgraph rows or explicit unavailable block |
| Home Quick Market | READY / UNAVAILABLE | Single unavailable card when no farm/pool/volume metrics (no fake `—` cards) |
| Trending assets | READY | Full DEX asset index (`buildDexAssetIndex`) — registry + venues + farms + pools + testnet (97) |
| Trending whale / smart money | COLLAPSED | Panels removed from sidebar; KPI shows `Unavailable`; warnings explicit |
| Radar whale / smart money | COLLAPSED | `RadarOpsLeftColumn` returns `null`; console grid adapts to 2-column layout |
| Pools KPIs / advisor | READY / LOADING / UNAVAILABLE | `formatPoolsRuntime` + `usePoolsStakingRuntime` — no `Indexing` placeholder |
| Pools discovery | READY / LOADING | `poolsIndexingDiagnostic` with integrity counts and blocker reasons |

---

## New Module

- `apps/web/src/lib/runtime-truth/` — `resolveRuntimeMetric`, `RUNTIME_UNAVAILABLE_LABEL`, `RUNTIME_LOADING_LABEL`

---

## Files Changed

### Core policy
- `apps/web/src/lib/runtime-truth/format.ts`
- `apps/web/src/lib/runtime-truth/index.ts`
- `apps/web/src/lib/runtime-truth/__tests__/format.test.ts`
- `apps/web/src/lib/data-policy/dataReasonCodes.ts`
- `apps/web/src/lib/data-policy/uiReasonLabels.ts`
- `apps/web/src/lib/holder-count/resolveHolderMetric.ts`
- `apps/web/src/lib/holder-count/__tests__/resolveHolderMetric.test.ts`

### Trade
- `apps/web/src/views/Trade/useTradeTerminalData.ts`
- `apps/web/src/views/Trade/components/TradePairStats.tsx`
- `apps/web/src/views/Trade/components/TradePriceChart.tsx`
- `apps/web/src/views/Trade/components/TradeRecentSwaps.tsx`

### Home
- `apps/web/src/views/HomeTrade/LiveActivityFeed.tsx`
- `apps/web/src/views/HomeTrade/QuickMarketStrip.tsx`
- `apps/web/src/views/HomeTrade/useHomeTradeData.ts`
- `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx`

### Trending / Radar
- `apps/web/src/lib/dex-asset-index/buildDexAssetIndex.ts`
- `apps/web/src/views/TrendingStudio/components/TrendingSidebar.tsx`
- `apps/web/src/views/TrendingStudio/trendingRuntime/useTrendingIntelligenceRuntime.ts`
- `apps/web/src/views/RadarStudio/components/RadarOpsLeftColumn.tsx`
- `apps/web/src/views/RadarStudio/RadarStudioScreen.tsx`
- `apps/web/src/views/RadarStudio/radarRuntime/useRadarIntelligenceRuntime.ts`

### Pools
- `apps/web/src/views/PoolsStudio/poolsRuntime/formatPoolsRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts`
- `apps/web/src/views/PoolsStudio/poolsRuntime/poolsAprRules.ts`
- `apps/web/src/views/PoolsStudio/components/PoolsKpiRow.tsx`
- `apps/web/src/views/PoolsStudio/components/AIRewardAdvisorPanel.tsx`

---

## Tests

```
vitest run src/lib/runtime-truth/__tests__/format.test.ts
vitest run src/lib/dex-asset-index/__tests__/buildDexAssetIndex.test.ts
vitest run src/lib/holder-count/__tests__/
→ 16/16 passed
```

---

## Remaining Runtime Blockers

These are **external infrastructure gaps**, not UX placeholders. UI surfaces them as `UNAVAILABLE` with exact reasons.

1. **Melega BSC subgraph** — not deployed; swap/candle/pair metrics unavailable until `NEXT_PUBLIC_MELEGA_SUBGRAPH_URL` (or hosted subgraph) is live.
2. **BscScan holder API** — `NEXT_PUBLIC_BSCSCAN_API_KEY` not configured; holder counts show `Unavailable` + `EXPLORER_SOURCE_MISSING`.
3. **Whale / smart-money indexer** — `WHALE_INDEXER_NOT_DEPLOYED`; panels collapsed until `NEXT_PUBLIC_WHALE_INDEXER_URL` is configured.
4. **Live pool emissions (mainnet)** — pools may discover on-chain but hide when APR/reward budget fails gate (`NEEDS_FUNDING`, `NO_EMISSION`); diagnostic in `poolsIndexingDiagnostic`.
5. **Projects / Collectibles / Farms secondary surfaces** — some legacy `—` in non-R756 scope cards (e.g. `premiumStudio.ts`, `FarmGridCard` indexing state) — farms/pools `indexing` **status** is legitimate when pool start block not reached.

---

## Policy

- Never display `—` for runtime metrics in R756 surfaces.
- Never display `Indexing` unless on-chain discovery is actively in progress (`loading_pools`, `SUBGRAPH_LOADING`).
- Whale / smart money: **collapse**, never fabricate rows.
