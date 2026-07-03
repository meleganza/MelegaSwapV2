# Trade Runtime Inventory — R015 Phase A

**Route:** `/trade` (alias `/swap`)  
**Date:** 2026-07-03  
**Mission:** Eliminate mock layers; wire real execution infrastructure.

---

## Route composition

```
pages/trade/index.tsx
  └── SwapFeaturesProvider
        └── TradeTerminalScreen
              ├── TradeRuntimeProvider (NEW — R015)
              ├── TrendingRibbon (live)
              ├── TradeCockpit → SmartSwapForm (live execution)
              ├── TradeCenterPanel → TradePriceChart (live subgraph)
              ├── TradeRightRail (runtime — was mock)
              └── TradeRecentSwaps (live subgraph — was padded mock)
```

---

## Component inventory

| Path | Prior source | Real source (R015) | Replacement | Dependencies | Risk |
|------|--------------|-------------------|-------------|--------------|------|
| `tradeMockData.ts` | Static fixtures | **REMOVED** | Deleted | — | None |
| `tradeRuntime/useTradeSwapRuntime.ts` | — | SmartSwap hooks + wallet | New hook | `useTradeInfo`, `useDerivedSwapInfo*` | Duplicate SWR fetch (acceptable) |
| `tradeRuntime/TradeRuntimeContext.tsx` | — | Context provider | New | `useTradeSwapRuntime` | Must wrap right rail + cockpit |
| `TradeSmartRouteBox.tsx` | Hardcoded 0.5% / Fast | `useTradeRuntime` | Live quote + routing phase | tradeInfo | Low |
| `TradeRouteLine.tsx` | Hardcoded 4-step path | `useTradeRuntime.routeSteps` | Dynamic path from trade | tradeInfo.route.path | Low |
| `TradeRightRail.tsx` | `MOCK_*` all panels | `useTradeRuntime` | Live routes, balances, router status | wallet, gas, watchlist | Medium — wallet required for assets |
| `TradeRecentSwaps.tsx` | Padded `MOCK_RECENT_SWAPS` | `useTradeTerminalData` only | Subgraph swaps | info SWR | Low |
| `TradeWatchlist.tsx` | Mock pairs prop | `useWatchlistTokens` via runtime | User saved tokens | token list atom | Low |
| `useTradeTerminalData.ts` | Subgraph (partial) | Enriched tx rows | received + route labels | `useProtocolTransactionsSWR` | Low |
| `TradeCockpit.tsx` | SmartSwapForm live | Unchanged UI | Already real execution | SmartSwap stack | Low |
| `SmartSwapForm` | Full router | Unchanged | Execution + approval + swap | on-chain | Production txs |
| `TradeCenterPanel.tsx` | `useTradeTerminalData` | Unchanged | Live token stats + TV | subgraph | Chart may skeleton |
| `TradePageHeader.tsx` | Static + inert AI toggle | Unchanged | AI deferred | — | None |
| `TradeTabBar.tsx` | Disabled tabs | Unchanged | Other modes future | — | None |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `MOCK_ROUTE_ENTRIES` | ✅ Replaced by live smart/V2 comparison |
| `MOCK_ASSETS` | ✅ Replaced by wallet balances |
| `MOCK_ROUTER_STATUS` | ✅ Replaced by chain + router availability |
| `MOCK_RECENT_SWAPS` | ✅ Removed — empty/indexing state |
| `MOCK_WATCHLIST` | ✅ Replaced by `useWatchlistTokens` |
| `TRADE_MOCK_LABEL` | ✅ Removed |
| Hardcoded route line steps | ✅ Dynamic from `tradeInfo.route.path` |
| Hardcoded smart route savings | ✅ Computed vs V2 output |

---

## Runtime phases (loading model)

| Phase | UI signal | Machine code |
|-------|-----------|--------------|
| `idle` | Awaiting quote | — |
| `routing` | "Routing…" | `ROUTING` |
| `ready` | Live route + quote | — |
| `wallet_required` | Connect Wallet CTA | `WALLET_DISCONNECTED` |
| `approval_required` | Approve flow | — |
| `error` | Human-readable error | `ROUTE_NOT_FOUND`, etc. |

---

## Transaction status

Swap execution status uses existing global infrastructure:

- `SmartSwapCommitButton` → on-chain callback
- `ToastListener` + `TransactionsDetailModal` in `_app.tsx`
- Machine JSON includes `approval` + `status` phase

Dedicated per-panel tx timeline deferred — no UI layout change in R015.

---

## Remaining gaps (post-R015)

| Gap | Notes |
|-----|-------|
| Router analytics button | No backend — inert |
| Holders stat | No indexer wired |
| Multi-chain route cards | Single-chain quote per active network |
| AI routing | Disabled per mission scope |
| KERL execution | Out of scope — DEX executes directly |
