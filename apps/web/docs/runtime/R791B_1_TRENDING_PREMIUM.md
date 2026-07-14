# R791B.1 — Trending Premium Activation

**Mission:** Wire Homepage Trending Bar and `/trending` to the tier-metrics read model with READY / EMPTY_VERIFIED eligibility.  
**Authority:** `c444e8b7` (tier state machine `a6276ec3`)  
**Captured:** 2026-07-14  

## Data sources

| Surface | Source | Endpoint / hook |
|---------|--------|-----------------|
| Tier eligibility | Indexer tier read model | `GET /api/indexer/tier-metrics` |
| Pair liquidity | Tradeable pairs | `GET /api/indexer/pairs?classification=tradeable` |
| MARCO 24H candles | Featured pair indexer | `useIndexerCandles(MARCO/WBNB)` |
| MARCO price | On-chain pool | `usePriceCakeBusd` |
| BNB/USD | CoinGecko + WBNB hook | fallback chain |
| Canonical tokens | Dex asset index | `getCanonicalIndexedAssets()` |

## Eligibility rules

- Tier status **READY** or **EMPTY_VERIFIED** only
- Canonical token in dex asset index
- Classified tier pair row from inventory
- Real USD price available
- At least one signal: trades, volume, liquidity, or valid 24H change
- Quote tokens (WBNB/BUSD/USDT/USDC) excluded when paired with project token

## Ranking

`volume24h → tradeCount24h → liquidityScore → |price change|`

Shared by:
- `useDexTrendingRankings` (homepage ribbon)
- `useTrendingIntelligenceRuntime` (trending page cards + heatmap)

## Files changed

- `apps/web/src/lib/trending/tierTrendingModel.ts` (new)
- `apps/web/src/lib/trending/__tests__/tierTrendingModel.test.ts` (new)
- `apps/web/src/views/HomeTrade/useDexTrendingRankings.ts`
- `apps/web/src/views/TrendingStudio/trendingRuntime/useTrendingIntelligenceRuntime.ts`
- `apps/web/src/views/TrendingStudio/trendingRuntime/formatTrendingRuntime.ts`
- `apps/web/src/views/TrendingStudio/components/TrendingStudioPageHeader.tsx`
- `apps/web/src/views/TrendingStudio/components/TrendingNowGrid.tsx`

## Tests

```bash
npm test -- src/lib/trending/__tests__/tierTrendingModel.test.ts
```

## Production verification

Post-deploy checks on `/` and `/trending` — see mission final response for rendered assets and screenshots.
