# Trade Runtime Activation Report — R015

**Mission:** R015 Trade Runtime Activation (Phase 2 — Real Data Integration)  
**Date:** 2026-07-03  
**Branch:** `design-system-foundation`  
**Staging:** https://v2.melega.finance/trade

---

## Summary

Trade runtime mock layers have been removed and replaced with live SmartSwap / wallet / subgraph infrastructure. **No UI layout, typography, or spacing changes.**

| Layer | Before | After |
|-------|--------|-------|
| UI | 🟩 | 🟩 (unchanged) |
| Runtime | 🟨 | 🟩 |
| Production domain | ⬜ | ⬜ (unchanged) |

---

## Phases completed

| Phase | Deliverable | Status |
|-------|-------------|--------|
| A | `docs/TRADE_RUNTIME_INVENTORY.md` | ✅ |
| B | Real router — SmartSwap + V2 comparison | ✅ |
| C | Live quotes in route box + right rail | ✅ |
| D | Token list via existing swap selectors + watchlist | ✅ |
| E | Execution summary in runtime machine payload | ✅ |
| F | Tx status via existing SmartSwapCommitButton + global modal | ✅ |
| G | Wallet balances, approval phase, error codes | ✅ |
| H | `tradeRuntimeErrors.ts` human + machine codes | ✅ |
| I | Routing / indexing loading labels | ✅ |
| J | Collapsed machine JSON in router panel | ✅ |

---

## Files changed

### New
- `apps/web/src/views/Trade/tradeRuntime/tradeRuntimeErrors.ts`
- `apps/web/src/views/Trade/tradeRuntime/formatTradeRuntime.ts`
- `apps/web/src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts`
- `apps/web/src/views/Trade/tradeRuntime/TradeRuntimeContext.tsx`
- `docs/TRADE_RUNTIME_INVENTORY.md`
- `docs/TRADE_RUNTIME_ACTIVATION_REPORT.md`

### Modified
- `TradeTerminalScreen.tsx` — `TradeRuntimeProvider`
- `TradeSmartRouteBox.tsx` — live runtime
- `TradeRouteLine.tsx` — live path
- `TradeRightRail.tsx` — live routes, assets, router status
- `TradeRecentSwaps.tsx` — no mock padding
- `TradeWatchlist.tsx` — empty state
- `useTradeTerminalData.ts` — enriched subgraph rows
- `docs/DEX_IMPLEMENTATION_MATRIX.md` — Trade Runtime 🟩

### Removed
- `apps/web/src/views/Trade/tradeMockData.ts`

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | ✅ Pass |
| `yarn test src/design-system` | ✅ 11/11 |
| `yarn test src/lib/homepage-live` | ✅ 2/2 |
| `/trade` no "Preview layout" label | ✅ (post-deploy) |
| `/trade` no Sentry Oops | ✅ (v2 staging prior session) |

### Runtime simulation matrix

| Scenario | Expected behavior | Verified |
|----------|-------------------|----------|
| Wallet disconnected | Connect Wallet CTA; assets empty message | Code path ✅ |
| Wallet connected | Live balances in Your Assets | Code path ✅ |
| Wrong network | Network modal / `NETWORK_UNAVAILABLE` mapping | Existing shell ✅ |
| No route | `ROUTE_NOT_FOUND` / insufficient liquidity message | SmartSwap guard ✅ |
| Supported route | Dynamic route line + route entries | Code path ✅ |
| Approval required | `approval_required` phase | Code path ✅ |
| Receipt | Global tx modal + toast | Existing SmartSwap ✅ |

*On-chain approval + receipt requires manual MetaMask on staging.*

---

## Known limitations (non-blocking)

- Gas estimate is heuristic (`gasPrice × 220k`), not wallet `estimateGas`
- Router analytics / view-all routes buttons remain inert (no backend)
- Holders stat still unindexed
- AI routing toggle unchanged (disabled)
- KERL execution not integrated (by design)

---

## DEX matrix update

**TRADE → Runtime: 🟨 → 🟩**

---

## Next priority

Per matrix: **Liquidity Runtime** (Priority 2).
