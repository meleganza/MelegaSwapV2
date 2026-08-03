# MELEGASWAP_V2_MULTICHAIN_FOUNDATION_AND_BASE_REACTIVATION

**Baseline:** `melegaswap-v2-release-readiness-p0-market-and-discovery` @ `f1e4fbb5`  
**Branch:** `melegaswap-v2-multichain-foundation-and-base-reactivation`  
**Date:** 2026-08-03

## Verdict

**MELEGASWAP_V2_BASE_CHAIN_READY**

## Status matrix

| Chain | Status | Swap | Farms | Pools | Tokens | Liquidity Builder |
|------|--------|------|-------|-------|--------|-------------------|
| BNB (56) | LIVE | ✓ | ✓ | ✓ | ✓ | ✓ BETA |
| Base (8453) | LIVE | ✓ (Melega V2) | ✓ | ✓ | ✓ | ✗ BNB-only |
| Polygon (137) | PREPARING | — | — | — | — | — |
| Ethereum (1) | PREPARING | — | — | — | — | — |
| Avalanche (43114) | PREPARING | — | — | — | — | — |

## What shipped

### A — Failure classification
`preexisting-test-failure-classification.json` — no real swap/wallet/chain/farms/pools runtime regressions blocking Base LIVE. Stale copy / fixture / legacy surfaces left alone.

### B — Canonical registry
`apps/web/src/config/melegaChainRegistry.ts` — single SSOT for status, capabilities, contracts. No duplicate registries. Missing address ⇒ capability disabled.

### C — Base contracts (on-chain)
All founder addresses have bytecode on Base; `router.factory()` returns expected Factory. See `base-contract-validation.json`.

### D — Router SSOT
`packages/smart-router/.../ROUTER_ADDRESS[BASE]` was blank → set to `0x1B30D213…994e5` matching web + registry. Trade bases filled for Base.

### E — Tokens
23 Base entries in default tokenlist; 24 local logos under `/images/8453/tokens/`; chain-scoped avatar paths (no BNB fallback).

### F — Smart Swap / fee
- Execution on Base uses **Melega V2 Router** via Instant/`fallbackV2` (Pancake Smart Router not deployed on Base).
- Fee economics unchanged (25% / 2500 bps). Settlement asset is chain-native: BNB on 56, ETH on 8453, same MELEGA TREASURY EOA.
- `DEX_ECONOMIC_AUTHORITY.chainIdsSupported` includes 8453.
- `getAddress` no longer falls back to BSC for missing maps.

### G — Farms / Pools
30 Base farms + `livePools8453` inventory; Explore Farms uses registry LIVE farm capability (56 + 8453); chain badges already present.

### H — Chain selector
LIVE switchable: BNB + Base. PREPARING (Polygon / Ethereum / Avalanche) shown as disabled “Coming soon”.

### I — Liquidity Builder
Unchanged: BETA + BNB Chain only; hidden off-BSC.

## Forbidden surfaces untouched
LB contracts, Create Token Factory, Public Farm Factory, Treasury Runtime, KERL, Smart Swap fee bps.

## Gates
- Mission-scoped tests: PASS (see `tests.json`)
- `next build`: see `build.json`
- Full suite: not claimed green (pre-existing failures classified)
