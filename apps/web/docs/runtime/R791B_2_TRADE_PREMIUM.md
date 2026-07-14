# R791B.2 — Trade Premium Activation

**Mission:** Wire `/trade` to canonical tier/indexer runtime — real candles, reserves liquidity, runtime swaps, no fabricated metrics.  
**Scope:** Trade view only (no indexer, trending, pools, farms).  
**Captured:** 2026-07-14  

## Data sources

| Surface | Source | Hook / path |
|---------|--------|-------------|
| Chart candles | Indexer canonical candles | `useIndexerCandles(MARCO_WBNB_PAIR_BSC, '1H')` → `TradePriceChart` → `TradeChartPanel` |
| Current price marker | On-chain MARCO/WBNB + BNB/USD | `usePriceCakeBusd`, `useBUSDPrice(WBNB)` fallback |
| 24H stats | Indexer candles + runtime txs | `indexerMetrics24h` in `useTradeTerminalData` |
| Liquidity | On-chain reserves | `usePairs` → `Pair.getReserves()` → USD via MARCO price + `effectiveBnbUsd` |
| Recent swaps | Runtime indexer transactions | `useProtocolTransactionsIndexer()` → sorted newest-first |

## Chart rules

- Render line only when `pairPrices.length >= 2` (real indexed closes).
- `< 2` candles → compact **Insufficient indexed history** + optional current price marker.
- No TradingView, no skeleton diagonal, no subgraph fallback.

## Recent swaps rules

- Runtime `TransactionType.SWAP` rows only, newest first.
- Row: token avatars, pair symbols, amount, wallet, relative time, BscScan link.
- Zero swaps → single compact empty panel (132px), not a tall empty box.

## 24H stats rules

- Canonical indexer metrics when durable indexer active on MARCO route.
- `formatPct` returns `undefined` for ~0% — percentage hidden, never `0.00%` placeholder.
- Reconciliation blocks stats only on **inconsistent**, not **unavailable**.

## Layout

- Chart area `280px`, recent swaps `260px`.
- Stack: Chart → Stats → Recent Swaps with reduced vertical padding.

## Files changed

- `apps/web/src/views/Trade/useTradeTerminalData.ts`
- `apps/web/src/views/Trade/TradeCenterPanel.tsx`
- `apps/web/src/views/Trade/tradeTokens.ts`
- `apps/web/src/views/Trade/components/TradePriceChart.tsx`
- `apps/web/src/views/Trade/components/TradeChartPanel.tsx`
- `apps/web/src/views/Trade/components/TradePairStats.tsx`
- `apps/web/src/views/Trade/components/TradeRecentSwaps.tsx`
- `apps/web/src/views/Trade/components/TradeSwapsTable.tsx`

## Build

```bash
cd apps/web && npm run build
```

## Production verification

Post-deploy screenshot of `/trade` — see mission final response.
