# Mission Report — Treasury Runtime Decommission & Direct Fee Authority Seal

**Mission ID:** `MELEGA_DEX_V1_TREASURY_RUNTIME_DECOMMISSION_AND_DIRECT_FEE_AUTHORITY_SEAL`  
**Verdict:** `MELEGA_DEX_V1_TREASURY_RUNTIME_DECOMMISSION_AND_DIRECT_FEE_AUTHORITY_SEAL_CERTIFIED`

## Git

| Field | Value |
|---|---|
| Base commit | `c58294e8` |
| Branch | `melega-dex-v1-treasury-runtime-decommission-and-direct-fee-authority-seal` |
| Merge / deploy | Not performed |

## What changed

1. **Canonical authority** — `apps/web/src/config/dexEconomicAuthority.ts` is the single source of truth for MELEGA TREASURY WALLET `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` and Treasury Runtime `DECOMMISSIONED` / `authority: NONE` / `runtime_dependency: false`.
2. **Smart Swap fee UI** — Removed “Treasury Runtime”, “Allocated through…”, and “KERL attribution”. Required model: Protocol fee (only when proven) · Fee destination · Execution (non-custodial).
3. **Fee honesty** — Protocol fee collection is **not** proven on mainnet (wrapper undeployed). Unproven amounts are not displayed as collected.
4. **Handoff / API** — `submitSettlementHandoff` never fetches; `/api/treasury/settlement-events` returns `410 TREASURY_RUNTIME_DECOMMISSIONED` with no upstream proxy to `treasury.melega.ai`.
5. **Collector resolution** — Mainnet always resolves to the canonical wallet via `dex-economic-authority`; divergent env overrides are ignored.
6. **Authority metadata** — FSC-01 owner, registries, civilization-router, KERL constitutional, activation surfaces updated to decommissioned / NONE.

## Validation

- Focused authority / Swap / Smart Swap / forbidden-reference tests: **69/69 PASS**
- TypeScript production build (`next build`): **PASS**
- Forbidden files (exchange/contracts/router/wallet/swap math/farms/pools/NFT): **untouched**
- Top Movers / Home Featured / Liquidity / Farms / Pools / List / Passport / Project layouts: **untouched**

## Fee path (measured)

| Question | Answer |
|---|---|
| Smart Swap fee source (display) | Unproven — D87 policy exists but `feeCollectionProven=false` |
| Smart Swap fee destination (disclosure) | MELEGA TREASURY WALLET `0xb643…F65b` |
| Calldata fee transfer | Not separately identifiable; wrapper undeployed on chain 56 |
| Immutable blocker | MelegaSmartRouterWrapper not deployed on mainnet — cannot collect protocol fee on-chain without deploy (out of scope) |

## Inventory summary

See `treasury-runtime-reference-inventory.json`.

## Vercel cleanup (manual)

1. Remove `TREASURY_RUNTIME_URL`
2. Remove `NEXT_PUBLIC_TREASURY_RUNTIME_URL`
3. Ensure `NEXT_PUBLIC_TREASURY_COLLECTOR_BSC` is unset or equals the canonical wallet
