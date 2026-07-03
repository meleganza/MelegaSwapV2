# Liquidity Runtime Inventory — R016 Phase A

**Routes:** `/liquidity-studio` (studio shell), `/liquidity` (legacy positions), `/add`, `/remove`  
**Date:** 2026-07-03  
**Mission:** Eliminate mock layers in Liquidity Studio; wire real LP infrastructure.

---

## Route composition

```
pages/liquidity-studio.tsx
  └── LiquidityStudioScreen
        ├── LiquidityRuntimeProvider (NEW — R016)
        ├── TrendingRibbon (live)
        ├── LiquidityBuilderPanel (runtime — was static)
        ├── PositionPreviewPanel (runtime — was static)
        ├── MarketIntelligencePanel (subgraph — was METRICS mock)
        ├── AILiquidityAdvisorPanel (heuristic from live pool data)
        ├── TopPoolsPanel (subgraph — was POOLS mock)
        └── LiquidityActivityTable (subgraph — was ROWS mock)

pages/liquidity.tsx → views/Pool (legacy — already live)
pages/add/[[...currency]].tsx → AddLiquidity (legacy — already live)
pages/remove/[[...currency]].tsx → RemoveLiquidity (legacy — already live)
```

---

## Component inventory

| Component | Prior source | Real source (R016) | Replacement | Dependencies | Risk |
|-----------|--------------|-------------------|-------------|--------------|------|
| `LiquidityBuilderPanel` | Hardcoded BNB/MARCO, 0.0 amounts | `useLiquidityRuntime` | Mint/burn state, currency modal, execution CTA | `useDerivedMintInfo`, `useDerivedBurnInfo` | Medium — tx on staging |
| `PositionPreviewPanel` | 52/48 bars, 0 LP, — APR | `useLiquidityRuntime.preview` | Live ratio, LP minted, share, APR | `useLPApr`, pair reserves | Low |
| `MarketIntelligencePanel` | `METRICS` static TVL/APR | `useLiquidityTerminalData` | `usePoolDatasSWR` per selected pair | info subgraph | Low |
| `TopPoolsPanel` | `POOLS` fake list | `useTopPoolAddresses` + pool data | Top pools by volume | info subgraph | Low |
| `AILiquidityAdvisorPanel` | `ITEMS` static | Heuristic from pool metrics | Health/risk from TVL/APR | terminal data | Low — not ML AI |
| `LiquidityActivityTable` | `ROWS` fake activity | MINT/BURN from `useProtocolTransactionsSWR` | Filtered subgraph txs | info SWR | Low |
| `LiquidityStudioPageHeader` | Local tab state + PREVIEW badge | Runtime `mode` + LIVE badge | Tab drives add/remove/positions/simulation | context | Low |
| `views/Pool` | Live wallet positions | Unchanged | Reference for positions tab | on-chain | Low |
| `AddLiquidity` / `RemoveLiquidity` | Live execution | Reused via studio modals | `ConfirmAddLiquidityModal`, `ConfirmRemoveLiquidityModal` | router contract | Production txs |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `METRICS` in MarketIntelligencePanel | ✅ Replaced by subgraph pool data |
| `POOLS` in TopPoolsPanel | ✅ Replaced by top pool addresses + data |
| `ROWS` in LiquidityActivityTable | ✅ Replaced by MINT/BURN transactions |
| `ITEMS` in AILiquidityAdvisorPanel | ✅ Replaced by live heuristics |
| Hardcoded BNB/MARCO pair | ✅ Dynamic currency selection |
| Hardcoded 0.0 token amounts | ✅ Mint/burn inputs |
| `PREVIEW LAYOUT` badges | ✅ Replaced with LIVE RUNTIME / LIVE badges |
| Static ratio 50/50 | ✅ Computed from `parsedAmounts` + price |

---

## Runtime phases

| Phase | UI signal | Machine code |
|-------|-----------|--------------|
| `idle` | Awaiting input | — |
| `calculating` | Calculating… | `CALCULATING` |
| `reading_lp` | Reading LP… | `CALCULATING` |
| `ready` | Live preview | — |
| `wallet_required` | Connect Wallet | `WALLET_DISCONNECTED` |
| `approval_required` | Approve Token / LP | `APPROVAL_REQUIRED` |
| `error` | Human-readable | `INSUFFICIENT_TOKEN_*`, etc. |

---

## Error model

Codes in `liquidityRuntimeErrors.ts`:

- `LIQUIDITY_POOL_NOT_FOUND`
- `INSUFFICIENT_TOKEN_A` / `INSUFFICIENT_TOKEN_B`
- `APPROVAL_REQUIRED`
- `POOL_CLOSED`
- `NETWORK_UNAVAILABLE`
- `INVALID_RATIO`
- `SLIPPAGE_TOO_HIGH`
- `WALLET_DISCONNECTED`
- `NO_LP_POSITION`

---

## Machine readability

Collapsed JSON in Market Intelligence panel (`data-ls-machine-json`): status, mode, wallet, pair, pool address, approvals, preview metrics, error, timestamp.

---

## Known gaps (non-blocking)

- IL chart remains decorative; IL % derived from volume change heuristic
- LP age / historical value not indexed
- Gas estimate uses router estimate at execution time (not pre-display)
- AI advisor uses heuristics, not ML model (matrix AI ⬜)
