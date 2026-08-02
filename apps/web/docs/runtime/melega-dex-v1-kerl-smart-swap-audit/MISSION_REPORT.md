# MISSION REPORT — KERL & Smart Swap Routing Architecture Audit

## Verdict

`MELEGA_DEX_V1_KERL_SMART_SWAP_AUDIT_COMPLETE_DECOMMISSION`

Architectural recommendation: **DECOMMISSION_KERL**

## Measured findings

### KERL

- Present as a large frontend library + static registry + dry-run/CLI harness (~150+ app files referencing KERL).
- **No** KERL Solidity contracts, **no** KERL public API, **no** KERL database, **no** KERL cron/worker.
- Live routing authority enforced **only on BSC Testnet chain 97** (`isKerlRoutingAuthorityEnforced`).
- On **mainnet (56)** Smart Swap does **not** use KERL for quotes or execution.
- On 97, KERL **replaces** Smart Router quotes and executes via MelegaSmartRouterWrapper for certified pairs — still **Melega-only** liquidity.
- `kerl-signing-gate` documented but **missing** from the repository.
- **ACTIVE Treasury Runtime dependencies = 0** (handoff is a documented no-op; never calls `treasury.melega.ai`).

### Smart Swap

- Entry: `SmartSwapForm` (Trade / Swap / Home / Project embed).
- Quotes: client-side `@pancakeswap/smart-router` over **Melega factory pairs** (+ hardcoded stable-pool address list).
- HTTP `/smartRouter` quote API exists but is **disabled** in `useBestTrade.ts`.
- Execution routers: Melega V2 `0xc250…EAB3` or Smart Router `0xC666…28B0`.
- Signer: **user wallet only**. No server signer. No managed wallet. No Treasury Runtime.

### DEX coverage

| DEX | Executable in Smart Swap? |
| --- | --- |
| Melega DEX | Yes |
| PancakeSwap (general) | No (label + limited hardcoded stables only) |
| Uniswap / Thena / Biswap / ApeSwap / Sushi | No |

### Route quality conclusion

**MELEGA_ONLY_ROUTER** — internal Smart-vs-V2 comparison on Melega liquidity, not a true multi-DEX aggregator.

### Product truth

UI copy such as “Best Route Found” / “best available multichain route” **overclaims** measured backend capability (mismatch documented in `smart-swap-product-truth.json`).

## KEEP vs DECOMMISSION

KEEP requires unique routing intelligence, better execution, multi-DEX aggregation, no TR dependency, maintainability.

Measured: only the TR-independence gate passes. KERL fails unique intelligence / aggregation / mainnet execution-quality / maintainability gates, and meets DECOMMISSION gates (Melega-only, complexity, unused on mainnet routing).

## Target architecture (Option B)

```
Smart Swap
  → Aggregator/Router (@pancakeswap/smart-router over Melega pairs)
  → Execution Router (V2 or Smart Router)
  → Wallet
```

This audit does **not** delete KERL or expand Smart Swap. It records the evidence-based decision only.

## Gates

- Audit tests: see `tests.json`
- Production code: **untouched**
- Evidence-only commit
