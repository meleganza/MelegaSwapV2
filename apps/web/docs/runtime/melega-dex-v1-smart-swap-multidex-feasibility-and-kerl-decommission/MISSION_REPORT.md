# MISSION REPORT — Smart Swap Multi-DEX Feasibility & KERL Decommission Prep

## Verdict

`MELEGA_DEX_V1_SMART_SWAP_MULTI_DEX_FEASIBILITY_COMPLETE_MELEGA_ONLY_RECOMMENDED`

Phase A decision: **IMPROVE_MELEGA_ONLY_SMART_SWAP**  
Phase B: **KERL decommission plan prepared** (no code deletion in this mission)

## Phase A — Multi-DEX feasibility

### Current production flow

Smart Swap → `@pancakeswap/smart-router` 0.6.1 (V2+stable fork) → Melega factory pairs (+ hardcoded PCS-style stables) → Melega V2 `0xc250…` or Smart Router `0xC666…` → user wallet.

HTTP `/smartRouter` quote API is disabled. KERL is not on the mainnet path.

### Pancake role

**C — both, asymmetric:** route-calculation library over Melega pairs; partial PCS stable/V2 execution via `0xC666…` when STABLE/MIXED wins. No V3, no Universal Router.

Risk: MIXED quotes can use Melega V2 reserves while Smart Router V2 hops bind to `pancakeswapV2`.

### External venues

| DEX | Execute today? | Effort | Near-term |
| --- | --- | --- | --- |
| Melega | Yes | Owned | Invest |
| Pancake (full) | Partial | High for V3/UR | Defer |
| Biswap / ApeSwap | No | Med | Optional later |
| Thena / Uniswap / Sushi | No | High / thin | Out of scope |

Fee skim via `MelegaSmartRouterWrapper` works for **V2-ABI underlyings only**; cannot call `swap`/`swapMulti`. Mainnet wrapper undeployed.

### Strategy comparison

Selected **OPTION 4 — Remain Melega-only** (improve). Multi-DEX adapter registry deferred until fee path + quote/exec hardening + volume case.

### Business

Project Page BUY already embeds `SmartSwapForm`. Melega Space has no in-repo widget. Multi-DEX not required for native/project pairs; economic justification for building aggregation now is **false**.

## Phase B — KERL decommission prep

- Prior audit recommendation reaffirmed: **DECOMMISSION_KERL**
- Active mainnet runtime dependencies on KERL: **none**
- Plan phases 1–5 documented in `kerl-decommission-plan.json`
- **No production deletion** in this mission
- Treasury Runtime: KERL / Smart Swap / DEX all **ACTIVE_DEPENDENCIES = 0**

## Target architecture

```
Smart Swap
  → Melega Router (V2 and/or hardened Smart Router path)
  → Wallet
```

KERL out of production architecture. Multi-DEX Adapter Registry is a future reopen, not current build.

## Product truth

UI claims (“Best Route Found”, “best available multichain route”) still overclaim Melega-only capability. **UI not modified** in this mission.

## Gates

- Audit tests: see `tests.json`
- Production code / contracts / fees / LB / Smart Swap behavior: **untouched**
- Evidence-only commit
